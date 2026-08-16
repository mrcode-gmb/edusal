import logging
import time
from typing import Any, Dict, List, Optional
from django.conf import settings
from groq import Groq

from edusal.institutions.models import (
    StudentProfile,
    AICoachConversation,
    AICoachMessage,
    StudentAssessmentSession,
)
from .vector_search_service import VectorSearchService

logger = logging.getLogger(__name__)


class StudentAICoachService:
    """Zero-hallucination 24/7 AI Career Coach grounded strictly in institutional handbooks and student dossier."""

    @classmethod
    def get_groq_client(cls) -> Optional[Groq]:
        """Initializes Groq client with API key from settings."""
        api_key = getattr(settings, "GROQ_API_KEY", None)
        if not api_key or api_key.startswith("your-") or len(api_key) < 10:
            logger.warning("GROQ_API_KEY is not configured.")
            return None
        return Groq(api_key=api_key)

    @classmethod
    def assemble_student_dossier(cls, student: StudentProfile) -> Dict[str, Any]:
        """Builds a structured contextual snapshot of the student for prompt grounding."""
        # 1. Assessment summaries
        latest_assessments = (
            StudentAssessmentSession.objects.filter(student=student, status="COMPLETED")
            .select_related("assessment")
            .order_by("-completed_at")[:4]
        )
        assessment_briefs = []
        for sess in latest_assessments:
            assessment_briefs.append(
                f"- {sess.assessment.title}: {sess.summary_code} (Percentile: {sess.percentile_rank}%)"
            )

        # 2. Pathway Milestones summary
        pathway_info = "No active pathway enrolled"
        milestone_briefs = []
        if student.active_pathway:
            pathway = student.active_pathway
            pathway_info = f"{pathway.title} (Target Career Role: {pathway.career_role})"
            for m in pathway.milestones.all()[:6]:
                milestone_briefs.append(f"  * Step {m.order_index + 1} ({m.target_level_code}L): {m.title} ({m.points} pts)")

        return {
            "name": student.user.name or student.matric_number,
            "matric_number": student.matric_number,
            "institution": student.institution.name,
            "institution_short": student.institution.short_name,
            "department": student.program.department.name,
            "program": student.program.name,
            "level": student.get_level_display(),
            "year_of_study": student.year_of_study,
            "cgpa": f"{student.cgpa:.2f}" if student.cgpa else "N/A",
            "academic_standing": student.get_academic_standing_display(),
            "siwes_status": student.get_siwes_clearance_status_display(),
            "is_siwes_year": student.is_siwes_year,
            "employability_score": f"{student.employability_score:.1f}%",
            "verified_points": student.verified_points_total,
            "milestones_completed": student.milestones_completed_count,
            "pathway": pathway_info,
            "milestones": "\n".join(milestone_briefs) if milestone_briefs else "None",
            "assessments": "\n".join(assessment_briefs) if assessment_briefs else "No psychometric tests taken yet",
        }

    @classmethod
    def ask_coach(
        cls,
        conversation_id: str,
        user_message: str,
        top_k: int = 4,
    ) -> Dict[str, Any]:
        """
        Processes a student query:
        1. Retrieves student identity dossier.
        2. Retrieves pgvector grounded chunks from the student's institutional handbooks.
        3. Synthesizes an authoritative response via Groq Llama-3.3-70B with citations.
        4. Persists conversation messages and updates case brief.
        """
        start_time = time.time()

        conversation = (
            AICoachConversation.objects.select_related(
                "student",
                "student__user",
                "student__institution",
                "student__program",
                "student__program__department",
                "student__active_pathway",
            )
            .prefetch_related("student__active_pathway__milestones")
            .get(id=conversation_id)
        )
        student = conversation.student
        dossier = cls.assemble_student_dossier(student)

        # 1. Retrieve grounded institutional knowledge base chunks
        chunks = VectorSearchService.search_chunks(
            query=user_message,
            institution_id=str(student.institution_id),
            department_id=str(student.program.department_id),
            top_k=top_k,
        )

        context_blocks = []
        citations = []
        for idx, ch in enumerate(chunks):
            source_num = idx + 1
            citation_label = f"[{source_num}]"
            context_blocks.append(
                f"Source {citation_label}:\n"
                f"Document: {ch['document_title']}\n"
                f"Section: {ch['section_reference'] or 'General Guidelines'}\n"
                f"Page: {ch['page_number']}\n"
                f"Excerpt:\n{ch['content']}\n"
            )
            citations.append({
                "source_index": source_num,
                "citation_label": citation_label,
                "chunk_id": ch["chunk_id"],
                "document_title": ch["document_title"],
                "section_reference": ch["section_reference"],
                "page_number": ch["page_number"],
                "similarity_score": ch["similarity_score"],
            })

        grounding_text = "\n---\n".join(context_blocks) if context_blocks else "No institutional handbook chunks retrieved for this specific query."

        system_prompt = f"""
You are the 24/7 AI Career Coach & Academic Mentor for {dossier['institution']} ({dossier['institution_short']}), grounded strictly in the institution's official handbooks, SIWES calendars, course outlines, and career pathways.

STUDENT PROFILE & DOSSIER:
- Name: {dossier['name']}
- Matriculation Number: {dossier['matric_number']}
- Degree Programme: {dossier['program']} ({dossier['level']})
- Department: {dossier['department']}
- Cumulative GPA: {dossier['cgpa']} ({dossier['academic_standing']})
- SIWES Status: {dossier['siwes_status']} (SIWES Cohort: {dossier['is_siwes_year']})
- Accredited Employability Score: {dossier['employability_score']} ({dossier['verified_points']} verified points, {dossier['milestones_completed']} milestones completed)
- Active Career Pathway: {dossier['pathway']}
- Enrolled Pathway Deliverables:
{dossier['milestones']}
- Psychometric & Diagnostic Trait Profile:
{dossier['assessments']}

GROUNDED INSTITUTIONAL HANDBOOKS & GUIDELINES:
{grounding_text}

STRICT ADVISORY RULES:
1. Grounding: Rely strictly on the institutional excerpts above and the student's actual pathway milestones. Do NOT invent policies, stipends, or deadlines not supported by institutional documentation.
2. Citations: When referencing official policy, cite the source number using [1], [2] format.
3. Tone: Highly encouraging, rigorous, actionable, and tailored to Nigerian tertiary career frameworks (NUC/NBTE/NCCE standards, ITF SIWES requirements, and local tech employer expectations).
4. Practical Advice:
   - For CV / Cover Letter inquiries: Tailor advice specifically to their active pathway deliverables and verified milestone evidence (GitHub, Docker, PostgreSQL).
   - For SIWES / ITCC inquiries: Reference official logbook procedures, Form 08, monthly clearance, and departmental supervisor sign-offs.
5. Counsellor Referral: If the query requires an official academic waiver, grade remark, or special exemption, advise the student to book a 1-on-1 session with their Departmental Career Counsellor or HOD directly using the "Counsellor Sessions" tab.
        """.strip()

        # Build message history
        recent_messages = conversation.messages.order_by("created_at")[:8]
        messages_payload = [{"role": "system", "content": system_prompt}]
        for msg in recent_messages:
            messages_payload.append({"role": msg.role, "content": msg.content})
        messages_payload.append({"role": "user", "content": user_message})

        groq_client = cls.get_groq_client()
        answer_text = ""
        model_name = "llama-3.3-70b-versatile"
        tokens_used = 0

        if groq_client:
            try:
                response = groq_client.chat.completions.create(
                    model=model_name,
                    messages=messages_payload,
                    temperature=0.25,
                    max_tokens=1024,
                )
                answer_text = response.choices[0].message.content
                if response.usage:
                    tokens_used = response.usage.total_tokens
            except Exception as e:
                logger.error(f"Groq AI Coach API call failed: {e}")
                answer_text = (
                    f"Hello {dossier['name']}. Based on your {dossier['program']} roadmap and current "
                    f"{dossier['level']} status, please consult your official departmental handbook or schedule a 1-on-1 "
                    f"advisory session with your Departmental Counsellor for formal evaluation."
                )
                model_name = "offline-fallback"
        else:
            answer_text = (
                f"Hello {dossier['name']}. Welcome to the 24/7 Career Coach for {dossier['institution_short']}. "
                f"You are currently tracking **{dossier['pathway']}** with an Employability Score of **{dossier['employability_score']}**. "
                f"Please ensure all required technical repository links and SIWES Form 08 submissions are uploaded for counsellor sign-off."
            )
            model_name = "rule-based-system"

        latency_ms = int((time.time() - start_time) * 1000)
        telemetry = {
            "model": model_name,
            "latency_ms": latency_ms,
            "total_tokens": tokens_used,
            "chunks_retrieved": len(chunks),
        }

        # Persist messages in conversation
        AICoachMessage.objects.create(
            conversation=conversation,
            role="user",
            content=user_message,
        )
        assistant_msg = AICoachMessage.objects.create(
            conversation=conversation,
            role="assistant",
            content=answer_text,
            citations=citations,
            telemetry=telemetry,
        )

        # Update case summary for counsellor handoff
        conversation.case_summary = (
            f"• Student Query: {user_message[:120]}\n"
            f"• Pathway Stage: {dossier['pathway']} ({dossier['level']})\n"
            f"• Employability Quotient: {dossier['employability_score']} ({dossier['verified_points']} pts)"
        )
        conversation.save(update_fields=["case_summary", "updated_at"])

        return {
            "id": str(assistant_msg.id),
            "conversation_id": str(conversation.id),
            "role": "assistant",
            "content": answer_text,
            "citations": citations,
            "telemetry": telemetry,
            "created_at": assistant_msg.created_at.isoformat(),
        }
