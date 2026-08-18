import logging
import time
from typing import Any, Dict, List, Optional
from django.conf import settings
from groq import Groq

from .vector_search_service import VectorSearchService

logger = logging.getLogger(__name__)


class GroqAdvisorService:
    """Zero-hallucination institutional advisor service powered by Groq Cloud LLM."""

    @classmethod
    def get_groq_client(cls) -> Optional[Groq]:
        """Initializes Groq client with API key from settings."""
        api_key = getattr(settings, "GROQ_API_KEY", None)
        if not api_key or api_key.startswith("your-") or len(api_key) < 10:
            logger.warning("GROQ_API_KEY is not configured.")
            return None
        return Groq(api_key=api_key)

    @classmethod
    def ask_advisor(
        cls,
        query: str,
        institution,
        division=None,
        department=None,
        session=None,
        doc_type: Optional[str] = None,
        top_k: int = 5,
    ) -> Dict[str, Any]:
        """
        Executes a zero-hallucination RAG query against institutional handbooks
        and synthesizes a verified answer using Groq Llama-3.3-70B / Llama-3.1-8B.
        """
        start_time = time.time()

        # 1. Retrieve top grounded context chunks from pgvector
        inst_id = str(institution.id) if hasattr(institution, "id") else str(institution)
        div_id = str(division.id) if division and hasattr(division, "id") else division
        dept_id = str(department.id) if department and hasattr(department, "id") else department
        sess_id = str(session.id) if session and hasattr(session, "id") else session

        chunks = VectorSearchService.search_chunks(
            query=query,
            institution_id=inst_id,
            division_id=div_id,
            department_id=dept_id,
            session_id=sess_id,
            doc_type=doc_type,
            top_k=top_k,
        )

        institution_name = getattr(institution, "name", "the Institution")
        regulator_name = getattr(institution, "regulator", "NUC")
        tier_two = getattr(institution, "tier_two_term", "Faculty")

        # 2. Build Context String with Source Indices
        if not chunks:
            latency_ms = int((time.time() - start_time) * 1000)
            return {
                "answer": (
                    f"No official handbooks, SIWES calendars, or departmental guidelines have been "
                    f"uploaded and indexed for **{institution_name}** matching this query yet. "
                    f"Please upload the relevant student handbook or curriculum guideline in the Knowledge Base to enable AI policy advisory."
                ),
                "citations": [],
                "telemetry": {
                    "model": "rule-based-fallback",
                    "latency_ms": latency_ms,
                    "total_tokens": 0,
                    "chunks_retrieved": 0,
                },
                "scope": {
                    "institution": institution_name,
                    "division": getattr(division, "name", None),
                    "department": getattr(department, "name", None),
                },
            }

        context_blocks = []
        citations = []

        for idx, ch in enumerate(chunks):
            source_num = idx + 1
            citation_label = f"[{source_num}]"
            context_blocks.append(
                f"Source {citation_label}:\n"
                f"Document: {ch['document_title']}\n"
                f"Section: {ch['section_reference'] or 'General'}\n"
                f"Page: {ch['page_number']}\n"
                f"Excerpt:\n{ch['content']}\n"
            )
            citations.append({
                "source_index": source_num,
                "citation_label": citation_label,
                "chunk_id": ch["chunk_id"],
                "document_id": ch["document_id"],
                "document_title": ch["document_title"],
                "doc_type_display": ch["doc_type_display"],
                "page_number": ch["page_number"],
                "section_reference": ch["section_reference"],
                "content_snippet": ch["content"][:280] + ("..." if len(ch["content"]) > 280 else ""),
                "relevance_score": ch["relevance_score"],
            })

        grounding_context = "\n---\n".join(context_blocks)

        # 3. Assemble Strict Zero-Hallucination System Prompt
        system_prompt = (
            f"You are the Official AI Academic & Career Advisor for {institution_name}, "
            f"operating under the regulatory framework of {regulator_name} (Nigeria).\n\n"
            f"CRITICAL GROUNDING RULES:\n"
            f"1. You must answer the user's inquiry strictly based on the verified institutional document excerpts provided below.\n"
            f"2. Every factual statement or policy requirement you provide MUST cite its source using inline bracket tags like [1], [2] corresponding to the provided sources.\n"
            f"3. Do NOT hallucinate, assume, or extrapolate university regulations. If the answer is not contained in the excerpts, clearly state that this specific policy is not mentioned in the uploaded institutional documents.\n"
            f"4. Format your response cleanly using markdown (bullet points, bold text for key prerequisites, structured steps).\n"
            f"5. Maintain a professional, authoritative, and helpful educational advisor tone."
        )

        user_prompt = (
            f"Institutional Context: {institution_name} (Native Tier-2: {tier_two})\n\n"
            f"Verified Institutional Handbooks & Excerpts:\n"
            f"{grounding_context}\n\n"
            f"User Question:\n{query}\n\n"
            f"Provide a direct, authoritative, grounded answer with inline citations [1], [2]."
        )

        client = cls.get_groq_client()
        model_name = getattr(settings, "GROQ_DEFAULT_MODEL", "llama-3.3-70b-versatile")
        fast_model = getattr(settings, "GROQ_FAST_MODEL", "llama-3.1-8b-instant")

        answer_text = ""
        total_tokens = 0

        if client is not None:
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.2,
                    max_completion_tokens=1500,
                )
                answer_text = response.choices[0].message.content or ""
                if response.usage:
                    total_tokens = response.usage.total_tokens
            except Exception as e:
                logger.warning(f"Primary Groq model {model_name} failed: {e}. Trying fallback {fast_model}...")
                try:
                    fallback_res = client.chat.completions.create(
                        model=fast_model,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        temperature=0.2,
                        max_completion_tokens=1200,
                    )
                    answer_text = fallback_res.choices[0].message.content or ""
                    model_name = fast_model
                    if fallback_res.usage:
                        total_tokens = fallback_res.usage.total_tokens
                except Exception as ex2:
                    logger.error(f"Fallback Groq model failed: {ex2}")
                    answer_text = cls._build_heuristic_answer(query, chunks, institution_name)
                    model_name = "heuristic-citation-engine"

        else:
            answer_text = cls._build_heuristic_answer(query, chunks, institution_name)
            model_name = "local-grounded-summary"

        latency_ms = int((time.time() - start_time) * 1000)

        return {
            "answer": answer_text,
            "citations": citations,
            "telemetry": {
                "model": model_name,
                "latency_ms": latency_ms,
                "total_tokens": total_tokens,
                "chunks_retrieved": len(chunks),
            },
            "scope": {
                "institution": institution_name,
                "division": getattr(division, "name", None),
                "department": getattr(department, "name", None),
            },
        }

    @classmethod
    def _build_heuristic_answer(cls, query: str, chunks: List[Dict[str, Any]], institution_name: str) -> str:
        """Heuristic summarizer if LLM API is unreachable."""
        bullets = []
        for idx, ch in enumerate(chunks):
            bullets.append(
                f"- **{ch['section_reference'] or f'Page {ch['page_number']}'}** [{idx + 1}]: {ch['content'][:250]}..."
            )
        return (
            f"Based on the official documents for **{institution_name}**, the following relevant guidelines were retrieved:\n\n"
            + "\n".join(bullets)
        )
