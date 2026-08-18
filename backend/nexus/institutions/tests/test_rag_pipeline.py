import io
import pytest
from rest_framework import status
from rest_framework.test import APIClient

from nexus.institutions.models import (
    Institution,
    InstitutionType,
    RegulatorType,
    AcademicDivision,
    Department,
    AcademicSession,
    InstitutionalDocument,
    DocumentType,
    EmbeddingStatus,
)
from nexus.institutions.services.document_parser import DocumentParserService
from nexus.institutions.services.embedding_service import EmbeddingService
from nexus.institutions.services.vector_search_service import VectorSearchService
from nexus.institutions.services.groq_advisor_service import GroqAdvisorService


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def rag_institution(db):
    inst = Institution.objects.create(
        name="Federal University of Technology, Minna",
        short_name="FUTMinna",
        slug="futminna",
        institution_type=InstitutionType.UNIVERSITY,
        regulator=RegulatorType.NUC,
        state="Niger",
    )
    div = AcademicDivision.objects.create(
        institution=inst,
        name="School of Information and Communication Technology",
        code="SICT",
    )
    dept = Department.objects.create(
        institution=inst,
        division=div,
        name="Department of Software Engineering",
        code="SWE",
        siwes_eligible=True,
    )
    session = AcademicSession.objects.create(
        institution=inst,
        session_label="2025/2026",
        is_current=True,
    )
    return {
        "institution": inst,
        "division": div,
        "department": dept,
        "session": session,
    }


@pytest.mark.django_db
class TestRAGPipelineAndGroqAdvisor:
    def test_document_parser_and_chunker(self):
        sample_text = (
            "Section 4.1: General SIWES Regulations\n\n"
            "All 400-level engineering students must register with the ITCC unit.\n\n"
            "Section 4.2: Placement Prerequisites\n\n"
            "Pre-placement requirement: 300-level candidates must have signed endorsements in "
            "Relational Databases and Modular System Design prior to institutional referral."
        )
        raw_text, chunks, content_hash = DocumentParserService.parse_and_chunk(
            sample_text.encode("utf-8"), "siwes_manual.txt"
        )
        assert len(chunks) >= 1
        assert "sha256:" in content_hash
        assert chunks[0]["page_number"] == 1
        assert "Section" in chunks[0]["section_reference"]

    def test_embedding_service_dimensions(self):
        vector = EmbeddingService.embed_query("What are the 400L SWE requirements?")
        assert len(vector) == 384
        assert any(x != 0.0 for x in vector)

    def test_upload_document_and_vector_search(self, api_client, rag_institution):
        env = rag_institution
        sample_doc_content = (
            "Section 5.1: SIWES Clearance Criteria\n\n"
            "All Software Engineering candidates must complete 24 weeks of continuous industrial training. "
            "Candidates must submit monthly logbooks signed by an industry supervisor.\n\n"
            "Section 5.2: Final Year Capstone Project\n\n"
            "500-level students must defend their software architecture before the departmental board."
        )

        res = api_client.post(
            "/api/documents/upload/",
            {
                "institution": str(env["institution"].id),
                "division": str(env["division"].id),
                "department": str(env["department"].id),
                "session": str(env["session"].id),
                "title": "FUTMinna SWE SIWES & Capstone Guidelines 2026",
                "doc_type": "SIWES_CALENDAR",
                "raw_text": sample_doc_content,
            },
            format="json",
        )
        assert res.status_code == status.HTTP_201_CREATED
        doc_data = res.json()["document"]
        assert doc_data["chunk_count"] >= 1
        assert doc_data["embedding_status"] == EmbeddingStatus.INDEXED

        # Test Vector Search endpoint
        search_res = api_client.post(
            f"/api/institutions/{env['institution'].id}/search-documents/",
            {"query": "industrial training logbooks supervisor", "top_k": 3},
            format="json",
        )
        assert search_res.status_code == status.HTTP_200_OK
        search_data = search_res.json()
        assert search_data["total_matches"] >= 1
        assert "Section 5.1" in search_data["results"][0]["section_reference"]

    def test_ask_advisor_endpoint_with_citations(self, api_client, rag_institution):
        env = rag_institution

        # Upload handbook document
        api_client.post(
            "/api/documents/upload/",
            {
                "institution": str(env["institution"].id),
                "department": str(env["department"].id),
                "title": "SWE Departmental Handbook 2026",
                "doc_type": "STUDENT_HANDBOOK",
                "raw_text": (
                    "Section 3.2: CGPA Requirements for SIWES Clearance\n\n"
                    "Software engineering students must maintain a minimum CGPA of 2.50 to qualify for off-campus SIWES attachment. "
                    "Students on academic probation are suspended from attachment until cleared."
                ),
            },
            format="json",
        )

        # Query Advisor via API
        advisor_res = api_client.post(
            f"/api/institutions/{env['institution'].id}/ask-advisor/",
            {
                "query": "What is the minimum CGPA required for SIWES clearance in Software Engineering?",
                "department": str(env["department"].id),
            },
            format="json",
        )
        assert advisor_res.status_code == status.HTTP_200_OK
        advisor_data = advisor_res.json()
        assert "answer" in advisor_data
        assert len(advisor_data["citations"]) >= 1
        assert advisor_data["citations"][0]["document_title"] == "SWE Departmental Handbook 2026"
        assert "2.50" in advisor_data["answer"] or "CGPA" in advisor_data["answer"]
