import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework import status
from rest_framework.test import APIClient

from nexus.institutions.models import (
    Institution,
    InstitutionType,
    RegulatorType,
    TierTwoTerm,
    AcademicDivision,
    Department,
    AcademicProgram,
    AwardLevel,
    AcademicSession,
    StaffAssignment,
    StaffRoleAtUnit,
    StudentProfile,
    EntryMode,
    AcademicStanding,
    SIWESClearanceStatus,
)

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def academic_environment(db):
    inst = Institution.objects.create(
        name="Federal University of Technology, Minna",
        short_name="FUTMinna",
        slug="futminna",
        institution_type=InstitutionType.UNIVERSITY,
        regulator=RegulatorType.NUC,
        tier_two_term=TierTwoTerm.SCHOOL,
        state="Niger",
    )
    session = AcademicSession.objects.create(
        institution=inst,
        session_label="2025/2026",
        is_current=True,
    )
    sict = AcademicDivision.objects.create(
        institution=inst,
        name="School of Information and Communication Technology",
        code="SICT",
    )
    seet = AcademicDivision.objects.create(
        institution=inst,
        name="School of Engineering and Engineering Technology",
        code="SEET",
    )
    saat = AcademicDivision.objects.create(
        institution=inst,
        name="School of Agriculture and Agricultural Technology",
        code="SAAT",
    )
    dept_swe = Department.objects.create(
        institution=inst,
        division=sict,
        name="Department of Software Engineering",
        code="SWE",
    )
    dept_agric = Department.objects.create(
        institution=inst,
        division=saat,
        name="Department of Crop Production",
        code="CRP",
    )
    prog_swe_5yr = AcademicProgram.objects.create(
        institution=inst,
        department=dept_swe,
        name="B.Tech Software Engineering",
        award_level=AwardLevel.BTECH,
        duration_years=5,
        siwes_duration_months=6,
    )
    prog_agric_4yr = AcademicProgram.objects.create(
        institution=inst,
        department=dept_agric,
        name="B.Agric. Crop Production",
        award_level=AwardLevel.BSC,
        duration_years=4,
        siwes_duration_months=6,
    )

    return {
        "institution": inst,
        "session": session,
        "sict": sict,
        "seet": seet,
        "saat": saat,
        "dept_swe": dept_swe,
        "dept_agric": dept_agric,
        "prog_swe": prog_swe_5yr,
        "prog_agric": prog_agric_4yr,
    }


@pytest.mark.django_db
class TestStudentIdentityAndScoping:
    def test_dynamic_level_resolution_across_durations(self, academic_environment):
        env = academic_environment
        u1 = User.objects.create_user(email="amina@futminna.edu.ng", password="password", name="Amina Bello")
        u2 = User.objects.create_user(email="emeka@futminna.edu.ng", password="password", name="Emeka Nwosu")

        # 5-Year Program (SLT / Software Eng)
        s_swe_400 = StudentProfile.objects.create(
            user=u1,
            institution=env["institution"],
            program=env["prog_swe"],
            matric_number="2021/SWE/01",
            year_of_study=4,
            entry_session=env["session"],
        )
        assert s_swe_400.get_level_code() == "400"
        assert s_swe_400.is_siwes_year is True
        assert s_swe_400.is_final_year is False
        assert s_swe_400.get_level_display() == "400 Level (SIWES Year)"

        s_swe_500 = StudentProfile.objects.create(
            user=u2,
            institution=env["institution"],
            program=env["prog_swe"],
            matric_number="2020/SWE/02",
            year_of_study=5,
            entry_session=env["session"],
        )
        assert s_swe_500.get_level_code() == "500"
        assert s_swe_500.is_final_year is True
        assert s_swe_500.get_level_display() == "500 Level (Final Year)"

        # 4-Year Program (Biological Science / Agric)
        u3 = User.objects.create_user(email="kemi@futminna.edu.ng", password="password", name="Kemi Alabi")
        s_agric_400 = StudentProfile.objects.create(
            user=u3,
            institution=env["institution"],
            program=env["prog_agric"],
            matric_number="2021/CRP/01",
            year_of_study=4,
            entry_session=env["session"],
        )
        assert s_agric_400.get_level_code() == "400"
        assert s_agric_400.is_final_year is True
        assert s_agric_400.get_level_display() == "400 Level (Final Year)"

    def test_matric_number_uniqueness_per_institution(self, academic_environment):
        env = academic_environment
        u1 = User.objects.create_user(email="std1@futminna.edu.ng", password="password", name="Student One")
        u2 = User.objects.create_user(email="std2@futminna.edu.ng", password="password", name="Student Two")

        StudentProfile.objects.create(
            user=u1,
            institution=env["institution"],
            program=env["prog_swe"],
            matric_number="2021/SWE/9999",
            entry_session=env["session"],
            year_of_study=1,
        )

        # Duplicate matric number in same institution should raise IntegrityError
        with pytest.raises(IntegrityError):
            StudentProfile.objects.create(
                user=u2,
                institution=env["institution"],
                program=env["prog_swe"],
                matric_number="2021/SWE/9999",
                entry_session=env["session"],
                year_of_study=1,
            )

    def test_departmental_caseload_scoping(self, api_client, academic_environment):
        env = academic_environment

        # Create SWE student and Agric student
        u_swe = User.objects.create_user(email="swe.student@futminna.edu.ng", password="password", name="SWE Student")
        StudentProfile.objects.create(
            user=u_swe,
            institution=env["institution"],
            program=env["prog_swe"],
            matric_number="SWE/001",
            entry_session=env["session"],
            year_of_study=3,
        )

        u_agric = User.objects.create_user(email="agric.student@futminna.edu.ng", password="password", name="Agric Student")
        StudentProfile.objects.create(
            user=u_agric,
            institution=env["institution"],
            program=env["prog_agric"],
            matric_number="AGR/001",
            entry_session=env["session"],
            year_of_study=3,
        )

        # Create Staff scoped strictly to SWE Department
        u_staff_swe = User.objects.create_user(email="counsellor.swe@futminna.edu.ng", password="password", name="Dr. SWE Counsellor")
        StaffAssignment.objects.create(
            user=u_staff_swe,
            institution=env["institution"],
            division=env["sict"],
            department=env["dept_swe"],
            role_at_unit=StaffRoleAtUnit.DEPARTMENTAL_COUNSELLOR,
            official_title="SWE Counsellor",
        )

        # Query students as SWE Counsellor
        api_client.force_authenticate(user=u_staff_swe)
        res = api_client.get("/api/students/")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        matrics = [s["matric_number"] for s in data]
        assert "SWE/001" in matrics
        assert "AGR/001" not in matrics  # Departmental boundary enforced!

        # Query students as Superadmin
        u_super = User.objects.create_user(email="superadmin@futminna.edu.ng", password="password", name="Superadmin")
        StaffAssignment.objects.create(
            user=u_super,
            institution=env["institution"],
            role_at_unit=StaffRoleAtUnit.SUPERADMIN,
            official_title="Institution Admin",
        )
        api_client.force_authenticate(user=u_super)
        super_res = api_client.get(f"/api/students/?institution={env['institution'].id}")
        assert super_res.status_code == status.HTTP_200_OK
        super_matrics = [s["matric_number"] for s in super_res.json()]
        assert "SWE/001" in super_matrics
        assert "AGR/001" in super_matrics

    def test_student_creation_and_me_endpoint(self, api_client, academic_environment):
        env = academic_environment

        create_res = api_client.post(
            "/api/students/",
            {
                "email": "new.student@futminna.edu.ng",
                "name": "Ibrahim Hassan",
                "institution": str(env["institution"].id),
                "program": str(env["prog_swe"].id),
                "matric_number": "2024/SWE/4455",
                "entry_session": str(env["session"].id),
                "entry_mode": "UTME",
                "year_of_study": 1,
                "cgpa": 4.15,
                "phone_number": "+2348000000000",
            },
            format="json",
        )
        assert create_res.status_code == status.HTTP_201_CREATED
        student_data = create_res.json()
        assert student_data["matric_number"] == "2024/SWE/4455"
        assert student_data["level_display"] == "100 Level"
        assert student_data["program_duration_years"] == 5

        # Authenticate as the new student and check /api/students/me/
        student_user = User.objects.get(email="new.student@futminna.edu.ng")
        api_client.force_authenticate(user=student_user)
        me_res = api_client.get("/api/students/me/")
        assert me_res.status_code == status.HTTP_200_OK
        assert me_res.json()["user_name"] == "Ibrahim Hassan"
        assert me_res.json()["department_name"] == "Department of Software Engineering"
