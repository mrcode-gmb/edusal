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
    Pathway,
    PathwayMilestone,
    MilestoneType,
    VerificationMethod,
    RequiredEvidenceType,
    TemplateVisibility,
)
from edusal.institutions.services.pathway_template_service import PathwayTemplateService


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def pathway_env(db):
    inst1 = Institution.objects.create(
        name="Federal University of Technology, Minna",
        short_name="FUTMinna",
        slug="futminna-test",
        institution_type=InstitutionType.UNIVERSITY,
        regulator=RegulatorType.NUC,
        state="Niger",
    )
    div1 = AcademicDivision.objects.create(
        institution=inst1,
        name="School of ICT",
        code="SICT",
    )
    dept_swe = Department.objects.create(
        institution=inst1,
        division=div1,
        name="Software Engineering",
        code="SWE",
    )
    dept_csc = Department.objects.create(
        institution=inst1,
        division=div1,
        name="Computer Science",
        code="CSC",
    )
    prog_swe = AcademicProgram.objects.create(
        institution=inst1,
        department=dept_swe,
        name="B.Tech Software Engineering",
        award_level=AwardLevel.BTECH,
        duration_years=5,
    )
    prog_csc = AcademicProgram.objects.create(
        institution=inst1,
        department=dept_csc,
        name="B.Tech Computer Science",
        award_level=AwardLevel.BTECH,
        duration_years=5,
    )

    # Secondary Institution for isolation tests
    inst2 = Institution.objects.create(
        name="Gombe State University",
        short_name="GSU",
        slug="gsu-test",
        institution_type=InstitutionType.UNIVERSITY,
        regulator=RegulatorType.NUC,
        state="Gombe",
    )
    div2 = AcademicDivision.objects.create(
        institution=inst2,
        name="Faculty of Science",
        code="FOS",
    )
    dept_gsu_cs = Department.objects.create(
        institution=inst2,
        division=div2,
        name="Computer Science",
        code="CSC",
    )
    prog_gsu_cs = AcademicProgram.objects.create(
        institution=inst2,
        department=dept_gsu_cs,
        name="B.Sc. Computer Science",
        award_level=AwardLevel.BSC,
        duration_years=4,
    )

    return {
        "inst1": inst1,
        "prog_swe": prog_swe,
        "prog_csc": prog_csc,
        "inst2": inst2,
        "prog_gsu_cs": prog_gsu_cs,
    }


@pytest.mark.django_db
class TestPathwaysAndTemplateCloning:
    def test_create_pathway_and_milestones(self, api_client, pathway_env):
        env = pathway_env

        # 1. Create Pathway via API
        res = api_client.post(
            "/api/pathways/",
            {
                "institution": str(env["inst1"].id),
                "program": str(env["prog_swe"].id),
                "title": "Cloud Architecture & Microservices",
                "career_role": "Cloud Solutions Architect",
                "industry_sector": "Cloud Infrastructure",
                "description": "Comprehensive cloud engineering pathway.",
                "target_cgpa_recommendation": "3.50",
            },
            format="json",
        )
        assert res.status_code == status.HTTP_201_CREATED
        pathway_id = res.json()["id"]

        # 2. Add Milestones
        m1_res = api_client.post(
            "/api/milestones/",
            {
                "pathway": pathway_id,
                "order_index": 0,
                "year_of_study": 1,
                "target_level_code": "100",
                "target_semester": "FIRST",
                "title": "Linux Kernel & Bash Scripting",
                "description": "Automate system routines.",
                "milestone_type": "TECHNICAL_SKILL",
                "points": 100,
                "verification_method": "URL_VERIFICATION",
                "required_evidence_type": "GITHUB_REPO",
                "competency_tags": ["Linux", "Bash"],
            },
            format="json",
        )
        assert m1_res.status_code == status.HTTP_201_CREATED

        m2_res = api_client.post(
            "/api/milestones/",
            {
                "pathway": pathway_id,
                "order_index": 1,
                "year_of_study": 2,
                "target_level_code": "200",
                "target_semester": "SECOND",
                "title": "Docker Multi-Container Orchestration",
                "description": "Deploy distributed services.",
                "milestone_type": "TECHNICAL_SKILL",
                "points": 150,
                "verification_method": "URL_VERIFICATION",
                "required_evidence_type": "LIVE_URL",
                "competency_tags": ["Docker", "Containers"],
            },
            format="json",
        )
        assert m2_res.status_code == status.HTTP_201_CREATED

        # 3. Retrieve Pathway and verify automatic points recalculation
        get_res = api_client.get(f"/api/pathways/{pathway_id}/")
        assert get_res.status_code == status.HTTP_200_OK
        data = get_res.json()
        assert data["total_milestones_count"] == 2
        assert data["total_points"] == 250  # 100 + 150
        assert len(data["milestones"]) == 2

    def test_template_blueprint_cloning(self, api_client, pathway_env):
        env = pathway_env

        # 1. Create a Master Blueprint Pathway in FUTMinna SWE
        master_template = Pathway.objects.create(
            institution=env["inst1"],
            program=env["prog_swe"],
            title="Master AI Engineering Blueprint",
            career_role="AI / ML Engineer",
            industry_sector="Artificial Intelligence",
            description="Official master blueprint for AI engineering.",
            is_active=True,
            is_template=True,
            template_visibility=TemplateVisibility.NATIONAL_CATALOG,
        )

        m1 = PathwayMilestone.objects.create(
            pathway=master_template,
            order_index=0,
            year_of_study=1,
            target_level_code="100",
            title="Python Numerical Foundations (NumPy/Pandas)",
            description="Master vector operations and dataframe manipulation.",
            points=100,
            competency_tags=["Python", "NumPy", "Pandas"],
        )
        m2 = PathwayMilestone.objects.create(
            pathway=master_template,
            order_index=1,
            year_of_study=2,
            target_level_code="200",
            title="Supervised & Unsupervised Machine Learning",
            description="Train scikit-learn models with validation curves.",
            points=150,
            competency_tags=["Scikit-Learn", "Model Evaluation"],
        )
        m3 = PathwayMilestone.objects.create(
            pathway=master_template,
            order_index=2,
            year_of_study=3,
            target_level_code="300",
            title="Deep Learning with PyTorch & SIWES Preparation",
            description="Build CNN and Transformer architectures.",
            points=200,
            competency_tags=["PyTorch", "Transformers", "SIWES"],
        )
        master_template.recalculate_totals()
        assert master_template.total_points == 450
        assert master_template.total_milestones_count == 3

        # 2. Another Counsellor (e.g. from GSU B.Sc. Computer Science) clones this blueprint
        clone_res = api_client.post(
            f"/api/pathways/{master_template.id}/clone/",
            {
                "target_program": str(env["prog_gsu_cs"].id),
                "custom_title": "GSU Applied AI & Machine Learning Track",
                "custom_description": "Tailored for GSU Computer Science students.",
            },
            format="json",
        )
        assert clone_res.status_code == status.HTTP_201_CREATED
        cloned_data = clone_res.json()

        assert cloned_data["title"] == "GSU Applied AI & Machine Learning Track"
        assert cloned_data["program"] == str(env["prog_gsu_cs"].id)
        assert cloned_data["institution"] == str(env["inst2"].id)
        assert cloned_data["is_template"] is False
        assert cloned_data["cloned_from"] == str(master_template.id)
        assert cloned_data["total_milestones_count"] == 3
        assert cloned_data["total_points"] == 450
        assert len(cloned_data["milestones"]) == 3
        assert cloned_data["milestones"][0]["title"] == "Python Numerical Foundations (NumPy/Pandas)"

        # 3. Modify milestone on cloned pathway without affecting master template
        cloned_m1_id = cloned_data["milestones"][0]["id"]
        patch_res = api_client.patch(
            f"/api/milestones/{cloned_m1_id}/",
            {"points": 120, "title": "GSU Python & Data Structures Specialization"},
            format="json",
        )
        assert patch_res.status_code == status.HTTP_200_OK

        # Verify Master Template remains untouched
        master_template.refresh_from_db()
        assert master_template.total_points == 450
        m1.refresh_from_db()
        assert m1.points == 100
        assert m1.title == "Python Numerical Foundations (NumPy/Pandas)"

    def test_publish_as_template_and_catalog(self, api_client, pathway_env):
        env = pathway_env

        # 1. Create a custom pathway
        custom_pw = Pathway.objects.create(
            institution=env["inst1"],
            program=env["prog_csc"],
            title="Cybersecurity Blue Team Operations",
            career_role="SOC Analyst",
            description="Defense pathway.",
            is_template=False,
        )
        PathwayMilestone.objects.create(
            pathway=custom_pw,
            order_index=0,
            year_of_study=1,
            title="Network Protocol Analysis (Wireshark)",
            points=100,
        )
        custom_pw.recalculate_totals()

        # 2. Publish as template
        pub_res = api_client.post(
            f"/api/pathways/{custom_pw.id}/publish-as-template/",
            {"visibility": "NATIONAL_CATALOG"},
            format="json",
        )
        assert pub_res.status_code == status.HTTP_200_OK
        assert pub_res.json()["is_template"] is True
        assert pub_res.json()["template_visibility"] == "NATIONAL_CATALOG"

        # 3. Test Template Catalog Endpoint
        catalog_res = api_client.get("/api/pathways/templates/?award_level=BTECH")
        assert catalog_res.status_code == status.HTTP_200_OK
        catalog = catalog_res.json()
        assert any(item["id"] == str(custom_pw.id) for item in catalog)
