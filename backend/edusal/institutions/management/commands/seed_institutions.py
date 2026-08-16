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
    Pathway,
    PathwayMilestone,
    TemplateVisibility,
    MilestoneType,
    VerificationMethod,
    RequiredEvidenceType,
    StudentMilestoneSubmission,
    SubmissionStatus,
    DiagnosticAssessment,
    DiagnosticQuestion,
    StudentAssessmentSession,
    AssessmentType,
    AICoachConversation,
    AICoachMessage,
    CounsellingSession,
    CounsellingTopic,
    CounsellingSessionStatus,
    CounsellingCaseNote,
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

        def create_student_profile(email, name, institution, program, session, matric_number, year_of_study, cgpa=None, entry_mode=EntryMode.UTME, siwes_status=SIWESClearanceStatus.NOT_ELIGIBLE, phone="", active_pathway=None):
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
                    "active_pathway": active_pathway,
                },
            )
            if active_pathway and student.active_pathway != active_pathway:
                student.active_pathway = active_pathway
                student.save(update_fields=["active_pathway"])

            student.recalculate_employability()

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
        prog_swe_btech = AcademicProgram.objects.get_or_create(
            institution=futminna,
            department=swe,
            name="B.Tech Software Engineering",
            defaults={
                "program_code": "SWE-BTECH",
                "award_level": AwardLevel.BTECH,
                "duration_years": 5,
                "siwes_duration_months": 6,
            },
        )[0]

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

        # FUTMinna Pathway Blueprint: Full-Stack Cloud & DevOps Engineering (B.Tech SWE)
        pw_swe, _ = Pathway.objects.get_or_create(
            institution=futminna,
            program=prog_swe_btech,
            title="Full-Stack Cloud & DevOps Engineering",
            defaults={
                "career_role": "Full-Stack Software & Cloud Engineer",
                "industry_sector": "Information Technology / Fintech",
                "description": "Progressive 5-year software engineering roadmap spanning foundational algorithms, relational databases, containerized microservices, 24-week SIWES attachment, and production capstone architecture.",
                "target_cgpa_recommendation": 3.00,
                "is_active": True,
                "is_template": True,
                "template_visibility": TemplateVisibility.NATIONAL_CATALOG,
            },
        )

        swe_milestones_data = [
            {
                "order_index": 0,
                "year_of_study": 1,
                "target_level_code": "100",
                "target_semester": "FIRST",
                "title": "Version Control (Git/GitHub) & Terminal Mastery",
                "description": "Establish professional Git workflow, branch management, semantic commit history, and automated GitHub actions.",
                "milestone_type": MilestoneType.TECHNICAL_SKILL,
                "points": 50,
                "verification_method": VerificationMethod.URL_VERIFICATION,
                "required_evidence_type": RequiredEvidenceType.GITHUB_REPO,
                "competency_tags": ["Git", "GitHub", "Bash", "Linux"],
            },
            {
                "order_index": 1,
                "year_of_study": 2,
                "target_level_code": "200",
                "target_semester": "SECOND",
                "title": "Relational Database Normalization & PostgreSQL Design",
                "description": "Design 3NF relational schemas, write optimized SQL queries, indexes, and database migrations for high-concurrency systems.",
                "milestone_type": MilestoneType.TECHNICAL_SKILL,
                "points": 100,
                "verification_method": VerificationMethod.URL_VERIFICATION,
                "required_evidence_type": RequiredEvidenceType.GITHUB_REPO,
                "competency_tags": ["PostgreSQL", "Database Normalization", "SQL", "Schema Design"],
            },
            {
                "order_index": 2,
                "year_of_study": 3,
                "target_level_code": "300",
                "target_semester": "FIRST",
                "title": "Containerization (Docker) & RESTful Microservices",
                "description": "Build multi-tier REST API with Django / FastAPI, containerize with Docker compose, and write automated Pytest suites.",
                "milestone_type": MilestoneType.SIWES_PREREQUISITE,
                "points": 150,
                "verification_method": VerificationMethod.SUPERVISOR_SIGN_OFF,
                "required_evidence_type": RequiredEvidenceType.GITHUB_REPO,
                "competency_tags": ["Docker", "Django", "FastAPI", "REST APIs", "Pytest"],
            },
            {
                "order_index": 3,
                "year_of_study": 4,
                "target_level_code": "400",
                "target_semester": "FIRST",
                "title": "24-Week Industrial SIWES Attachment with Signed Logbook",
                "description": "Complete continuous 6-month off-campus industrial training, submit verified monthly ITCC Form 08, and receive industry supervisor evaluation.",
                "milestone_type": MilestoneType.INTERNSHIP_EXPERIENCE,
                "points": 300,
                "verification_method": VerificationMethod.SUPERVISOR_SIGN_OFF,
                "required_evidence_type": RequiredEvidenceType.SUPERVISOR_ENDORSEMENT,
                "competency_tags": ["SIWES", "Industrial Experience", "Technical Problem Solving"],
            },
            {
                "order_index": 4,
                "year_of_study": 5,
                "target_level_code": "500",
                "target_semester": "SECOND",
                "title": "Production Capstone System with CI/CD & Security Audit",
                "description": "Defend end-to-end cloud-native system with live deployment, automated testing pipeline, and comprehensive architecture documentation.",
                "milestone_type": MilestoneType.CAPSTONE_PROJECT,
                "points": 250,
                "verification_method": VerificationMethod.SUPERVISOR_SIGN_OFF,
                "required_evidence_type": RequiredEvidenceType.LIVE_URL,
                "competency_tags": ["CI/CD", "Production Deployment", "Architecture Defense", "Cloud Infrastructure"],
            },
        ]

        for m_data in swe_milestones_data:
            PathwayMilestone.objects.update_or_create(
                pathway=pw_swe,
                title=m_data["title"],
                defaults=m_data,
            )
        pw_swe.recalculate_totals()

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
        sp_amina = create_student_profile(
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
            active_pathway=pw_swe,
        )

        # Seed verified submissions for Amina Bello to demonstrate live employability score calculation
        swe_m1 = pw_swe.milestones.filter(order_index=0).first()
        swe_m2 = pw_swe.milestones.filter(order_index=1).first()
        swe_m3 = pw_swe.milestones.filter(order_index=2).first()
        swe_m4 = pw_swe.milestones.filter(order_index=3).first()

        if swe_m1:
            StudentMilestoneSubmission.objects.get_or_create(
                student=sp_amina,
                milestone=swe_m1,
                defaults={
                    "status": SubmissionStatus.VERIFIED,
                    "evidence_url": "https://github.com/aminabello/git-devops-mastery",
                    "submission_notes": "Completed Git terminal workflows, branching strategies, and automated CI pipelines.",
                    "points_awarded": swe_m1.points,
                    "review_feedback": "Excellent Git branching history and README documentation.",
                    "reviewed_by": u_hod_swe,
                },
            )
        if swe_m2:
            StudentMilestoneSubmission.objects.get_or_create(
                student=sp_amina,
                milestone=swe_m2,
                defaults={
                    "status": SubmissionStatus.VERIFIED,
                    "evidence_url": "https://github.com/aminabello/postgresql-schema-opt",
                    "submission_notes": "Designed 3NF database architecture for university portal with indexing.",
                    "points_awarded": swe_m2.points,
                    "review_feedback": "Relational schemas and migration integrity verified.",
                    "reviewed_by": u_hod_swe,
                },
            )
        if swe_m3:
            StudentMilestoneSubmission.objects.get_or_create(
                student=sp_amina,
                milestone=swe_m3,
                defaults={
                    "status": SubmissionStatus.VERIFIED,
                    "evidence_url": "https://github.com/aminabello/edusal-microservices-fastapi",
                    "submission_notes": "Containerized microservice API with Docker compose and automated Pytest test suite.",
                    "points_awarded": swe_m3.points,
                    "review_feedback": "Microservices and dockerized API pass all integration checks.",
                    "reviewed_by": u_hod_swe,
                },
            )
        if swe_m4:
            StudentMilestoneSubmission.objects.get_or_create(
                student=sp_amina,
                milestone=swe_m4,
                defaults={
                    "status": SubmissionStatus.PENDING_REVIEW,
                    "submission_notes": "Submitted verified monthly ITCC Form 08 signed by MainOne Cable IT supervisor.",
                    "points_awarded": 0,
                },
            )
        sp_amina.recalculate_employability()

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
            active_pathway=pw_swe,
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

        # YabaTech Pathway Blueprint: Frontend Web & React UI/UX Engineering (ND Computer Science)
        pw_yaba, _ = Pathway.objects.get_or_create(
            institution=yabatech,
            program=prog_nd,
            title="Frontend Web & React UI/UX Engineering",
            defaults={
                "career_role": "Junior Frontend Developer / UI Specialist",
                "industry_sector": "Information Technology / Digital Agency",
                "description": "Intensive 2-year polytechnic National Diploma roadmap covering modern HTML/CSS responsive design, client-side JavaScript, React component state, 16-week SIWES placement, and live portfolio defense.",
                "target_cgpa_recommendation": 2.80,
                "is_active": True,
                "is_template": True,
                "template_visibility": TemplateVisibility.NATIONAL_CATALOG,
            },
        )

        yaba_milestones_data = [
            {
                "order_index": 0,
                "year_of_study": 1,
                "target_level_code": "ND_I",
                "target_semester": "FIRST",
                "title": "Responsive Web Development & Semantic UI Architecture",
                "description": "Construct accessible, responsive multi-page web layouts using semantic HTML5, CSS Grid, Flexbox, and CSS custom properties.",
                "milestone_type": MilestoneType.TECHNICAL_SKILL,
                "points": 100,
                "verification_method": VerificationMethod.URL_VERIFICATION,
                "required_evidence_type": RequiredEvidenceType.LIVE_URL,
                "competency_tags": ["HTML5", "CSS3", "Responsive Design", "Flexbox"],
            },
            {
                "order_index": 1,
                "year_of_study": 1,
                "target_level_code": "ND_I",
                "target_semester": "SECOND",
                "title": "Client-Side JavaScript & React State Management",
                "description": "Build interactive single-page applications with React, TypeScript hooks, REST API data consumption, and form validations.",
                "milestone_type": MilestoneType.TECHNICAL_SKILL,
                "points": 150,
                "verification_method": VerificationMethod.URL_VERIFICATION,
                "required_evidence_type": RequiredEvidenceType.GITHUB_REPO,
                "competency_tags": ["JavaScript", "React", "TypeScript", "State Management"],
            },
            {
                "order_index": 2,
                "year_of_study": 2,
                "target_level_code": "ND_II",
                "target_semester": "FIRST",
                "title": "16-Week Polytechnic SIWES Industrial Attachment",
                "description": "Complete 4-month industry attachment at verified IT firm, log weekly competencies in SIWES logbook, and pass departmental supervisor inspection.",
                "milestone_type": MilestoneType.INTERNSHIP_EXPERIENCE,
                "points": 250,
                "verification_method": VerificationMethod.SUPERVISOR_SIGN_OFF,
                "required_evidence_type": RequiredEvidenceType.SUPERVISOR_ENDORSEMENT,
                "competency_tags": ["SIWES", "Industry Logbook", "Workplace Readiness"],
            },
            {
                "order_index": 3,
                "year_of_study": 2,
                "target_level_code": "ND_II",
                "target_semester": "SECOND",
                "title": "Interactive Web Application Capstone Defense",
                "description": "Deploy full frontend web application to Vercel/Netlify with live backend API integration, user authentication, and departmental defense.",
                "milestone_type": MilestoneType.CAPSTONE_PROJECT,
                "points": 200,
                "verification_method": VerificationMethod.SUPERVISOR_SIGN_OFF,
                "required_evidence_type": RequiredEvidenceType.LIVE_URL,
                "competency_tags": ["React", "Vite", "REST APIs", "Project Defense"],
            },
        ]

        for m_data in yaba_milestones_data:
            PathwayMilestone.objects.update_or_create(
                pathway=pw_yaba,
                title=m_data["title"],
                defaults=m_data,
            )
        pw_yaba.recalculate_totals()

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
            cgpa=3.60,
            entry_mode=EntryMode.UTME,
            siwes_status=SIWESClearanceStatus.QUALIFYING,
            phone="+234 801 666 7788",
            active_pathway=pw_yaba,
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

        # FCE Zaria Pathway Blueprint: Educational Technology & Digital Pedagogy (NCE)
        pw_fce, _ = Pathway.objects.get_or_create(
            institution=fce_zaria,
            program=prog_nce,
            title="Educational Technology & Digital Pedagogy",
            defaults={
                "career_role": "Certified STEM Educator / EdTech Specialist",
                "industry_sector": "Basic & Secondary Education / EdTech",
                "description": "Comprehensive 3-year teacher education pathway preparing future educators in digital instructional authoring, virtual classroom delivery, STEM pedagogy, and teaching practice portfolio defense.",
                "target_cgpa_recommendation": 3.00,
                "is_active": True,
                "is_template": True,
                "template_visibility": TemplateVisibility.NATIONAL_CATALOG,
            },
        )

        fce_milestones_data = [
            {
                "order_index": 0,
                "year_of_study": 1,
                "target_level_code": "NCE_I",
                "target_semester": "FIRST",
                "title": "Interactive Digital Courseware Authoring",
                "description": "Author structured digital learning modules incorporating interactive multimedia, formative quizzes, and curriculum lesson plans.",
                "milestone_type": MilestoneType.TECHNICAL_SKILL,
                "points": 100,
                "verification_method": VerificationMethod.URL_VERIFICATION,
                "required_evidence_type": RequiredEvidenceType.PORTFOLIO_LINK,
                "competency_tags": ["Digital Pedagogy", "Interactive Learning", "Lesson Planning"],
            },
            {
                "order_index": 1,
                "year_of_study": 2,
                "target_level_code": "NCE_II",
                "target_semester": "SECOND",
                "title": "LMS Platform Administration & Online Assessment",
                "description": "Configure digital learning management courses, automated grading rubrics, and virtual classroom engagement analytics.",
                "milestone_type": MilestoneType.TECHNICAL_SKILL,
                "points": 150,
                "verification_method": VerificationMethod.DOCUMENT_UPLOAD,
                "required_evidence_type": RequiredEvidenceType.CERTIFICATE_PDF,
                "competency_tags": ["Moodle", "Canvas", "Assessment Rubrics", "Educational Analytics"],
            },
            {
                "order_index": 2,
                "year_of_study": 3,
                "target_level_code": "NCE_III",
                "target_semester": "FIRST",
                "title": "Teaching Practice School Attachment & Portfolio Defense",
                "description": "Complete 12-week supervised classroom teaching practice in an accredited secondary school with signed teaching practice portfolio.",
                "milestone_type": MilestoneType.INTERNSHIP_EXPERIENCE,
                "points": 300,
                "verification_method": VerificationMethod.SUPERVISOR_SIGN_OFF,
                "required_evidence_type": RequiredEvidenceType.SUPERVISOR_ENDORSEMENT,
                "competency_tags": ["Teaching Practice", "Classroom Management", "TRCN Certification"],
            },
        ]

        for m_data in fce_milestones_data:
            PathwayMilestone.objects.update_or_create(
                pathway=pw_fce,
                title=m_data["title"],
                defaults=m_data,
            )
        pw_fce.recalculate_totals()

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
            active_pathway=pw_fce,
        )

        # =====================================================================
        # 5. Seed Standard Diagnostic Assessments & Item Banks
        # =====================================================================
        self.stdout.write("  Seeding Standard Psychometric & Cognitive Diagnostic Item Banks...")

        # 1. Big Five Personality Inventory (Mini-IPIP 20 Items)
        big5_test, _ = DiagnosticAssessment.objects.get_or_create(
            slug="big-five-personality-inventory",
            defaults={
                "assessment_type": AssessmentType.BIG_FIVE,
                "title": "Big Five Personality Inventory (Mini-IPIP)",
                "description": "Evaluates core workplace personality traits across Openness, Conscientiousness, Extraversion, Agreeableness, and Emotional Stability using the validated 20-item public domain Mini-IPIP framework.",
                "instructions": "For each statement, rate how accurately it describes your typical behavior on a scale of 1 (Very Inaccurate) to 5 (Very Accurate).",
                "estimated_minutes": 8,
                "total_questions": 20,
                "is_active": True,
            },
        )

        big5_items = [
            # Extraversion (E)
            ("I am the life of the party.", "EXTRAVERSION", False),
            ("I don't talk a lot.", "EXTRAVERSION", True),
            ("I talk to a lot of different people at academic and tech meetups.", "EXTRAVERSION", False),
            ("I keep in the background during large team meetings.", "EXTRAVERSION", True),
            # Agreeableness (A)
            ("I sympathize with others' technical struggles and blockers.", "EXTRAVERSION", False),  # Agreeableness
            ("I am not interested in other people's problems.", "AGREEABLENESS", True),
            ("I feel others' emotions during team project disputes.", "AGREEABLENESS", False),
            ("I am not really interested in others.", "AGREEABLENESS", True),
            # Conscientiousness (C)
            ("I get chore tasks and project scaffolding done right away.", "CONSCIENTIOUSNESS", False),
            ("I often forget to put things back in their proper place or commit clean code.", "CONSCIENTIOUSNESS", True),
            ("I like order and structured deliverable checklists.", "CONSCIENTIOUSNESS", False),
            ("I make a mess of my tasks and leave tickets half-done.", "CONSCIENTIOUSNESS", True),
            # Emotional Stability (Neuroticism inverted) (S)
            ("I have frequent mood swings under tight project deadlines.", "EMOTIONAL_STABILITY", True),
            ("I am relaxed most of the time during software release cycles.", "EMOTIONAL_STABILITY", False),
            ("I get upset easily when a unit test or deployment fails.", "EMOTIONAL_STABILITY", True),
            ("I seldom feel blue or discouraged by challenging algorithms.", "EMOTIONAL_STABILITY", False),
            # Openness to Experience (O)
            ("I have a vivid imagination and love designing novel system architectures.", "OPENNESS", False),
            ("I am not interested in abstract computational theories or new frameworks.", "OPENNESS", True),
            ("I have difficulty understanding abstract mathematical concepts.", "OPENNESS", True),
            ("I do not have a good imagination.", "OPENNESS", True),
        ]

        # Fix item 5 dimension to AGREEABLENESS
        big5_items[4] = ("I sympathize with others' technical struggles and blockers.", "AGREEABLENESS", False)

        for idx, (prompt, dim, rev) in enumerate(big5_items):
            DiagnosticQuestion.objects.update_or_create(
                assessment=big5_test,
                order_index=idx,
                defaults={
                    "prompt": prompt,
                    "dimension": dim,
                    "is_reverse_scored": rev,
                    "question_type": "LIKERT_5",
                    "options": [
                        {"id": "1", "text": "1 - Very Inaccurate"},
                        {"id": "2", "text": "2 - Moderately Inaccurate"},
                        {"id": "3", "text": "3 - Neither Accurate Nor Inaccurate"},
                        {"id": "4", "text": "4 - Moderately Accurate"},
                        {"id": "5", "text": "5 - Very Accurate"},
                    ],
                },
            )

        # 2. Holland RIASEC Vocational Interest Inventory (30 Items)
        riasec_test, _ = DiagnosticAssessment.objects.get_or_create(
            slug="holland-riasec-interest-inventory",
            defaults={
                "assessment_type": AssessmentType.HOLLAND_RIASEC,
                "title": "Holland RIASEC Vocational Interest Inventory",
                "description": "Discovers your 3-letter Holland career code (e.g. IRC, RIA) across Realistic, Investigative, Artistic, Social, Enterprising, and Conventional themes to match you with top industry pathways.",
                "instructions": "Rate how much you would enjoy performing each activity on a scale of 1 (Strongly Dislike) to 5 (Strongly Enjoy).",
                "estimated_minutes": 10,
                "total_questions": 30,
                "is_active": True,
            },
        )

        riasec_items = [
            # Realistic (R)
            ("Configure hardware servers, network switches, or IoT microcontrollers.", "REALISTIC"),
            ("Build and troubleshoot physical or automated electromechanical systems.", "REALISTIC"),
            ("Work outdoors conducting SIWES telecommunication field surveys.", "REALISTIC"),
            ("Use precision hand tools to assemble technical equipment.", "REALISTIC"),
            ("Maintain Linux server clusters and manage bare-metal container hosts.", "REALISTIC"),
            # Investigative (I)
            ("Analyze algorithmic time complexity and optimize database query plans.", "INVESTIGATIVE"),
            ("Conduct scientific research on distributed consensus or machine learning.", "INVESTIGATIVE"),
            ("Solve complex mathematical puzzles and cryptographic equations.", "INVESTIGATIVE"),
            ("Diagnose race conditions and root causes of complex system failures.", "INVESTIGATIVE"),
            ("Study academic whitepapers on cloud architecture and compiler theory.", "INVESTIGATIVE"),
            # Artistic (A)
            ("Design intuitive user interfaces, design systems, and responsive Figma mockups.", "ARTISTIC"),
            ("Write engaging technical blog posts, release notes, and product stories.", "ARTISTIC"),
            ("Create 3D graphics, motion animations, or interactive visualizations.", "ARTISTIC"),
            ("Develop novel branding, typography pairings, and layout aesthetics.", "ARTISTIC"),
            ("Compose technical multimedia tutorials and developer podcasts.", "ARTISTIC"),
            # Social (S)
            ("Teach junior students programming fundamentals and algorithmic thinking.", "SOCIAL"),
            ("Mentor peers through career transitions and resume preparation.", "SOCIAL"),
            ("Facilitate collaborative hackathons and community study groups.", "SOCIAL"),
            ("Provide empathetic career counselling and academic advisement.", "SOCIAL"),
            ("Help team members resolve interpersonal disputes during group projects.", "SOCIAL"),
            # Enterprising (E)
            ("Pitch a software startup proposal to angel investors and industry partners.", "ENTERPRISING"),
            ("Lead an agile software engineering team as Product Owner or Tech Lead.", "ENTERPRISING"),
            ("Negotiate freelance contract deliverables, timelines, and budgets.", "ENTERPRISING"),
            ("Market an open-source tool and organize user adoption campaigns.", "ENTERPRISING"),
            ("Manage financial budgeting and cost optimization for cloud infrastructure.", "ENTERPRISING"),
            # Conventional (C)
            ("Design normalized relational databases and maintain schema documentation.", "CONVENTIONAL"),
            ("Audit code repositories against strict ISO/NDPR security and compliance standards.", "CONVENTIONAL"),
            ("Create meticulous test suites, QA matrices, and reproducible bug reports.", "CONVENTIONAL"),
            ("Organize structured project backlogs, release milestones, and Gantt charts.", "CONVENTIONAL"),
            ("Maintain precise accounting records and cloud resource billing ledgers.", "CONVENTIONAL"),
        ]

        for idx, (prompt, dim) in enumerate(riasec_items):
            DiagnosticQuestion.objects.update_or_create(
                assessment=riasec_test,
                order_index=idx,
                defaults={
                    "prompt": prompt,
                    "dimension": dim,
                    "is_reverse_scored": False,
                    "question_type": "LIKERT_5",
                    "options": [
                        {"id": "1", "text": "1 - Strongly Dislike"},
                        {"id": "2", "text": "2 - Dislike"},
                        {"id": "3", "text": "3 - Neutral"},
                        {"id": "4", "text": "4 - Enjoy"},
                        {"id": "5", "text": "5 - Strongly Enjoy"},
                    ],
                },
            )

        # 3. Numerical & Logical Reasoning Diagnostic (10 Items)
        num_test, _ = DiagnosticAssessment.objects.get_or_create(
            slug="numerical-logical-reasoning",
            defaults={
                "assessment_type": AssessmentType.NUMERICAL_REASONING,
                "title": "Numerical & Logical Reasoning Diagnostic",
                "description": "Standard timed cognitive assessment evaluating numerical extrapolation, percentage modeling, algorithmic deductions, and data analysis.",
                "instructions": "Select the correct answer for each quantitative and sequence puzzle. Calculator permitted.",
                "estimated_minutes": 15,
                "total_questions": 5,
                "is_active": True,
            },
        )

        num_items = [
            (
                "A cloud server cluster processes 1,200 requests/sec with a 25% failure rate. After an optimization patch, the throughput increases by 50% and the failure rate drops to 10%. How many successful requests are processed per second after the patch?",
                "NUMERICAL",
                [
                    {"id": "A", "text": "1,440 requests/sec", "is_correct": False},
                    {"id": "B", "text": "1,620 requests/sec", "is_correct": True},
                    {"id": "C", "text": "1,800 requests/sec", "is_correct": False},
                    {"id": "D", "text": "1,500 requests/sec", "is_correct": False},
                ],
                "New throughput = 1200 * 1.50 = 1800 req/s. Successful rate = 1800 * (1 - 0.10) = 1620 req/s.",
            ),
            (
                "Find the next number in the sequence: 4, 11, 25, 53, 109, ?",
                "LOGICAL",
                [
                    {"id": "A", "text": "218", "is_correct": False},
                    {"id": "B", "text": "221", "is_correct": True},
                    {"id": "C", "text": "225", "is_correct": False},
                    {"id": "D", "text": "215", "is_correct": False},
                ],
                "Rule: x_{n+1} = 2 * x_n + (sequence of primes or +3, +3, +3 -> 4*2+3=11, 11*2+3=25, 25*2+3=53, 53*2+3=109, 109*2+3=221).",
            ),
            (
                "If 6 software developers can review 180 pull requests in 5 working days, how many developers are required to review 360 pull requests in 4 working days at the same work rate?",
                "NUMERICAL",
                [
                    {"id": "A", "text": "12 developers", "is_correct": False},
                    {"id": "B", "text": "15 developers", "is_correct": True},
                    {"id": "C", "text": "18 developers", "is_correct": False},
                    {"id": "D", "text": "10 developers", "is_correct": False},
                ],
                "Rate per developer per day = 180 / (6 * 5) = 6 PRs/day. Total required rate = 360 / 4 = 90 PRs/day. Developers needed = 90 / 6 = 15 developers.",
            ),
            (
                "A database table with 5,000,000 rows performs a sequential scan in 2,500ms. After creating a B-Tree index, index lookup reduces query latency by 96%. What is the new query latency in milliseconds?",
                "NUMERICAL",
                [
                    {"id": "A", "text": "100ms", "is_correct": True},
                    {"id": "B", "text": "250ms", "is_correct": False},
                    {"id": "C", "text": "50ms", "is_correct": False},
                    {"id": "D", "text": "125ms", "is_correct": False},
                ],
                "New latency = 2500ms * (1 - 0.96) = 2500 * 0.04 = 100ms.",
            ),
            (
                "All microservices that process payments must have mTLS enabled. Service Alpha does not have mTLS enabled. Service Beta connects to Service Alpha. Which conclusion is definitively true?",
                "LOGICAL",
                [
                    {"id": "A", "text": "Service Alpha does not process payments.", "is_correct": True},
                    {"id": "B", "text": "Service Beta does not process payments.", "is_correct": False},
                    {"id": "C", "text": "Service Beta has mTLS enabled.", "is_correct": False},
                    {"id": "D", "text": "Service Alpha is insecure.", "is_correct": False},
                ],
                "By modus tollens: If P (processes payments) -> Q (has mTLS). Not Q (Alpha does not have mTLS) -> Not P (Alpha does not process payments).",
            ),
        ]

        for idx, (prompt, dim, opts, expl) in enumerate(num_items):
            DiagnosticQuestion.objects.update_or_create(
                assessment=num_test,
                order_index=idx,
                defaults={
                    "prompt": prompt,
                    "dimension": dim,
                    "is_reverse_scored": False,
                    "question_type": "MULTIPLE_CHOICE",
                    "options": opts,
                    "explanation": expl,
                },
            )

        # =====================================================================
        # 6. Seed Sample Diagnostic Session Results (Amina Bello)
        # =====================================================================
        amina = StudentProfile.objects.filter(user__email="student.swe@futminna.edu.ng").first()
        if amina:
            # Seed Big Five Session
            StudentAssessmentSession.objects.get_or_create(
                student=amina,
                assessment=big5_test,
                defaults={
                    "status": "COMPLETED",
                    "raw_responses": {"0": 4, "1": 2, "2": 4, "3": 2, "4": 4, "5": 1, "6": 4, "7": 1, "8": 5, "9": 1, "10": 5, "11": 1, "12": 2, "13": 4, "14": 2, "15": 4, "16": 5, "17": 1, "18": 1, "19": 1},
                    "dimension_scores": {
                        "OPENNESS": 87.5,
                        "CONSCIENTIOUSNESS": 93.8,
                        "EXTRAVERSION": 68.8,
                        "AGREEABLENESS": 81.2,
                        "EMOTIONAL_STABILITY": 75.0,
                    },
                    "summary_code": "O88-C94-E69-A81-S75",
                    "percentile_rank": 92.00,
                    "summary_report": "**Exceptional Execution Discipline & Openness**: Demonstrates superior goal orientation, meticulous software testing standards, and high intellectual curiosity for cloud-native architecture.",
                    "career_recommendations": [
                        "Full-Stack Software Architecture & Cloud DevOps Engineering",
                        "Technical Systems Lead / Engineering Management",
                        "Database Reliability & Security Compliance Engineering",
                    ],
                    "completed_at": session_futm.created_at if session_futm else None,
                },
            )

            # Seed Holland RIASEC Session
            StudentAssessmentSession.objects.get_or_create(
                student=amina,
                assessment=riasec_test,
                defaults={
                    "status": "COMPLETED",
                    "raw_responses": {},
                    "dimension_scores": {
                        "INVESTIGATIVE": 95.0,
                        "REALISTIC": 88.0,
                        "CONVENTIONAL": 82.0,
                        "ENTERPRISING": 65.0,
                        "ARTISTIC": 60.0,
                        "SOCIAL": 55.0,
                    },
                    "summary_code": "IRC",
                    "percentile_rank": 94.50,
                    "summary_report": "**Primary Holland Code: `IRC` (Investigative - Realistic - Conventional)**\n\nOptimal alignment with Software Engineering, Distributed Systems, Cloud Automation, and Database Infrastructure.",
                    "career_recommendations": [
                        "Cloud Infrastructure, DevOps & Backend Engineering",
                        "Data Engineering, PostgreSQL Database Architecture & BI Analytics",
                        "Robotics & Embedded Systems Engineering",
                    ],
                    "completed_at": session_futm.created_at if session_futm else None,
                },
            )

            # Seed Numerical Reasoning Session
            StudentAssessmentSession.objects.get_or_create(
                student=amina,
                assessment=num_test,
                defaults={
                    "status": "COMPLETED",
                    "raw_responses": {},
                    "dimension_scores": {
                        "NUMERICAL_ACCURACY": 100.0,
                        "CORRECT_ITEMS": 5.0,
                        "TOTAL_ITEMS": 5.0,
                    },
                    "summary_code": "5/5 (100.0%)",
                    "percentile_rank": 98.00,
                    "summary_report": "**Superior Analytical Aptitude**: Flawless deduction on system throughput, logic extrapolation, and database performance mathematics.",
                    "career_recommendations": [
                        "Algorithmic Problem Solving",
                        "Data Modeling & Analytics",
                        "Financial & Statistical Systems",
                    ],
                    "completed_at": session_futm.created_at if session_futm else None,
                },
            )

            # =================================================================
            # 7. Seed Sample 24/7 AI Coach Conversation (Amina Bello)
            # =================================================================
            ai_conv, _ = AICoachConversation.objects.get_or_create(
                student=amina,
                title="SIWES Form 08 Logistics & Docker Containerization Rubric",
                defaults={
                    "is_active": True,
                    "case_summary": "• Student queried SIWES Form 08 logbook endorsement process and Microservices milestone evidence\n• Verified pathway: B.Tech Software Engineering (400L)\n• Employability Score: 50.8% with 3 verified milestones",
                },
            )

            AICoachMessage.objects.get_or_create(
                conversation=ai_conv,
                role="assistant",
                content=f"Hello Amina! I am your 24/7 AI Career Coach at **FUTMinna**. I can see that you are currently in your **400L SIWES Year** enrolled in **Full-Stack Cloud & DevOps Engineering** with **300 verified points**.\n\nHow can I help you with your SIWES Form 08 logbook or your 400L Kubernetes & CI/CD milestone today?",
            )

            AICoachMessage.objects.get_or_create(
                conversation=ai_conv,
                role="user",
                content="How do I submit my SIWES Form 08 and what evidence does the department require for the 400L Microservices milestone?",
            )

            AICoachMessage.objects.get_or_create(
                conversation=ai_conv,
                role="assistant",
                content="""Based on the **FUTMinna SIWES Industrial Training Policy Handbook** and your **Full-Stack Cloud & DevOps Pathway Rubric**:

1. **SIWES Form 08 Clearance [1]**:
   - Collect the physical ITCC Form 08 from the Directorate of SIWES (Bosso/Gidan Kwano campus).
   - Ensure your Industry-Based Supervisor endorses your weekly logbook entries with their official company stamp.
   - Submit the scanned signed Form 08 via your portal before the 16th week of training.

2. **400L Microservices Milestone Evidence [2]**:
   - Provide a public GitHub repository with a `docker-compose.yml` orchestrating at least two containerized services and a PostgreSQL database.
   - Include clear API endpoint documentation in your `README.md` and evidence of health check endpoints.
   - Your Departmental SIWES Coordinator will review the submission on your portal and award the **150 accredited employability points**.

Would you like help drafting your repository README or structuring your weekly SIWES logbook remarks?""",
                citations=[
                    {
                        "source_index": 1,
                        "citation_label": "[1]",
                        "document_title": "FUTMinna Student Handbook & SIWES Guidelines",
                        "section_reference": "Section 4.2 - ITCC Form 08 Submission",
                        "page_number": 14,
                    },
                    {
                        "source_index": 2,
                        "citation_label": "[2]",
                        "document_title": "Department of Software Engineering 400L Rubric",
                        "section_reference": "Milestone SWE-401 - Microservices Architecture",
                        "page_number": 3,
                    },
                ],
            )

            # =================================================================
            # 8. Seed Sample Counsellor Session & Case Note (Amina Bello)
            # =================================================================
            counsellor_staff = InstitutionStaff.objects.filter(institution=futminna, user__email="csc@futminna.edu.ng").first()
            if counsellor_staff:
                from datetime import date
                session_obj, _ = CounsellingSession.objects.get_or_create(
                    student=amina,
                    topic=CounsellingTopic.SIWES_CLEARANCE,
                    defaults={
                        "counsellor": counsellor_staff,
                        "student_notes": "Seeking advice on SIWES placement defense preparation and employer recommendations in Abuja/Lagos.",
                        "status": CounsellingSessionStatus.CONFIRMED,
                        "preferred_date": date(2026, 8, 20),
                        "preferred_time_slot": "11:00 AM - 11:45 AM",
                        "meeting_mode": "IN_PERSON",
                        "meeting_location": "School of ICT Deanery Boardroom, Gidan Kwano",
                    },
                )

                CounsellingCaseNote.objects.get_or_create(
                    session=session_obj,
                    student=amina,
                    author=counsellor_staff,
                    defaults={
                        "summary": "Reviewed Amina's Holland Code (IRC) and exceptional Big Five Conscientiousness (94%). Discussed SIWES placement at a fintech cloud infrastructure team. Student has completed 300 pts in the SWE roadmap.",
                        "action_items": [
                            {"task": "Prepare Docker compose repository evidence for Step 4 milestone", "due_date": "2026-08-25", "done": True},
                            {"task": "Collect SIWES Form 08 employer signature before mid-term inspection", "due_date": "2026-09-05", "done": False},
                        ],
                        "is_confidential": True,
                    },
                )

        self.stdout.write(self.style.SUCCESS("✓ Successfully seeded all 4 institutions, scoped staff assignments, psychometric item banks, student diagnostic profiles, AI coach conversations, and counselling appointments with password: '1234!@#$'!"))

