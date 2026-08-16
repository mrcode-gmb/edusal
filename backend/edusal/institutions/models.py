import uuid
from django.conf import settings
from django.db import models
from pgvector.django import VectorField


class InstitutionRole(models.TextChoices):
    SUPERADMIN = "SUPERADMIN", "Institution Superadmin"
    DIRECTOR_CAREER_SERVICES = "DIRECTOR_CAREER_SERVICES", "Director of Career Services"
    DEAN = "DEAN", "Dean of Faculty / School"
    HOD = "HOD", "Head of Department (HOD)"
    COUNSELLOR = "COUNSELLOR", "Faculty Career Counsellor & Evaluator"


class InstitutionType(models.TextChoices):
    UNIVERSITY = "UNIVERSITY", "University"
    POLYTECHNIC = "POLYTECHNIC", "Polytechnic"
    COLLEGE_OF_EDUCATION = "COLLEGE_OF_EDUCATION", "College of Education"
    MONOTECHNIC = "MONOTECHNIC", "Monotechnic"


class OwnershipType(models.TextChoices):
    FEDERAL = "FEDERAL", "Federal Government"
    STATE = "STATE", "State Government"
    PRIVATE = "PRIVATE", "Private"


class RegulatorType(models.TextChoices):
    NUC = "NUC", "National Universities Commission (NUC)"
    NBTE = "NBTE", "National Board for Technical Education (NBTE)"
    NCCE = "NCCE", "National Commission for Colleges of Education (NCCE)"


class TierTwoTerm(models.TextChoices):
    FACULTY = "FACULTY", "Faculty"
    SCHOOL = "SCHOOL", "School"
    COLLEGE = "COLLEGE", "College"


class InstitutionStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    PROVISIONING = "PROVISIONING", "Provisioning"
    SUSPENDED = "SUSPENDED", "Suspended"


class DivisionType(models.TextChoices):
    FACULTY = "FACULTY", "Faculty"
    SCHOOL = "SCHOOL", "School"
    COLLEGE = "COLLEGE", "College"


class AwardLevel(models.TextChoices):
    BSC = "BSC", "Bachelor of Science (B.Sc.)"
    BTECH = "BTECH", "Bachelor of Technology (B.Tech.)"
    BENG = "BENG", "Bachelor of Engineering (B.Eng.)"
    BA = "BA", "Bachelor of Arts (B.A.)"
    LLB = "LLB", "Bachelor of Laws (LL.B.)"
    ND = "ND", "National Diploma (ND)"
    HND = "HND", "Higher National Diploma (HND)"
    NCE = "NCE", "Nigeria Certificate in Education (NCE)"
    PGD = "PGD", "Postgraduate Diploma (PGD)"
    MSC = "MSC", "Master of Science (M.Sc.)"


class SemesterChoice(models.TextChoices):
    FIRST_SEMESTER = "FIRST_SEMESTER", "First Semester (Harmattan / Alpha)"
    SECOND_SEMESTER = "SECOND_SEMESTER", "Second Semester (Rain / Omega)"


class DocumentType(models.TextChoices):
    STUDENT_HANDBOOK = "STUDENT_HANDBOOK", "Student Handbook"
    SIWES_CALENDAR = "SIWES_CALENDAR", "SIWES / ITF Guidelines & Calendar"
    CURRICULUM_BMAS = "CURRICULUM_BMAS", "Curriculum Standards (CCMAS / BMAS)"
    EMPLOYER_BRIEF = "EMPLOYER_BRIEF", "Employer Partnership Brief"
    POLICY = "POLICY", "Institutional Policy & Code of Conduct"


class EmbeddingStatus(models.TextChoices):
    PENDING = "PENDING", "Pending Ingestion"
    INDEXED = "INDEXED", "Indexed in pgvector"
    FAILED = "FAILED", "Failed Processing"


class Institution(models.Model):
    """Tenant root representing a Nigerian Tertiary Institution."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True, help_text="e.g. Federal University of Technology, Minna")
    short_name = models.CharField(max_length=60, help_text="e.g. FUTMinna / YabaTech")
    slug = models.SlugField(max_length=100, unique=True)
    institution_type = models.CharField(
        max_length=30,
        choices=InstitutionType.choices,
        default=InstitutionType.UNIVERSITY,
    )
    ownership = models.CharField(
        max_length=20,
        choices=OwnershipType.choices,
        default=OwnershipType.FEDERAL,
    )
    regulator = models.CharField(
        max_length=20,
        choices=RegulatorType.choices,
        default=RegulatorType.NUC,
    )
    tier_two_term = models.CharField(
        max_length=20,
        choices=TierTwoTerm.choices,
        default=TierTwoTerm.FACULTY,
        help_text="Customizes UI label: 'Faculty' in Universities, 'School' in Polytechnics/COEs, 'College' in Collegiate institutions",
    )
    domain_whitelist = models.JSONField(
        default=list,
        blank=True,
        help_text="Email domains allowed for institutional staff and student self-enrollment e.g. ['@futminna.edu.ng']",
    )
    address = models.CharField(max_length=255, blank=True)
    state = models.CharField(max_length=50, blank=True, help_text="Nigerian State e.g. Niger, Lagos, Kaduna")
    is_founding_partner = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=InstitutionStatus.choices,
        default=InstitutionStatus.ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Institution"
        verbose_name_plural = "Institutions"

    def __str__(self) -> str:
        return f"{self.name} ({self.short_name})"


class AcademicDivision(models.Model):
    """Tier 2: Faculty in Universities, School in Polytechnics/COEs, or College in Medical/Agricultural setups."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name="divisions",
    )
    name = models.CharField(max_length=200, help_text="e.g. School of Information and Communication Technology")
    code = models.CharField(max_length=20, blank=True, help_text="e.g. SICT")
    division_type = models.CharField(
        max_length=20,
        choices=DivisionType.choices,
        default=DivisionType.FACULTY,
    )
    dean_name = models.CharField(max_length=150, blank=True)
    dean_email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["institution", "name"]
        unique_together = ("institution", "name")
        verbose_name = "Academic Division (Faculty / School)"
        verbose_name_plural = "Academic Divisions (Faculties / Schools)"

    def __str__(self) -> str:
        return f"{self.name} — {self.institution.short_name}"


class Department(models.Model):
    """Tier 3: Academic Department housing degree programs and faculty evaluators."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name="departments",
    )
    division = models.ForeignKey(
        AcademicDivision,
        on_delete=models.CASCADE,
        related_name="departments",
    )
    name = models.CharField(max_length=200, help_text="e.g. Department of Software Engineering")
    code = models.CharField(max_length=20, blank=True, help_text="e.g. SWE")
    hod_name = models.CharField(max_length=150, blank=True, help_text="Head of Department Name")
    hod_email = models.EmailField(blank=True)
    siwes_eligible = models.BooleanField(
        default=True,
        help_text="Designates whether students in this department participate in national SIWES cycles",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["division", "name"]
        unique_together = ("division", "name")
        verbose_name = "Academic Department"
        verbose_name_plural = "Academic Departments"

    def __str__(self) -> str:
        return f"{self.name} ({self.division.name})"


class AcademicProgram(models.Model):
    """Tier 4: Leaf node representing specific degree award options or NCE subject combinations."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name="programs",
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="programs",
    )
    name = models.CharField(max_length=200, help_text="e.g. B.Tech Software Engineering / ND Computer Science")
    program_code = models.CharField(max_length=30, blank=True, help_text="e.g. SWE-BTECH / ND-CS")
    award_level = models.CharField(
        max_length=20,
        choices=AwardLevel.choices,
        default=AwardLevel.BSC,
    )
    duration_years = models.PositiveSmallIntegerField(
        default=4,
        help_text="Standard program duration in years (e.g. 5 for Engineering, 2 for ND, 3 for NCE)",
    )
    siwes_duration_months = models.PositiveSmallIntegerField(
        default=6,
        help_text="Typical SIWES attachment period in months (0 if not applicable)",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["department", "name"]
        unique_together = ("department", "name")
        verbose_name = "Academic Programme"
        verbose_name_plural = "Academic Programmes"

    def __str__(self) -> str:
        return f"{self.name} [{self.get_award_level_display()}]"


class AcademicSession(models.Model):
    """Academic session and semester tracking for cohort lifecycle governance."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name="sessions",
    )
    session_label = models.CharField(max_length=20, help_text="e.g. 2025/2026")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    current_semester = models.CharField(
        max_length=30,
        choices=SemesterChoice.choices,
        default=SemesterChoice.FIRST_SEMESTER,
    )
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-session_label", "-is_current"]
        unique_together = ("institution", "session_label")
        verbose_name = "Academic Session"
        verbose_name_plural = "Academic Sessions"

    def __str__(self) -> str:
        status = " (Current)" if self.is_current else ""
        return f"{self.institution.short_name} — {self.session_label}{status}"


class InstitutionalDocument(models.Model):
    """Official student handbooks, SIWES calendars, and departmental guidelines ingested into pgvector."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    division = models.ForeignKey(
        AcademicDivision,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents",
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents",
    )
    session = models.ForeignKey(
        AcademicSession,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents",
        help_text="Academic session this document applies to (e.g. 2025/2026)",
    )
    title = models.CharField(max_length=255, help_text="e.g. FUTMinna 2025/2026 SIWES Operational Guidelines")
    doc_type = models.CharField(
        max_length=30,
        choices=DocumentType.choices,
        default=DocumentType.STUDENT_HANDBOOK,
    )
    file = models.FileField(
        upload_to="institutional_documents/%Y/%m/",
        null=True,
        blank=True,
        help_text="Uploaded handbook or guidelines document (PDF, DOCX, TXT)",
    )
    file_path = models.CharField(max_length=500, blank=True, help_text="Relative storage or media path")
    content_hash = models.CharField(max_length=128, blank=True, help_text="SHA-256 hash of document for auditability")
    chunk_count = models.PositiveIntegerField(default=0)
    embedding_status = models.CharField(
        max_length=20,
        choices=EmbeddingStatus.choices,
        default=EmbeddingStatus.PENDING,
    )
    raw_text = models.TextField(blank=True, help_text="Extracted text from document")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Institutional Document"
        verbose_name_plural = "Institutional Documents"

    def __str__(self) -> str:
        return f"{self.title} ({self.get_doc_type_display()})"


class InstitutionalDocumentChunk(models.Model):
    """Vector-embedded text chunk stored in pgvector for zero-hallucination citation retrieval."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(
        InstitutionalDocument,
        on_delete=models.CASCADE,
        related_name="chunks",
    )
    chunk_index = models.PositiveIntegerField()
    page_number = models.PositiveIntegerField(default=1)
    section_reference = models.CharField(
        max_length=200,
        blank=True,
        help_text="e.g. Section 4.2: Placement Prerequisites",
    )
    content = models.TextField()
    embedding = VectorField(
        dimensions=384,
        null=True,
        blank=True,
        help_text="384-dimensional vector embedding (bge-small-en-v1.5 / all-MiniLM-L6-v2) for cosine similarity search in PostgreSQL",
    )
    is_header = models.BooleanField(
        default=False,
        help_text="Indicates whether this chunk represents a major section heading or table of contents",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["document", "chunk_index"]
        unique_together = ("document", "chunk_index")
        verbose_name = "Document Chunk (Vector)"
        verbose_name_plural = "Document Chunks (Vector)"

    def __str__(self) -> str:
        return f"{self.document.title} [Chunk #{self.chunk_index}, p.{self.page_number}]"


class InstitutionStaff(models.Model):
    """Institutional staff member, dean, HOD, counsellor, or superadmin."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="institution_staff_profiles",
    )
    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name="staff_members",
    )
    division = models.ForeignKey(
        AcademicDivision,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="staff_members",
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="staff_members",
    )
    role = models.CharField(
        max_length=40,
        choices=InstitutionRole.choices,
        default=InstitutionRole.SUPERADMIN,
    )
    title = models.CharField(
        max_length=150,
        blank=True,
        help_text="e.g. Director of ICT / Dean of SICT / HOD Computer Science",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["institution", "role", "user__name"]
        unique_together = ("user", "institution")
        verbose_name = "Institution Staff"
        verbose_name_plural = "Institution Staff"

    def __str__(self) -> str:
        return f"{self.user.email} — {self.get_role_display()} ({self.institution.short_name})"


class StaffRoleAtUnit(models.TextChoices):
    DEAN = "DEAN", "Dean of Division"
    SUB_DEAN = "SUB_DEAN", "Sub-Dean (Academics / Student Affairs)"
    HOD = "HOD", "Head of Department (HOD)"
    DEPARTMENTAL_COUNSELLOR = "DEPARTMENTAL_COUNSELLOR", "Departmental Career Counsellor"
    FACULTY_COUNSELLOR = "FACULTY_COUNSELLOR", "Faculty Lead Counsellor"
    SIWES_COORDINATOR = "SIWES_COORDINATOR", "Departmental SIWES Coordinator"
    ACADEMIC_ADVISER = "ACADEMIC_ADVISER", "Level Academic Adviser"
    FACULTY_EVALUATOR = "FACULTY_EVALUATOR", "Technical Milestone Evaluator"
    DIRECTOR_CAREER_SERVICES = "DIRECTOR_CAREER_SERVICES", "Director of Career Services (Institution-Wide)"
    SUPERADMIN = "SUPERADMIN", "Institution Superadmin"


class StaffAssignment(models.Model):
    """Fine-grained scoping for staff members assigned to specific faculties, departments, and roles."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="staff_assignments",
    )
    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name="staff_assignments",
    )
    division = models.ForeignKey(
        AcademicDivision,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="staff_assignments",
        help_text="If set and department is null, staff is scoped to the entire division/faculty",
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="staff_assignments",
        help_text="If set, staff is scoped to this specific department",
    )
    role_at_unit = models.CharField(
        max_length=40,
        choices=StaffRoleAtUnit.choices,
        default=StaffRoleAtUnit.FACULTY_EVALUATOR,
    )
    official_title = models.CharField(
        max_length=200,
        blank=True,
        help_text="e.g. Academic Adviser — 300L SLT Track",
    )
    assigned_years_of_study = models.JSONField(
        default=list,
        blank=True,
        help_text="List of years of study assigned (e.g. [3, 4, 5])",
    )
    can_evaluate_milestones = models.BooleanField(
        default=True,
        help_text="Permission to authenticate student evidence and milestones",
    )
    can_manage_waivers = models.BooleanField(
        default=False,
        help_text="Permission to grant prerequisite waivers for SIWES placement",
    )
    max_caseload = models.PositiveIntegerField(
        default=150,
        help_text="Maximum student caseload allocation",
    )
    is_primary = models.BooleanField(
        default=True,
        help_text="Marks this assignment as the staff member's primary institutional post",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["institution", "department", "user__name"]
        verbose_name = "Staff Assignment"
        verbose_name_plural = "Staff Assignments"

    def __str__(self) -> str:
        unit = self.department.name if self.department else (self.division.name if self.division else self.institution.short_name)
        return f"{self.user.email} — {self.get_role_at_unit_display()} ({unit})"


class EntryMode(models.TextChoices):
    UTME = "UTME", "UTME (Standard Entry - Year 1)"
    DIRECT_ENTRY = "DIRECT_ENTRY", "Direct Entry (DE - Year 2)"
    TRANSFER = "TRANSFER", "Inter-Faculty / University Transfer"
    CONVERSION = "CONVERSION", "HND to B.Sc. Conversion"


class AcademicStanding(models.TextChoices):
    IN_GOOD_STANDING = "IN_GOOD_STANDING", "In Good Standing"
    PROBATION = "PROBATION", "Academic Warning / Probation"
    SIWES_SUSPENDED = "SIWES_SUSPENDED", "SIWES Clearance Suspended"
    GRADUATED = "GRADUATED", "Graduated (Awaiting NYSC)"
    ALUMNI = "ALUMNI", "Alumni / Post-NYSC"
    DEFERRED = "DEFERRED", "Session Deferred"


class SIWESClearanceStatus(models.TextChoices):
    NOT_ELIGIBLE = "NOT_ELIGIBLE", "Not Yet Eligible (Pre-SIWES Year)"
    QUALIFYING = "QUALIFYING", "Qualifying (Prerequisites in Progress)"
    CLEARED = "CLEARED", "Cleared by HOD & Coordinator (Ready for Placement)"
    ON_ATTACHMENT = "ON_ATTACHMENT", "Active On Attachment"
    COMPLETED = "COMPLETED", "Attachment Logbook & Presentation Completed"


class StudentProfile(models.Model):
    """
    Hierarchical Student Identity anchored directly to AcademicProgram (Tier 4).
    Dynamically computes student level based on the program's duration_years (4-yr, 5-yr, 2-yr ND/HND, 3-yr NCE).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    institution = models.ForeignKey(
        Institution,
        on_delete=models.PROTECT,
        related_name="students",
    )
    program = models.ForeignKey(
        AcademicProgram,
        on_delete=models.PROTECT,
        related_name="enrolled_students",
        help_text="Tier-4 degree option (which links to Department -> Division -> Institution)",
    )
    matric_number = models.CharField(
        max_length=50,
        db_index=True,
        help_text="e.g. 2021/1/74892CS or GSU/SCI/CSC/22/0104",
    )
    jamb_reg_number = models.CharField(
        max_length=50,
        blank=True,
        db_index=True,
        help_text="JAMB registration number for national verification",
    )
    entry_session = models.ForeignKey(
        AcademicSession,
        on_delete=models.PROTECT,
        related_name="matriculated_students",
    )
    entry_mode = models.CharField(
        max_length=20,
        choices=EntryMode.choices,
        default=EntryMode.UTME,
    )
    year_of_study = models.PositiveSmallIntegerField(
        default=1,
        help_text="Current year of study (1 to 6), e.g. 1 for 100L/ND I, 4 for 400L/HND II, 5 for 500L SLT/Eng",
    )
    is_spillover = models.BooleanField(
        default=False,
        help_text="True if student has exceeded standard program duration",
    )
    cgpa = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Current cumulative grade point average (e.g. 4.35)",
    )
    academic_standing = models.CharField(
        max_length=30,
        choices=AcademicStanding.choices,
        default=AcademicStanding.IN_GOOD_STANDING,
    )
    siwes_clearance_status = models.CharField(
        max_length=30,
        choices=SIWESClearanceStatus.choices,
        default=SIWESClearanceStatus.NOT_ELIGIBLE,
    )
    phone_number = models.CharField(max_length=30, blank=True)
    state_of_origin = models.CharField(max_length=50, blank=True)
    gender = models.CharField(max_length=15, blank=True)
    bio = models.TextField(blank=True)
    portfolio_url = models.URLField(
        blank=True,
        help_text="Link to student GitHub, Behance, or live project repository",
    )
    linkedin_url = models.URLField(blank=True)
    is_verified_student = models.BooleanField(
        default=True,
        help_text="True if matched with institutional admissions ledger",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["institution", "program", "matric_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["institution", "matric_number"],
                name="unique_matric_per_institution",
            ),
        ]
        indexes = [
            models.Index(fields=["institution", "year_of_study"]),
            models.Index(fields=["program", "year_of_study"]),
        ]
        verbose_name = "Student Profile"
        verbose_name_plural = "Student Profiles"

    def __str__(self) -> str:
        return f"{self.matric_number} — {self.user.name or self.user.email} ({self.program.name})"

    @property
    def is_final_year(self) -> bool:
        """True if the student is in the final year of their specific program."""
        return self.year_of_study >= self.program.duration_years

    @property
    def is_siwes_year(self) -> bool:
        """Determines if the current year of study is the program's primary SIWES attachment year."""
        dur = self.program.duration_years
        if dur == 5:
            return self.year_of_study == 4  # Year 4 for 5-year programs (B.Tech / B.Eng / SLT)
        elif dur == 4:
            return self.year_of_study == 3  # Year 3 for 4-year programs (B.Sc.)
        elif dur == 2 and self.program.award_level == AwardLevel.ND:
            return self.year_of_study == 2  # Year 2 for ND programs
        return False

    def get_level_code(self) -> str:
        """Returns normalized level code (e.g. '100', '400', '500', 'ND_I', 'ND_II', 'NCE_III')."""
        inst_type = self.institution.institution_type
        award = self.program.award_level

        if inst_type == InstitutionType.POLYTECHNIC:
            if award == AwardLevel.ND:
                return "ND_I" if self.year_of_study == 1 else "ND_II"
            elif award == AwardLevel.HND:
                return "HND_I" if self.year_of_study == 1 else "HND_II"

        if inst_type == InstitutionType.COLLEGE_OF_EDUCATION:
            levels = {1: "NCE_I", 2: "NCE_II", 3: "NCE_III"}
            return levels.get(self.year_of_study, f"NCE_{self.year_of_study}")

        # University / standard numerical levels
        return f"{self.year_of_study * 100}"

    def get_level_display(self) -> str:
        """
        Dynamically returns human-readable level label tailored to program duration:
        e.g. '500 Level (Final Year)' for SLT/B.Tech, '400 Level (Final Year)' for 4-yr B.Sc,
        'ND II (Final Year)' for Polytechnic ND, 'NCE III (Final Year)' for College of Ed.
        """
        code = self.get_level_code()

        if self.is_spillover:
            return f"{code} Level (Spillover)"

        if self.is_final_year:
            if "ND_" in code or "HND_" in code or "NCE_" in code:
                formatted = code.replace("_", " ")
                return f"{formatted} (Final Year)"
            return f"{code} Level (Final Year)"

        if self.is_siwes_year:
            if "ND_" in code or "HND_" in code:
                formatted = code.replace("_", " ")
                return f"{formatted} (SIWES Year)"
            return f"{code} Level (SIWES Year)"

        if "ND_" in code or "HND_" in code or "NCE_" in code:
            return code.replace("_", " ")

        return f"{code} Level"

