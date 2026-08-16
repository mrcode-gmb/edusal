import logging
from typing import Any, Dict, List, Optional
from pgvector.django import CosineDistance

from edusal.institutions.models import InstitutionalDocumentChunk
from .embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class VectorSearchService:
    """Hybrid pgvector and keyword search engine for institutional handbooks and policies."""

    @classmethod
    def search_chunks(
        cls,
        query: str,
        institution_id: str,
        division_id: Optional[str] = None,
        department_id: Optional[str] = None,
        session_id: Optional[str] = None,
        doc_type: Optional[str] = None,
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Performs scoped hybrid retrieval over institutional document chunks.
        Strictly enforces tenant boundary: document__institution_id == institution_id.
        """
        if not query.strip() or not institution_id:
            return []

        # 1. Base QuerySet restricted strictly to the institution
        qs = InstitutionalDocumentChunk.objects.filter(
            document__institution_id=institution_id
        ).select_related("document", "document__institution", "document__division", "document__department")

        # 2. Hierarchical scoping filters
        if division_id:
            qs = qs.filter(document__division_id=division_id)
        if department_id:
            qs = qs.filter(document__department_id=department_id)
        if session_id:
            qs = qs.filter(document__session_id=session_id)
        if doc_type:
            qs = qs.filter(document__doc_type=doc_type)

        if not qs.exists():
            return []

        # 3. Dense Vector Cosine Similarity
        query_vector = EmbeddingService.embed_query(query)
        vector_results = []
        try:
            # Order by pgvector cosine distance (smaller distance = higher similarity)
            vector_qs = qs.exclude(embedding__isnull=True).annotate(
                distance=CosineDistance("embedding", query_vector)
            ).order_by("distance")[: top_k * 2]

            for chunk in vector_qs:
                dist = getattr(chunk, "distance", 1.0)
                sim = max(0.0, 1.0 - (dist if dist is not None else 1.0))
                vector_results.append((chunk, sim))
        except Exception as e:
            logger.warning(f"pgvector distance query fallback: {e}")

        # 4. Keyword / Exact Token Match Score (for course codes like SWE 401, ITCC Form 08)
        query_terms = [t.lower() for t in query.split() if len(t) > 2]
        keyword_results = []
        for chunk in qs:
            content_lower = chunk.content.lower()
            section_lower = chunk.section_reference.lower()
            title_lower = chunk.document.title.lower()

            kw_score = 0.0
            for term in query_terms:
                if term in section_lower:
                    kw_score += 0.4
                if term in content_lower:
                    kw_score += 0.2
                if term in title_lower:
                    kw_score += 0.3

            if kw_score > 0:
                keyword_results.append((chunk, min(1.0, kw_score)))

        # 5. Hybrid Fusion (Combine Vector Similarity + Keyword Match)
        combined_scores: Dict[str, Dict[str, Any]] = {}

        for chunk, v_score in vector_results:
            combined_scores[str(chunk.id)] = {
                "chunk": chunk,
                "score": v_score * 0.7,  # 70% vector weight
            }

        for chunk, k_score in keyword_results:
            cid = str(chunk.id)
            if cid in combined_scores:
                combined_scores[cid]["score"] += k_score * 0.3
            else:
                combined_scores[cid] = {
                    "chunk": chunk,
                    "score": k_score * 0.5,
                }

        # Fallback if no vector/keyword scored above zero (take first N)
        if not combined_scores:
            for chunk in qs[:top_k]:
                combined_scores[str(chunk.id)] = {"chunk": chunk, "score": 0.3}

        # Sort descending by fused relevance score
        sorted_items = sorted(
            combined_scores.values(), key=lambda x: x["score"], reverse=True
        )[:top_k]

        # 6. Format standardized citation records
        formatted_results = []
        for item in sorted_items:
            chunk: InstitutionalDocumentChunk = item["chunk"]
            score = round(min(0.99, max(0.10, item["score"])), 3)
            citation_str = (
                f"{chunk.document.title}, {chunk.section_reference or f'Page {chunk.page_number}'} (p. {chunk.page_number})"
            )

            formatted_results.append({
                "chunk_id": str(chunk.id),
                "document_id": str(chunk.document.id),
                "document_title": chunk.document.title,
                "doc_type": chunk.document.doc_type,
                "doc_type_display": chunk.document.get_doc_type_display(),
                "page_number": chunk.page_number,
                "section_reference": chunk.section_reference,
                "content": chunk.content,
                "relevance_score": score,
                "citation": citation_str,
            })

        return formatted_results
