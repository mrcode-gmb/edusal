from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from edusal.institutions.models import (
    Institution,
    InstitutionType,
    OwnershipType,
    RegulatorType,
    TierTwoTerm,
    InstitutionStatus,
    AcademicDivision,
    DivisionType,
    Department,
    AcademicProgram,
    AwardLevel,
    AcademicSession,
    SemesterChoice,
    InstitutionalDocument,
    DocumentType,
    EmbeddingStatus,
    InstitutionalDocumentChunk,
    InstitutionStaff,
    InstitutionRole,
)

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds database with Nigerian tertiary institutions (NUC, NBTE, NCCE) and institutional test user accounts"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Nigerian Tertiary Institutions and Institutional Accounts..."))
        DEFAULT_PASSWORD = "1234!@#$"

        def create_or_update_staff_user(email, name, institution, role, title, division=None, department=None):
            user, u_created = User.objects.get_or_create(
                email=email,
                defaults={"name": name, "is_active": True},
            )
            user.set_password(DEFAULT_PASSWORD)
            user.name = name
            user.save()

            staff, s_created = InstitutionStaff.objects.get_or_create(
                user=user,
                institution=institution,
                defaults={
                    "role": role,
                    "title": title,
                    "division": division,
                    "department": department,
                    "is_active": True,
                },
            )
            if not s_created:
                staff.role = role
                staff.title = title
                staff.division = division
                staff.department = department
                staff.save()

            self.stdout.write(
                f"    [Staff Account] {email} -> {name} | {institution.short_name} ({role})"
            )
            return user, staff

        # =====================================================================
        # 1. NUC Federal University Archetype: Federal University of Technology, Minna
        # =====================================================================
        futminna, created = Institution.objects.get_or_create(
            slug="futminna",
            defaults={
                "name": "Federal University of Technology, Minna",
                "short_name": "FUTMinna",
                "institution_type": InstitutionType.UNIVERSITY,
                "ownership": OwnershipType.FEDERAL,
                "regulator": RegulatorType.NUC,
                "tier_two_term": TierTwoTerm.SCHOOL,
                "domain_whitelist": ["@futminna.edu.ng"],
                "address": "Gidan Kwano Main Campus, KM 10 Bida Road",
                "state": "Niger",
                "is_founding_partner": True,
                "status": InstitutionStatus.ACTIVE,
            },
        )
        self.stdout.write(f"  {'Created' if created else 'Found'} University: {futminna.name}")

        AcademicSession.objects.get_or_create(
            institution=futminna,
            session_label="2025/2026",
            defaults={
                "current_semester": SemesterChoice.SECOND_SEMESTER,
                "is_current": True,
            },
        )

        sict, _ = AcademicDivision.objects.get_or_create(
            institution=futminna,
            name="School of Information and Communication Technology",
            defaults={
                "code": "SICT",
                "division_type": DivisionType.SCHOOL,
                "dean_name": "Prof. Mohammed Bashir",
                "dean_email": "dean.sict@futminna.edu.ng",
                "is_active": True,
            },
        )

        seet, _ = AcademicDivision.objects.get_or_create(
            institution=futminna,
            name="School of Engineering and Engineering Technology",
            defaults={
                "code": "SEET",
                "division_type": DivisionType.SCHOOL,
                "dean_name": "Prof. Elizabeth Onwubiko",
                "dean_email": "dean.seet@futminna.edu.ng",
                "is_active": True,
            },
        )

        swe, _ = Department.objects.get_or_create(
            institution=futminna,
            division=sict,
            name="Department of Software Engineering",
            defaults={
                "code": "SWE",
                "hod_name": "Dr. Aminu Adebayo",
                "hod_email": "hod.swe@futminna.edu.ng",
                "siwes_eligible": True,
                "is_active": True,
            },
        )
        AcademicProgram.objects.get_or_create(
            institution=futminna,
            department=swe,
            name="B.Tech Software Engineering",
            defaults={
                "program_code": "SWE-BTECH",
                "award_level": AwardLevel.BTECH,
                "duration_years": 5,
                "siwes_duration_months": 6,
            },
        )

        csc, _ = Department.objects.get_or_create(
            institution=futminna,
            division=sict,
            name="Department of Computer Science",
            defaults={
                "code": "CSC",
                "hod_name": "Dr. Fatima Yusuf",
                "hod_email": "hod.csc@futminna.edu.ng",
                "siwes_eligible": True,
                "is_active": True,
            },
        )
        AcademicProgram.objects.get_or_create(
            institution=futminna,
            department=csc,
            name="B.Tech Computer Science",
            defaults={
                "program_code": "CSC-BTECH",
                "award_level": AwardLevel.BTECH,
                "duration_years": 5,
                "siwes_duration_months": 6,
            },
        )

        eee, _ = Department.objects.get_or_create(
            institution=futminna,
            division=seet,
            name="Department of Electrical & Electronics Engineering",
            defaults={
                "code": "EEE",
                "hod_name": "Engr. Dr. Kingsley Okoro",
                "hod_email": "hod.eee@futminna.edu.ng",
                "siwes_eligible": True,
                "is_active": True,
            },
        )
        AcademicProgram.objects.get_or_create(
            institution=futminna,
            department=eee,
            name="B.Eng Electrical & Electronics Engineering",
            defaults={
                "program_code": "EEE-BENG",
                "award_level": AwardLevel.BENG,
                "duration_years": 5,
                "siwes_duration_months": 6,
            },
        )

        doc_futm, _ = InstitutionalDocument.objects.get_or_create(
            institution=futminna,
            title="FUTMinna 2025/2026 SIWES & Industrial Attachment Manual",
            defaults={
                "division": sict,
                "department": swe,
                "doc_type": DocumentType.SIWES_CALENDAR,
                "file_path": "documents/futminna_siwes_2026.pdf",
                "content_hash": "sha256:4f8a91bc732e67df8120b08dc66291e1f5c8feb105bba042ebf2f0ea59a9df7f",
                "chunk_count": 2,
                "embedding_status": EmbeddingStatus.INDEXED,
                "raw_text": "FUTMinna Industrial Training Coordinating Centre (ITCC). All 300-level and 400-level candidates must complete verified departmental milestone requirements prior to placement dispatch.",
            },
        )
        InstitutionalDocumentChunk.objects.get_or_create(
            document=doc_futm,
            chunk_index=0,
            defaults={
                "page_number": 4,
                "section_reference": "Section 4.2: Placement Prerequisites",
                "content": "Pre-placement requirement: 300-level candidates must have signed endorsements in Relational Databases and Modular System Design prior to institutional referral.",
            },
        )
        InstitutionalDocumentChunk.objects.get_or_create(
            document=doc_futm,
            chunk_index=1,
            defaults={
                "page_number": 7,
                "section_reference": "Section 5.1: SIWES Window Schedule",
                "content": "The National SIWES attachment cycle commences in July annually and spans 24 continuous weeks. Students must log weekly progress with their assigned faculty supervisor.",
            },
        )

        # FUTMinna Accounts (password: 1234!@#$)
        create_or_update_staff_user(
            email="csc@futminna.edu.ng",
            name="Prof. Mohammed Bashir",
            institution=futminna,
            role=InstitutionRole.SUPERADMIN,
            title="Dean, School of Information & Communication Tech",
            division=sict,
            department=csc,
        )
        create_or_update_staff_user(
            email="admin@futminna.edu.ng",
            name="Directorate of Career Services",
            institution=futminna,
            role=InstitutionRole.DIRECTOR_CAREER_SERVICES,
            title="Director, ITCC & Student Placement Office",
        )

        # =====================================================================
        # 2. NUC State University Archetype: Gombe State University (GSU)
        # =====================================================================
        gsu, created = Institution.objects.get_or_create(
            slug="gsu",
            defaults={
                "name": "Gombe State University",
                "short_name": "GSU",
                "institution_type": InstitutionType.UNIVERSITY,
                "ownership": OwnershipType.STATE,
                "regulator": RegulatorType.NUC,
                "tier_two_term": TierTwoTerm.FACULTY,
                "domain_whitelist": ["@gsu.edu.ng"],
                "address": "Tudun Wada, Gombe",
                "state": "Gombe",
                "is_founding_partner": True,
                "status": InstitutionStatus.ACTIVE,
            },
        )
        self.stdout.write(f"  {'Created' if created else 'Found'} State University: {gsu.name}")

        AcademicSession.objects.get_or_create(
            institution=gsu,
            session_label="2025/2026",
            defaults={
                "current_semester": SemesterChoice.FIRST_SEMESTER,
                "is_current": True,
            },
        )

        faculty_science_gsu, _ = AcademicDivision.objects.get_or_create(
            institution=gsu,
            name="Faculty of Science",
            defaults={
                "code": "FOS",
                "division_type": DivisionType.FACULTY,
                "dean_name": "Prof. Haruna Bello",
                "dean_email": "dean.science@gsu.edu.ng",
            },
        )

        dept_cs_gsu, _ = Department.objects.get_or_create(
            institution=gsu,
            division=faculty_science_gsu,
            name="Department of Computer Science",
            defaults={
                "code": "CSC",
                "hod_name": "Dr. Umar Faruk",
                "hod_email": "hod.cs@gsu.edu.ng",
                "siwes_eligible": True,
            },
        )
        AcademicProgram.objects.get_or_create(
            institution=gsu,
            department=dept_cs_gsu,
            name="B.Sc. Computer Science",
            defaults={
                "program_code": "CSC-BSC",
                "award_level": AwardLevel.BSC,
                "duration_years": 4,
                "siwes_duration_months": 6,
            },
        )

        doc_gsu, _ = InstitutionalDocument.objects.get_or_create(
            institution=gsu,
            title="GSU Faculty of Science Academic Handbook & Internship Rubric",
            defaults={
                "division": faculty_science_gsu,
                "department": dept_cs_gsu,
                "doc_type": DocumentType.STUDENT_HANDBOOK,
                "file_path": "documents/gsu_handbook_2026.pdf",
                "content_hash": "sha256:7b919a9df1234567890abcdef0123456789abcdef0123456789abcdef0123456",
                "chunk_count": 1,
                "embedding_status": EmbeddingStatus.INDEXED,
                "raw_text": "Gombe State University Department of Computer Science. All candidates must complete core practical units in Data Structures and Algorithms with verified GitHub repositories before SIWES clearance.",
            },
        )
        InstitutionalDocumentChunk.objects.get_or_create(
            document=doc_gsu,
            chunk_index=0,
            defaults={
                "page_number": 15,
                "section_reference": "Section 3.4: Practical Repository Clearance",
                "content": "All candidates must complete core practical units in Data Structures and Algorithms with verified GitHub repositories before SIWES clearance.",
            },
        )

        # GSU Accounts (password: 1234!@#$)
        create_or_update_staff_user(
            email="csc@gsu.edu.ng",
            name="Dr. Umar Faruk",
            institution=gsu,
            role=InstitutionRole.HOD,
            title="Head, Department of Computer Science",
            division=faculty_science_gsu,
            department=dept_cs_gsu,
        )
        create_or_update_staff_user(
            email="admin@gsu.edu.ng",
            name="Directorate of Academic Planning & Career Services",
            institution=gsu,
            role=InstitutionRole.SUPERADMIN,
            title="Director of Academic Planning, GSU",
        )

        # =====================================================================
        # 3. NBTE Polytechnic Archetype: Yaba College of Technology (YabaTech)
        # =====================================================================
        yabatech, created = Institution.objects.get_or_create(
            slug="yabatech",
            defaults={
                "name": "Yaba College of Technology",
                "short_name": "YabaTech",
                "institution_type": InstitutionType.POLYTECHNIC,
                "ownership": OwnershipType.FEDERAL,
                "regulator": RegulatorType.NBTE,
                "tier_two_term": TierTwoTerm.SCHOOL,
                "domain_whitelist": ["@yabatech.edu.ng"],
                "address": "Herbert Macaulay Way, Yaba",
                "state": "Lagos",
                "is_founding_partner": True,
                "status": InstitutionStatus.ACTIVE,
            },
        )
        self.stdout.write(f"  {'Created' if created else 'Found'} Polytechnic: {yabatech.name}")

        AcademicSession.objects.get_or_create(
            institution=yabatech,
            session_label="2025/2026",
            defaults={
                "current_semester": SemesterChoice.FIRST_SEMESTER,
                "is_current": True,
            },
        )

        st, _ = AcademicDivision.objects.get_or_create(
            institution=yabatech,
            name="School of Technology",
            defaults={
                "code": "ST",
                "division_type": DivisionType.SCHOOL,
                "dean_name": "Engr. Babatunde Sanusi",
                "dean_email": "dean.st@yabatech.edu.ng",
            },
        )

        dept_cs_yaba, _ = Department.objects.get_or_create(
            institution=yabatech,
            division=st,
            name="Department of Computer Technology",
            defaults={
                "code": "CTE",
                "hod_name": "Mrs. O. A. Adeleke",
                "hod_email": "hod.cte@yabatech.edu.ng",
                "siwes_eligible": True,
            },
        )
        AcademicProgram.objects.get_or_create(
            institution=yabatech,
            department=dept_cs_yaba,
            name="National Diploma (ND) Computer Science",
            defaults={
                "program_code": "ND-CS",
                "award_level": AwardLevel.ND,
                "duration_years": 2,
                "siwes_duration_months": 4,
            },
        )
        AcademicProgram.objects.get_or_create(
            institution=yabatech,
            department=dept_cs_yaba,
            name="Higher National Diploma (HND) Computer Science (Software Track)",
            defaults={
                "program_code": "HND-CS-SWE",
                "award_level": AwardLevel.HND,
                "duration_years": 2,
                "siwes_duration_months": 12,
            },
        )

        # YabaTech Accounts (password: 1234!@#$)
        create_or_update_staff_user(
            email="csc@yabatech.edu.ng",
            name="Mrs. O. A. Adeleke",
            institution=yabatech,
            role=InstitutionRole.HOD,
            title="Head of Department, Computer Technology",
            division=st,
            department=dept_cs_yaba,
        )
        create_or_update_staff_user(
            email="admin@yabatech.edu.ng",
            name="Centre for Applied Research & Industry Linkages",
            institution=yabatech,
            role=InstitutionRole.SUPERADMIN,
            title="Director, Centre for Linkages & Career Services",
        )

        # =====================================================================
        # 4. NCCE College of Education Archetype: Federal College of Education, Zaria
        # =====================================================================
        fce_zaria, created = Institution.objects.get_or_create(
            slug="fce-zaria",
            defaults={
                "name": "Federal College of Education, Zaria",
                "short_name": "FCE Zaria",
                "institution_type": InstitutionType.COLLEGE_OF_EDUCATION,
                "ownership": OwnershipType.FEDERAL,
                "regulator": RegulatorType.NCCE,
                "tier_two_term": TierTwoTerm.SCHOOL,
                "domain_whitelist": ["@fcezaria.edu.ng"],
                "address": "Gidan Waya Road, Zaria",
                "state": "Kaduna",
                "is_founding_partner": False,
                "status": InstitutionStatus.ACTIVE,
            },
        )
        self.stdout.write(f"  {'Created' if created else 'Found'} College of Ed.: {fce_zaria.name}")

        AcademicSession.objects.get_or_create(
            institution=fce_zaria,
            session_label="2025/2026",
            defaults={
                "current_semester": SemesterChoice.FIRST_SEMESTER,
                "is_current": True,
            },
        )

        school_sciences, _ = AcademicDivision.objects.get_or_create(
            institution=fce_zaria,
            name="School of Sciences",
            defaults={
                "code": "SOS",
                "division_type": DivisionType.SCHOOL,
                "dean_name": "Dr. Yakubu Danjuma",
                "dean_email": "dean.sciences@fcezaria.edu.ng",
            },
        )

        dept_maths, _ = Department.objects.get_or_create(
            institution=fce_zaria,
            division=school_sciences,
            name="Department of Mathematics Education",
            defaults={
                "code": "MTH-EDU",
                "hod_name": "Dr. Aisha Garba",
                "hod_email": "hod.maths@fcezaria.edu.ng",
                "siwes_eligible": False,
            },
        )
        AcademicProgram.objects.get_or_create(
            institution=fce_zaria,
            department=dept_maths,
            name="NCE Mathematics / Computer Science Combination",
            defaults={
                "program_code": "NCE-MTH-CSC",
                "award_level": AwardLevel.NCE,
                "duration_years": 3,
                "siwes_duration_months": 0,
            },
        )

        # FCE Zaria Accounts (password: 1234!@#$)
        create_or_update_staff_user(
            email="csc@fcezaria.edu.ng",
            name="Dr. Aisha Garba",
            institution=fce_zaria,
            role=InstitutionRole.HOD,
            title="Head of Department, Mathematics & Computer Education",
            division=school_sciences,
            department=dept_maths,
        )
        create_or_update_staff_user(
            email="admin@fcezaria.edu.ng",
            name="Provost Academic Planning Directorate",
            institution=fce_zaria,
            role=InstitutionRole.SUPERADMIN,
            title="Director of Academic Planning, FCE Zaria",
        )

        self.stdout.write(self.style.SUCCESS("✓ Successfully seeded all 4 institutions & institutional user accounts with password: '1234!@#$'!"))
