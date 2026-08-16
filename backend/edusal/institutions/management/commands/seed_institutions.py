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
    StaffAssignment,
    StaffRoleAtUnit,
    StudentProfile,
    EntryMode,
    AcademicStanding,
    SIWESClearanceStatus,
)
from edusal.institutions.services.embedding_service import EmbeddingService


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

        def create_staff_assignment(user, institution, role_at_unit, title, division=None, department=None, assigned_years=None):
            assignment, _ = StaffAssignment.objects.update_or_create(
                user=user,
                institution=institution,
                division=division,
                department=department,
                defaults={
                    "role_at_unit": role_at_unit,
                    "official_title": title,
                    "assigned_years_of_study": assigned_years or [],
                    "can_evaluate_milestones": True,
                    "can_manage_waivers": role_at_unit in [StaffRoleAtUnit.HOD, StaffRoleAtUnit.DEAN, StaffRoleAtUnit.SUPERADMIN],
                    "is_primary": True,
                    "is_active": True,
                },
            )
            return assignment

        def create_student_profile(email, name, institution, program, session, matric_number, year_of_study, cgpa=None, entry_mode=EntryMode.UTME, siwes_status=SIWESClearanceStatus.NOT_ELIGIBLE, phone=""):
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={"name": name, "is_active": True},
            )
            user.set_password(DEFAULT_PASSWORD)
            user.name = name
            user.save()

            student, _ = StudentProfile.objects.update_or_create(
                user=user,
                defaults={
                    "institution": institution,
                    "program": program,
                    "matric_number": matric_number,
                    "entry_session": session,
                    "entry_mode": entry_mode,
                    "year_of_study": year_of_study,
                    "cgpa": cgpa,
                    "academic_standing": AcademicStanding.IN_GOOD_STANDING,
                    "siwes_clearance_status": siwes_status,
                    "phone_number": phone,
                    "is_verified_student": True,
                },
            )
            self.stdout.write(
                f"    [Student Account] {email} ({matric_number}) -> {name} | {program.name} [{student.get_level_display()}]"
            )
            return student


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

        sess_futm, _ = AcademicSession.objects.get_or_create(
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
                "session": sess_futm,
                "doc_type": DocumentType.SIWES_CALENDAR,
                "file_path": "documents/futminna_siwes_2026.pdf",
                "content_hash": "sha256:4f8a91bc732e67df8120b08dc66291e1f5c8feb105bba042ebf2f0ea59a9df7f",
                "chunk_count": 3,
                "embedding_status": EmbeddingStatus.INDEXED,
                "raw_text": "FUTMinna Industrial Training Coordinating Centre (ITCC). All 300-level and 400-level candidates must complete verified departmental milestone requirements prior to placement dispatch.",
            },
        )
        
        c0_text = "Pre-placement requirement: 300-level candidates must have signed endorsements in Relational Databases and Modular System Design prior to institutional referral. Students on academic probation are deferred."
        chunk0, _ = InstitutionalDocumentChunk.objects.get_or_create(
            document=doc_futm,
            chunk_index=0,
            defaults={
                "page_number": 4,
                "section_reference": "Section 4.2: Placement Prerequisites & CGPA Floor",
                "content": c0_text,
                "embedding": EmbeddingService.embed_query(c0_text),
            },
        )
        if not chunk0.embedding:
            chunk0.embedding = EmbeddingService.embed_query(chunk0.content)
            chunk0.save(update_fields=["embedding"])

        c1_text = "The National SIWES attachment cycle commences in July annually and spans 24 continuous weeks. Students must log weekly progress with their assigned faculty supervisor and submit monthly ITCC Form 08."
        chunk1, _ = InstitutionalDocumentChunk.objects.get_or_create(
            document=doc_futm,
            chunk_index=1,
            defaults={
                "page_number": 7,
                "section_reference": "Section 5.1: SIWES Window Schedule & Form 08",
                "content": c1_text,
                "embedding": EmbeddingService.embed_query(c1_text),
            },
        )
        if not chunk1.embedding:
            chunk1.embedding = EmbeddingService.embed_query(chunk1.content)
            chunk1.save(update_fields=["embedding"])

        c2_text = "500-level Software Engineering Capstone Project: Candidates must build, document, and defend an end-to-end software system with CI/CD pipelines, automated testing, and comprehensive technical documentation."
        chunk2, _ = InstitutionalDocumentChunk.objects.get_or_create(
            document=doc_futm,
            chunk_index=2,
            defaults={
                "page_number": 12,
                "section_reference": "Section 6.3: Final Year Capstone Project Defense",
                "content": c2_text,
                "embedding": EmbeddingService.embed_query(c2_text),
            },
        )
        if not chunk2.embedding:
            chunk2.embedding = EmbeddingService.embed_query(chunk2.content)
            chunk2.save(update_fields=["embedding"])

        # FUTMinna Accounts & Staff Assignments (password: 1234!@#$)
        u_dean, _ = create_or_update_staff_user(
            email="csc@futminna.edu.ng",
            name="Prof. Mohammed Bashir",
            institution=futminna,
            role=InstitutionRole.SUPERADMIN,
            title="Dean, School of Information & Communication Tech",
            division=sict,
            department=csc,
        )
        create_staff_assignment(
            user=u_dean,
            institution=futminna,
            role_at_unit=StaffRoleAtUnit.DEAN,
            title="Dean of SICT",
            division=sict,
        )

        u_admin, _ = create_or_update_staff_user(
            email="admin@futminna.edu.ng",
            name="Directorate of Career Services",
            institution=futminna,
            role=InstitutionRole.DIRECTOR_CAREER_SERVICES,
            title="Director, ITCC & Student Placement Office",
        )
        create_staff_assignment(
            user=u_admin,
            institution=futminna,
            role_at_unit=StaffRoleAtUnit.DIRECTOR_CAREER_SERVICES,
            title="Director of Career Services & ITCC",
        )

        u_hod_swe, _ = create_or_update_staff_user(
            email="hod.swe@futminna.edu.ng",
            name="Dr. Aminu Adebayo",
            institution=futminna,
            role=InstitutionRole.HOD,
            title="Head of Department, Software Engineering",
            division=sict,
            department=swe,
        )
        create_staff_assignment(
            user=u_hod_swe,
            institution=futminna,
            role_at_unit=StaffRoleAtUnit.HOD,
            title="HOD Software Engineering",
            division=sict,
            department=swe,
        )

        prog_swe = AcademicProgram.objects.get(department=swe, name="B.Tech Software Engineering")
        prog_csc = AcademicProgram.objects.get(department=csc, name="B.Tech Computer Science")
        session_futm = AcademicSession.objects.filter(institution=futminna, is_current=True).first()

        # FUTMinna Students (5-Year Duration Programs)
        create_student_profile(
            email="student.swe@futminna.edu.ng",
            name="Amina Bello",
            institution=futminna,
            program=prog_swe,
            session=session_futm,
            matric_number="2021/1/74892SWE",
            year_of_study=4,  # Year 4 of 5 = 400L (SIWES Year)
            cgpa=4.35,
            entry_mode=EntryMode.UTME,
            siwes_status=SIWESClearanceStatus.QUALIFYING,
            phone="+234 803 111 2233",
        )
        create_student_profile(
            email="student2.swe@futminna.edu.ng",
            name="Emeka Nwosu",
            institution=futminna,
            program=prog_swe,
            session=session_futm,
            matric_number="2020/1/69201SWE",
            year_of_study=5,  # Year 5 of 5 = 500L (Final Year)
            cgpa=4.60,
            entry_mode=EntryMode.UTME,
            siwes_status=SIWESClearanceStatus.COMPLETED,
            phone="+234 803 222 3344",
        )
        create_student_profile(
            email="student.csc@futminna.edu.ng",
            name="Zainab Usman",
            institution=futminna,
            program=prog_csc,
            session=session_futm,
            matric_number="2024/1/88391CSC",
            year_of_study=1,  # Year 1 of 5 = 100L
            cgpa=3.90,
            entry_mode=EntryMode.UTME,
            siwes_status=SIWESClearanceStatus.NOT_ELIGIBLE,
            phone="+234 803 333 4455",
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
        gsu_chunk_text = "All candidates must complete core practical units in Data Structures and Algorithms with verified GitHub repositories before SIWES clearance."
        gsu_chunk0, _ = InstitutionalDocumentChunk.objects.get_or_create(
            document=doc_gsu,
            chunk_index=0,
            defaults={
                "page_number": 15,
                "section_reference": "Section 3.4: Practical Repository Clearance",
                "content": gsu_chunk_text,
                "embedding": EmbeddingService.embed_query(gsu_chunk_text),
            },
        )
        if not gsu_chunk0.embedding:
            gsu_chunk0.embedding = EmbeddingService.embed_query(gsu_chunk0.content)
            gsu_chunk0.save(update_fields=["embedding"])

        # GSU Accounts & Staff Assignments (password: 1234!@#$)
        u_gsu_hod, _ = create_or_update_staff_user(
            email="csc@gsu.edu.ng",
            name="Dr. Umar Faruk",
            institution=gsu,
            role=InstitutionRole.HOD,
            title="Head, Department of Computer Science",
            division=faculty_science_gsu,
            department=dept_cs_gsu,
        )
        create_staff_assignment(
            user=u_gsu_hod,
            institution=gsu,
            role_at_unit=StaffRoleAtUnit.HOD,
            title="HOD Computer Science",
            division=faculty_science_gsu,
            department=dept_cs_gsu,
        )

        u_gsu_admin, _ = create_or_update_staff_user(
            email="admin@gsu.edu.ng",
            name="Directorate of Academic Planning & Career Services",
            institution=gsu,
            role=InstitutionRole.SUPERADMIN,
            title="Director of Academic Planning, GSU",
        )
        create_staff_assignment(
            user=u_gsu_admin,
            institution=gsu,
            role_at_unit=StaffRoleAtUnit.SUPERADMIN,
            title="Director of Academic Planning",
        )

        prog_gsu_cs = AcademicProgram.objects.get(department=dept_cs_gsu, name="B.Sc. Computer Science")
        session_gsu = AcademicSession.objects.filter(institution=gsu, is_current=True).first()

        # GSU Students (4-Year Duration Program)
        create_student_profile(
            email="student.cs@gsu.edu.ng",
            name="Chinedu Eze",
            institution=gsu,
            program=prog_gsu_cs,
            session=session_gsu,
            matric_number="GSU/SCI/CSC/22/0104",
            year_of_study=4,  # Year 4 of 4 = 400L (Final Year)
            cgpa=3.85,
            entry_mode=EntryMode.UTME,
            siwes_status=SIWESClearanceStatus.COMPLETED,
            phone="+234 802 444 5566",
        )
        create_student_profile(
            email="student2.cs@gsu.edu.ng",
            name="Halima Bello",
            institution=gsu,
            program=prog_gsu_cs,
            session=session_gsu,
            matric_number="GSU/SCI/CSC/23/0219",
            year_of_study=3,  # Year 3 of 4 = 300L (SIWES Year)
            cgpa=4.12,
            entry_mode=EntryMode.UTME,
            siwes_status=SIWESClearanceStatus.QUALIFYING,
            phone="+234 802 555 6677",
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
        prog_nd = AcademicProgram.objects.get_or_create(
            institution=yabatech,
            department=dept_cs_yaba,
            name="National Diploma (ND) Computer Science",
            defaults={
                "program_code": "ND-CS",
                "award_level": AwardLevel.ND,
                "duration_years": 2,
                "siwes_duration_months": 4,
            },
        )[0]
        prog_hnd = AcademicProgram.objects.get_or_create(
            institution=yabatech,
            department=dept_cs_yaba,
            name="Higher National Diploma (HND) Computer Science (Software Track)",
            defaults={
                "program_code": "HND-CS-SWE",
                "award_level": AwardLevel.HND,
                "duration_years": 2,
                "siwes_duration_months": 12,
            },
        )[0]

        # YabaTech Accounts & Staff Assignments (password: 1234!@#$)
        u_yaba_hod, _ = create_or_update_staff_user(
            email="csc@yabatech.edu.ng",
            name="Mrs. O. A. Adeleke",
            institution=yabatech,
            role=InstitutionRole.HOD,
            title="Head of Department, Computer Technology",
            division=st,
            department=dept_cs_yaba,
        )
        create_staff_assignment(
            user=u_yaba_hod,
            institution=yabatech,
            role_at_unit=StaffRoleAtUnit.HOD,
            title="HOD Computer Technology",
            division=st,
            department=dept_cs_yaba,
        )

        u_yaba_admin, _ = create_or_update_staff_user(
            email="admin@yabatech.edu.ng",
            name="Centre for Applied Research & Industry Linkages",
            institution=yabatech,
            role=InstitutionRole.SUPERADMIN,
            title="Director, Centre for Linkages & Career Services",
        )
        create_staff_assignment(
            user=u_yaba_admin,
            institution=yabatech,
            role_at_unit=StaffRoleAtUnit.SUPERADMIN,
            title="Director of Linkages & Career Services",
        )

        session_yaba = AcademicSession.objects.filter(institution=yabatech, is_current=True).first()

        # YabaTech Students (2-Year ND and 2-Year HND Programs)
        create_student_profile(
            email="student.nd@yabatech.edu.ng",
            name="Babatunde Adeleke",
            institution=yabatech,
            program=prog_nd,
            session=session_yaba,
            matric_number="F/ND/23/3820019",
            year_of_study=2,  # Year 2 of 2 = ND II (Final Year)
            cgpa=3.62,
            entry_mode=EntryMode.UTME,
            siwes_status=SIWESClearanceStatus.QUALIFYING,
            phone="+234 801 666 7788",
        )
        create_student_profile(
            email="student.hnd@yabatech.edu.ng",
            name="Folake Adeleke",
            institution=yabatech,
            program=prog_hnd,
            session=session_yaba,
            matric_number="F/HND/24/4910082",
            year_of_study=2,  # Year 2 of 2 = HND II (Final Year)
            cgpa=3.75,
            entry_mode=EntryMode.CONVERSION,
            siwes_status=SIWESClearanceStatus.COMPLETED,
            phone="+234 801 777 8899",
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
        prog_nce = AcademicProgram.objects.get_or_create(
            institution=fce_zaria,
            department=dept_maths,
            name="NCE Mathematics / Computer Science Combination",
            defaults={
                "program_code": "NCE-MTH-CSC",
                "award_level": AwardLevel.NCE,
                "duration_years": 3,
                "siwes_duration_months": 0,
            },
        )[0]

        # FCE Zaria Accounts & Staff Assignments (password: 1234!@#$)
        u_fce_hod, _ = create_or_update_staff_user(
            email="csc@fcezaria.edu.ng",
            name="Dr. Aisha Garba",
            institution=fce_zaria,
            role=InstitutionRole.HOD,
            title="Head of Department, Mathematics & Computer Education",
            division=school_sciences,
            department=dept_maths,
        )
        create_staff_assignment(
            user=u_fce_hod,
            institution=fce_zaria,
            role_at_unit=StaffRoleAtUnit.HOD,
            title="HOD Mathematics Education",
            division=school_sciences,
            department=dept_maths,
        )

        u_fce_admin, _ = create_or_update_staff_user(
            email="admin@fcezaria.edu.ng",
            name="Provost Academic Planning Directorate",
            institution=fce_zaria,
            role=InstitutionRole.SUPERADMIN,
            title="Director of Academic Planning, FCE Zaria",
        )
        create_staff_assignment(
            user=u_fce_admin,
            institution=fce_zaria,
            role_at_unit=StaffRoleAtUnit.SUPERADMIN,
            title="Director of Academic Planning",
        )

        session_fce = AcademicSession.objects.filter(institution=fce_zaria, is_current=True).first()

        # FCE Zaria Students (3-Year NCE Program)
        create_student_profile(
            email="student.nce@fcezaria.edu.ng",
            name="Fatima Garba",
            institution=fce_zaria,
            program=prog_nce,
            session=session_fce,
            matric_number="NCE/2023/MTH/0491",
            year_of_study=3,  # Year 3 of 3 = NCE III (Final Year)
            cgpa=4.10,
            entry_mode=EntryMode.UTME,
            siwes_status=SIWESClearanceStatus.NOT_ELIGIBLE,
            phone="+234 809 888 9900",
        )

        self.stdout.write(self.style.SUCCESS("✓ Successfully seeded all 4 institutions, scoped staff assignments, and multi-year duration students with password: '1234!@#$'!"))
