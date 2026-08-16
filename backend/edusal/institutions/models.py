import uuid
from django.db import models
from pgvector.django import VectorField


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
    title = models.CharField(max_length=255, help_text="e.g. FUTMinna 2025/2026 SIWES Operational Guidelines")
    doc_type = models.CharField(
        max_length=30,
        choices=DocumentType.choices,
        default=DocumentType.STUDENT_HANDBOOK,
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
        dimensions=1536,
        null=True,
        blank=True,
        help_text="1536-dimensional vector embedding for cosine similarity search in PostgreSQL",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["document", "chunk_index"]
        unique_together = ("document", "chunk_index")
        verbose_name = "Document Chunk (Vector)"
        verbose_name_plural = "Document Chunks (Vector)"

    def __str__(self) -> str:
        return f"{self.document.title} [Chunk #{self.chunk_index}, p.{self.page_number}]"
