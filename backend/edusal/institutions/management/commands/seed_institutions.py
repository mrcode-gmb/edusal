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
)


class Command(BaseCommand):
    help = "Seeds database with archetypal Nigerian tertiary institutions (NUC, NBTE, NCCE) and hierarchy"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Nigerian Tertiary Institutions..."))

        # =====================================================================
        # 1. NUC University Archetype: Federal University of Technology, Minna
        # =====================================================================
        futminna, created = Institution.objects.get_or_create(
            slug="futminna",
            defaults={
                "name": "Federal University of Technology, Minna",
                "short_name": "FUTMinna",
                "institution_type": InstitutionType.UNIVERSITY,
                "ownership": OwnershipType.FEDERAL,
                "regulator": RegulatorType.NUC,
                "tier_two_term": TierTwoTerm.SCHOOL,  # FUTMinna uses "Schools"
                "domain_whitelist": ["@futminna.edu.ng"],
                "address": "Gidan Kwano Main Campus, KM 10 Bida Road",
                "state": "Niger",
                "is_founding_partner": True,
                "status": InstitutionStatus.ACTIVE,
            },
        )
        self.stdout.write(f"  {'Created' if created else 'Found'} University: {futminna.name}")

        # FUTMinna Sessions
        AcademicSession.objects.get_or_create(
            institution=futminna,
            session_label="2025/2026",
            defaults={
                "current_semester": SemesterChoice.SECOND_SEMESTER,
                "is_current": True,
            },
        )

        # SICT Division
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

        # SEET Division
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

        # Departments & Programs under SICT
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

        # Departments under SEET
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

        # Document & Vector Chunks for FUTMinna
        doc_futm, _ = InstitutionalDocument.objects.get_or_create(
            institution=futminna,
            title="FUTMinna 2025/2026 SIWES & Industrial Attachment Manual",
            defaults={
                "division": sict,
                "department": swe,
                "doc_type": DocumentType.SIWES_CALENDAR,
                "file_path": "documents/futminna_siwes_2026.pdf",
                "content_hash": "sha256:4f8a91bc732e67df8120b08dc66291e1f5c8feb105bba042ebf2f0ea59a9df7f",
                "chunk_count": 3,
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

        # =====================================================================
        # 2. NBTE Polytechnic Archetype: Yaba College of Technology (YabaTech)
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

        # =====================================================================
        # 3. NCCE College of Education Archetype: Federal College of Education, Zaria
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
                "siwes_eligible": False,  # Uses Teaching Practice instead
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

        self.stdout.write(self.style.SUCCESS("✓ Successfully seeded all 3 institutional archetypes (NUC, NBTE, NCCE)!"))
