import pytest
from rest_framework import status
from rest_framework.test import APIClient
from edusal.institutions.models import (
    Institution,
    InstitutionType,
    RegulatorType,
    AcademicDivision,
    Department,
    AcademicProgram,
    AwardLevel,
    InstitutionalDocument,
    InstitutionalDocumentChunk,
    DocumentType,
    EmbeddingStatus,
)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def sample_institution(db):
    inst = Institution.objects.create(
        name="University of Ilorin",
        short_name="UNILORIN",
        slug="unilorin",
        institution_type=InstitutionType.UNIVERSITY,
        regulator=RegulatorType.NUC,
        state="Kwara",
    )
    div = AcademicDivision.objects.create(
        institution=inst,
        name="Faculty of Physical Sciences",
        code="FPS",
    )
    dept = Department.objects.create(
        institution=inst,
        division=div,
        name="Department of Mathematics",
        code="MTH",
    )
    AcademicProgram.objects.create(
        institution=inst,
        department=dept,
        name="B.Sc. Mathematics",
        award_level=AwardLevel.BSC,
        duration_years=4,
    )
    doc = InstitutionalDocument.objects.create(
        institution=inst,
        division=div,
        department=dept,
        title="UNILORIN Student Handbook 2026",
        doc_type=DocumentType.STUDENT_HANDBOOK,
        chunk_count=1,
        embedding_status=EmbeddingStatus.INDEXED,
    )
    InstitutionalDocumentChunk.objects.create(
        document=doc,
        chunk_index=0,
        page_number=12,
        section_reference="Section 3: Course Registration",
        content="All mathematics majors must complete continuous assessment before semester examinations.",
    )
    return inst


@pytest.mark.django_db
class TestInstitutionsAPI:
    def test_list_institutions(self, api_client, sample_institution):
        response = api_client.get("/api/institutions/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= 1
        assert any(i["slug"] == "unilorin" for i in data)

    def test_retrieve_institution_detail(self, api_client, sample_institution):
        response = api_client.get(f"/api/institutions/{sample_institution.id}/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "University of Ilorin"
        assert len(data["divisions"]) == 1

    def test_institution_tree_endpoint(self, api_client, sample_institution):
        response = api_client.get(f"/api/institutions/{sample_institution.id}/tree/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "University of Ilorin"
        assert len(data["divisions"]) == 1
        assert data["divisions"][0]["name"] == "Faculty of Physical Sciences"
        assert len(data["divisions"][0]["departments"]) == 1
        assert data["divisions"][0]["departments"][0]["name"] == "Department of Mathematics"
        assert len(data["divisions"][0]["departments"][0]["programs"]) == 1

    def test_governance_summary_endpoint(self, api_client, sample_institution):
        response = api_client.get(f"/api/institutions/{sample_institution.id}/governance-summary/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["hierarchy_metrics"]["total_divisions"] == 1
        assert data["hierarchy_metrics"]["total_departments"] == 1
        assert data["hierarchy_metrics"]["total_programs"] == 1
        assert data["knowledge_base"]["total_documents"] == 1

    def test_document_search_endpoint(self, api_client, sample_institution):
        response = api_client.post(
            f"/api/institutions/{sample_institution.id}/search-documents/",
            {"query": "mathematics course registration"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total_matches"] >= 1
        assert "UNILORIN Student Handbook 2026" in data["results"][0]["document_title"]

    def test_create_division_and_department(self, api_client, sample_institution):
        # Create new division
        div_res = api_client.post(
            "/api/divisions/",
            {
                "institution": str(sample_institution.id),
                "name": "Faculty of Engineering & Technology",
                "code": "FET",
                "division_type": "FACULTY",
            },
            format="json",
        )
        assert div_res.status_code == status.HTTP_201_CREATED
        div_id = div_res.json()["id"]

        # Create department under new division
        dept_res = api_client.post(
            "/api/departments/",
            {
                "institution": str(sample_institution.id),
                "division": div_id,
                "name": "Department of Mechanical Engineering",
                "code": "MEE",
                "siwes_eligible": True,
            },
            format="json",
        )
        assert dept_res.status_code == status.HTTP_201_CREATED
        assert dept_res.json()["code"] == "MEE"
