import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from rest_framework import status
from rest_framework.test import APIClient

from edusal.institutions.models import (
    Institution,
    InstitutionType,
    RegulatorType,
    AcademicDivision,
    Department,
    AcademicProgram,
    AcademicSession,
    AwardLevel,
    Pathway,
    PathwayMilestone,
    StudentProfile,
    StudentMilestoneSubmission,
    SubmissionStatus,
)
from edusal.institutions.services.student_credential_service import StudentCredentialService

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def student_test_env(db):
    inst = Institution.objects.create(
        name="Federal University of Technology, Minna",
        short_name="FUTMinna",
        slug="futminna-test-sd",
        institution_type=InstitutionType.UNIVERSITY,
        regulator=RegulatorType.NUC,
        state="Niger",
    )
    session = AcademicSession.objects.create(
        institution=inst,
        session_label="2025/2026",
        is_current=True,
    )
    div = AcademicDivision.objects.create(
        institution=inst,
        name="School of ICT",
        code="SICT",
    )
    dept = Department.objects.create(
        institution=inst,
        division=div,
        name="Software Engineering",
        code="SWE",
    )
    prog = AcademicProgram.objects.create(
        institution=inst,
        department=dept,
        name="B.Tech Software Engineering",
        award_level=AwardLevel.BTECH,
        duration_years=5,
    )

    # Pathway & Milestones
    pw = Pathway.objects.create(
        institution=inst,
        program=prog,
        title="Full-Stack Cloud & DevOps Engineering",
        career_role="Software Engineer",
        description="Comprehensive roadmap",
        is_active=True,
    )
    m1 = PathwayMilestone.objects.create(
        pathway=pw,
        order_index=0,
        year_of_study=1,
        target_level_code="100",
        title="Git Version Control Mastery",
        description="Git workflow",
        points=100,
    )
    m2 = PathwayMilestone.objects.create(
        pathway=pw,
        order_index=1,
        year_of_study=2,
        target_level_code="200",
        title="PostgreSQL Schema Design",
        description="Database normalization",
        points=200,
    )
    pw.recalculate_totals()

    # Staff User
    u_staff = User.objects.create_user(
        email="hod.swe@futminna.edu.ng",
        name="Dr. Aminu Adebayo",
        password="testpassword123",
    )

    # Student User & Profile
    u_student = User.objects.create_user(
        email="student.test@futminna.edu.ng",
        name="Test Student",
        password="initialpassword123",
    )
    student = StudentProfile.objects.create(
        user=u_student,
        institution=inst,
        program=prog,
        entry_session=session,
        matric_number="2022/1/99999SWE",
        year_of_study=2,
        cgpa=4.00,
        active_pathway=pw,
    )
    student.recalculate_employability()

    return {
        "inst": inst,
        "prog": prog,
        "pw": pw,
        "m1": m1,
        "m2": m2,
        "u_staff": u_staff,
        "u_student": u_student,
        "student": student,
    }


@pytest.mark.django_db
class TestStudentDashboardAndCredentials:
    def test_credential_generation_and_email_dispatch(self, student_test_env):
        env = student_test_env
        student = env["student"]

        # Clear mailbox
        mail.outbox = []

        result = StudentCredentialService.generate_and_dispatch_credentials(
            student_profile_id=str(student.id),
            custom_password="EduSal-Test2026!",
        )

        assert result["email_sent"] is True
        assert result["plain_password"] == "EduSal-Test2026!"
        assert result["matric_number"] == "2022/1/99999SWE"

        # Verify User password was updated
        env["u_student"].refresh_from_db()
        assert env["u_student"].check_password("EduSal-Test2026!") is True

        # Verify email in Django outbox (simulating Mailpit)
        assert len(mail.outbox) == 1
        sent_mail = mail.outbox[0]
        assert "Your Student Portal Login Credentials" in sent_mail.subject
        assert sent_mail.to == ["student.test@futminna.edu.ng"]
        assert "EduSal-Test2026!" in sent_mail.body
        assert "2022/1/99999SWE" in sent_mail.body

    def test_student_evidence_submission_and_evaluation_flow(self, api_client, student_test_env):
        env = student_test_env
        student = env["student"]
        u_student = env["u_student"]
        u_staff = env["u_staff"]
        m1 = env["m1"]

        # 1. Student submits evidence for Milestone 1
        api_client.force_authenticate(user=u_student)
        sub_res = api_client.post(
            "/api/student-submissions/",
            {
                "milestone": str(m1.id),
                "evidence_url": "https://github.com/teststudent/git-mastery",
                "submission_notes": "Implemented feature branch workflow with semantic commits.",
            },
            format="json",
        )
        assert sub_res.status_code == status.HTTP_201_CREATED
        submission = StudentMilestoneSubmission.objects.get(student=student, milestone=m1)
        assert submission.status == SubmissionStatus.PENDING_REVIEW
        assert submission.points_awarded == 0

        # 2. Staff reviews and approves submission
        api_client.force_authenticate(user=u_staff)
        rev_res = api_client.post(
            f"/api/student-submissions/{submission.id}/review/",
            {
                "status": "VERIFIED",
                "points_awarded": 100,
                "review_feedback": "Well structured commits and clean pull request history.",
            },
            format="json",
        )
        assert rev_res.status_code == status.HTTP_200_OK
        data = rev_res.json()
        assert data["status"] == "VERIFIED"
        assert data["points_awarded"] == 100
        assert data["reviewed_by_name"] == "Dr. Aminu Adebayo"

        # 3. Verify Employability Score recalculated
        student.refresh_from_db()
        assert student.verified_points_total == 100
        assert student.milestones_completed_count == 1
        # Milestone: (100 / 300) * 70 = 23.33 | CGPA: (4.00 / 5.00) * 30 = 24.00 -> Total = 47.33%
        assert float(student.employability_score) == 47.33

    def test_student_dashboard_endpoint(self, api_client, student_test_env):
        env = student_test_env
        u_student = env["u_student"]
        student = env["student"]
        m1 = env["m1"]

        # Add verified submission
        StudentMilestoneSubmission.objects.create(
            student=student,
            milestone=m1,
            status=SubmissionStatus.VERIFIED,
            evidence_url="https://github.com/teststudent/git-mastery",
            points_awarded=100,
        )
        student.recalculate_employability()

        api_client.force_authenticate(user=u_student)
        dash_res = api_client.get("/api/students/me/dashboard/")
        assert dash_res.status_code == status.HTTP_200_OK
        dash_data = dash_res.json()

        assert dash_data["profile"]["matric_number"] == "2022/1/99999SWE"
        assert dash_data["active_pathway"]["title"] == "Full-Stack Cloud & DevOps Engineering"
        assert len(dash_data["submissions"]) == 1
        assert dash_data["employability_summary"]["employability_score"] == 47.33
        assert dash_data["employability_summary"]["tier"] == "Developing"
