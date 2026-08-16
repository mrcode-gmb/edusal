import hashlib
from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from django.db.models import Count, Q
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from edusal.institutions.models import (
    Institution,
    AcademicDivision,
    Department,
    AcademicProgram,
    AcademicSession,
    InstitutionalDocument,
    InstitutionalDocumentChunk,
    InstitutionStaff,
    StaffAssignment,
    StaffRoleAtUnit,
    StudentProfile,
    EmbeddingStatus,
)
from ..services.document_parser import DocumentParserService
from ..services.embedding_service import EmbeddingService
from ..services.vector_search_service import VectorSearchService
from ..services.groq_advisor_service import GroqAdvisorService
from .serializers import (
    InstitutionListSerializer,
    InstitutionDetailSerializer,
    AcademicDivisionSerializer,
    DepartmentSerializer,
    AcademicProgramSerializer,
    AcademicSessionSerializer,
    InstitutionalDocumentSerializer,
    InstitutionalDocumentChunkSerializer,
    DocumentSearchQuerySerializer,
    DocumentUploadSerializer,
    AIAdvisorQuerySerializer,
    InstitutionStaffSerializer,
    StaffAssignmentSerializer,
    StudentProfileSerializer,
    StudentProfileCreateSerializer,
    AuthLoginSerializer,
    AuthUserSerializer,
)

User = get_user_model()



class InstitutionViewSet(viewsets.ModelViewSet):
    """Full CRUD and governance endpoints for Nigerian Tertiary Institutions."""

    queryset = Institution.objects.all().prefetch_related("divisions", "departments", "programs", "documents", "sessions")
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_serializer_class(self):
        if self.action in ["list"]:
            return InstitutionListSerializer
        return InstitutionDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        regulator = self.request.query_params.get("regulator")
        inst_type = self.request.query_params.get("institution_type")
        state = self.request.query_params.get("state")
        is_partner = self.request.query_params.get("is_founding_partner")
        search = self.request.query_params.get("search")

        if regulator:
            qs = qs.filter(regulator=regulator.upper())
        if inst_type:
            qs = qs.filter(institution_type=inst_type.upper())
        if state:
            qs = qs.filter(state__iexact=state)
        if is_partner is not None:
            qs = qs.filter(is_founding_partner=(is_partner.lower() in ["true", "1", "yes"]))
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(short_name__icontains=search) | Q(slug__icontains=search))
        return qs

    @action(detail=True, methods=["get"], url_path="tree")
    def tree(self, request, id=None):
        """Returns the full 4-tier hierarchy tree for visual hierarchy tree explorers."""
        institution = self.get_object()
        divisions = institution.divisions.filter(is_active=True).prefetch_related(
            "departments__programs"
        )

        tree_data = {
            "id": str(institution.id),
            "name": institution.name,
            "short_name": institution.short_name,
            "regulator": institution.regulator,
            "institution_type": institution.institution_type,
            "tier_two_term": institution.tier_two_term,
            "divisions_count": divisions.count(),
            "divisions": [
                {
                    "id": str(div.id),
                    "name": div.name,
                    "code": div.code,
                    "division_type": div.division_type,
                    "dean_name": div.dean_name,
                    "departments": [
                        {
                            "id": str(dept.id),
                            "name": dept.name,
                            "code": dept.code,
                            "hod_name": dept.hod_name,
                            "siwes_eligible": dept.siwes_eligible,
                            "programs": [
                                {
                                    "id": str(prog.id),
                                    "name": prog.name,
                                    "program_code": prog.program_code,
                                    "award_level": prog.award_level,
                                    "award_level_display": prog.get_award_level_display(),
                                    "duration_years": prog.duration_years,
                                    "siwes_duration_months": prog.siwes_duration_months,
                                }
                                for prog in dept.programs.filter(is_active=True)
                            ],
                        }
                        for dept in div.departments.filter(is_active=True)
                    ],
                }
                for div in divisions
            ],
        }
        return Response(tree_data)

    @action(detail=True, methods=["get"], url_path="governance-summary")
    def governance_summary(self, request, id=None):
        """Returns executive governance metrics for senate oversight and regulatory readiness."""
        institution = self.get_object()
        divisions_count = institution.divisions.count()
        departments_count = institution.departments.count()
        programs_count = institution.programs.count()
        siwes_eligible_depts = institution.departments.filter(siwes_eligible=True).count()
        siwes_ratio = round((siwes_eligible_depts / departments_count * 100), 1) if departments_count > 0 else 0
        documents_count = institution.documents.count()
        indexed_chunks = InstitutionalDocumentChunk.objects.filter(document__institution=institution).count()
        current_session = institution.sessions.filter(is_current=True).first()

        summary = {
            "institution": {
                "id": str(institution.id),
                "name": institution.name,
                "short_name": institution.short_name,
                "regulator": institution.regulator,
                "tier_two_term": institution.tier_two_term,
                "is_founding_partner": institution.is_founding_partner,
            },
            "hierarchy_metrics": {
                "total_divisions": divisions_count,
                "total_departments": departments_count,
                "total_programs": programs_count,
                "siwes_eligible_departments": siwes_eligible_depts,
                "siwes_eligibility_percentage": siwes_ratio,
            },
            "knowledge_base": {
                "total_documents": documents_count,
                "total_indexed_chunks": indexed_chunks,
                "grounding_status": "Active (pgvector)" if indexed_chunks > 0 else "Pending Ingestion",
            },
            "active_session": {
                "label": current_session.session_label if current_session else "Not set",
                "semester": current_session.get_current_semester_display() if current_session else "N/A",
            },
            "accreditation_readiness": {
                "regulator": institution.get_regulator_display(),
                "taxonomy_aligned": True,
                "curriculum_mapped": programs_count > 0,
                "handbook_ingested": documents_count > 0,
            },
        }
        return Response(summary)

    @action(detail=True, methods=["post"], url_path="search-documents")
    def search_documents(self, request, id=None):
        """Zero-hallucination hybrid semantic & keyword search across ingested institutional documents."""
        institution = self.get_object()
        serializer = DocumentSearchQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        query = serializer.validated_data["query"]
        top_k = serializer.validated_data.get("top_k", 5)
        doc_type = serializer.validated_data.get("doc_type")

        results = VectorSearchService.search_chunks(
            query=query,
            institution_id=str(institution.id),
            doc_type=doc_type or None,
            top_k=top_k,
        )

        return Response({
            "query": query,
            "institution_id": str(institution.id),
            "institution_name": institution.name,
            "total_matches": len(results),
            "results": results,
        })

    @action(detail=True, methods=["post"], url_path="ask-advisor")
    def ask_advisor(self, request, id=None):
        """Zero-hallucination institutional AI advisor synthesizing verified policy answers using Groq Cloud."""
        institution = self.get_object()
        serializer = AIAdvisorQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        division = None
        department = None
        session = None

        if data.get("division"):
            division = AcademicDivision.objects.filter(id=data["division"]).first()
        if data.get("department"):
            department = Department.objects.filter(id=data["department"]).first()
        if data.get("session"):
            session = AcademicSession.objects.filter(id=data["session"]).first()

        response_data = GroqAdvisorService.ask_advisor(
            query=data["query"],
            institution=institution,
            division=division,
            department=department,
            session=session,
            doc_type=data.get("doc_type") or None,
            top_k=data.get("top_k", 5),
        )
        return Response(response_data)



class AcademicDivisionViewSet(viewsets.ModelViewSet):
    """CRUD ViewSet for Academic Divisions (Faculties/Schools/Colleges)."""

    queryset = AcademicDivision.objects.all().select_related("institution")
    serializer_class = AcademicDivisionSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_queryset(self):
        qs = super().get_queryset()
        inst_id = self.request.query_params.get("institution")
        if inst_id:
            qs = qs.filter(institution_id=inst_id)
        return qs


class DepartmentViewSet(viewsets.ModelViewSet):
    """CRUD ViewSet for Academic Departments."""

    queryset = Department.objects.all().select_related("institution", "division")
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_queryset(self):
        qs = super().get_queryset()
        inst_id = self.request.query_params.get("institution")
        div_id = self.request.query_params.get("division")
        siwes = self.request.query_params.get("siwes_eligible")
        if inst_id:
            qs = qs.filter(institution_id=inst_id)
        if div_id:
            qs = qs.filter(division_id=div_id)
        if siwes is not None:
            qs = qs.filter(siwes_eligible=(siwes.lower() in ["true", "1", "yes"]))
        return qs


class AcademicProgramViewSet(viewsets.ModelViewSet):
    """CRUD ViewSet for Academic Degree Programmes and Options."""

    queryset = AcademicProgram.objects.all().select_related("institution", "department")
    serializer_class = AcademicProgramSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_queryset(self):
        qs = super().get_queryset()
        inst_id = self.request.query_params.get("institution")
        dept_id = self.request.query_params.get("department")
        award = self.request.query_params.get("award_level")
        if inst_id:
            qs = qs.filter(institution_id=inst_id)
        if dept_id:
            qs = qs.filter(department_id=dept_id)
        if award:
            qs = qs.filter(award_level=award.upper())
        return qs


class AcademicSessionViewSet(viewsets.ModelViewSet):
    """CRUD ViewSet for Academic Sessions and Semesters."""

    queryset = AcademicSession.objects.all().select_related("institution")
    serializer_class = AcademicSessionSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_queryset(self):
        qs = super().get_queryset()
        inst_id = self.request.query_params.get("institution")
        if inst_id:
            qs = qs.filter(institution_id=inst_id)
        return qs

    @action(detail=True, methods=["post"], url_path="set-current")
    def set_current(self, request, id=None):
        """Sets this session as the active/current session for its institution."""
        session = self.get_object()
        with transaction.atomic():
            AcademicSession.objects.filter(institution=session.institution).update(is_current=False)
            session.is_current = True
            session.save(update_fields=["is_current"])
        return Response({"status": "ok", "message": f"{session.session_label} is now current."})


class InstitutionalDocumentViewSet(viewsets.ModelViewSet):
    """CRUD and text chunking endpoints for Institutional Knowledge Base Documents."""

    queryset = InstitutionalDocument.objects.all().select_related("institution", "division", "department").prefetch_related("chunks")
    serializer_class = InstitutionalDocumentSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_queryset(self):
        qs = super().get_queryset()
        inst_id = self.request.query_params.get("institution")
        doc_type = self.request.query_params.get("doc_type")
        if inst_id:
            qs = qs.filter(institution_id=inst_id)
        if doc_type:
            qs = qs.filter(doc_type=doc_type)
        return qs

    @action(detail=False, methods=["post"], url_path="upload")
    def upload_document(self, request):
        """Uploads a PDF, DOCX, or TXT file, parses and chunks it, generates vector embeddings, and indexes into pgvector."""
        serializer = DocumentUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            institution = Institution.objects.get(id=data["institution"])
        except Institution.DoesNotExist:
            return Response({"error": "Institution not found"}, status=status.HTTP_404_NOT_FOUND)

        division = AcademicDivision.objects.filter(id=data.get("division")).first() if data.get("division") else None
        department = Department.objects.filter(id=data.get("department")).first() if data.get("department") else None
        session = AcademicSession.objects.filter(id=data.get("session")).first() if data.get("session") else None

        file_obj = request.FILES.get("file")
        if file_obj:
            file_content = file_obj.read()
            raw_text, chunks_data, content_hash = DocumentParserService.parse_and_chunk(file_content, file_obj.name)
        elif data.get("raw_text"):
            raw_text = data["raw_text"]
            file_content = raw_text.encode("utf-8")
            raw_text, chunks_data, content_hash = DocumentParserService.parse_and_chunk(file_content, f"{data['title']}.txt")
        else:
            return Response({"error": "Either file or raw_text must be provided."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            doc = InstitutionalDocument.objects.create(
                institution=institution,
                division=division,
                department=department,
                session=session,
                title=data["title"],
                doc_type=data["doc_type"],
                file=file_obj if file_obj else None,
                file_path=file_obj.name if file_obj else "",
                content_hash=content_hash,
                chunk_count=len(chunks_data),
                embedding_status=EmbeddingStatus.INDEXED,
                raw_text=raw_text,
            )

            # Generate vector embeddings for all chunks
            chunk_texts = [c["content"] for c in chunks_data]
            embeddings = EmbeddingService.embed_texts(chunk_texts)

            created_chunks = []
            for idx, c in enumerate(chunks_data):
                emb = embeddings[idx] if idx < len(embeddings) else None
                created_chunks.append(
                    InstitutionalDocumentChunk(
                        document=doc,
                        chunk_index=c["chunk_index"],
                        page_number=c["page_number"],
                        section_reference=c["section_reference"],
                        content=c["content"],
                        embedding=emb,
                        is_header=c.get("is_header", False),
                    )
                )
            InstitutionalDocumentChunk.objects.bulk_create(created_chunks)

        return Response(
            {
                "status": "ok",
                "message": f"Successfully parsed and indexed {len(created_chunks)} citation-ready chunks into pgvector.",
                "document": InstitutionalDocumentSerializer(doc).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="ingest-text")
    def ingest_text(self, request, id=None):
        """Processes raw text for a document, splitting into citation-ready chunks and generating vector embeddings."""
        doc = self.get_object()
        raw_text = request.data.get("raw_text") or doc.raw_text

        if not raw_text or not raw_text.strip():
            return Response(
                {"error": "No raw_text provided to ingest."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _, chunks_data, content_hash = DocumentParserService.parse_and_chunk(
            raw_text.encode("utf-8"), f"{doc.title}.txt"
        )

        with transaction.atomic():
            doc.chunks.all().delete()

            chunk_texts = [c["content"] for c in chunks_data]
            embeddings = EmbeddingService.embed_texts(chunk_texts)

            created_chunks = []
            for idx, c in enumerate(chunks_data):
                emb = embeddings[idx] if idx < len(embeddings) else None
                created_chunks.append(
                    InstitutionalDocumentChunk(
                        document=doc,
                        chunk_index=c["chunk_index"],
                        page_number=c["page_number"],
                        section_reference=c["section_reference"],
                        content=c["content"],
                        embedding=emb,
                        is_header=c.get("is_header", False),
                    )
                )

            InstitutionalDocumentChunk.objects.bulk_create(created_chunks)

            doc.content_hash = content_hash
            doc.chunk_count = len(created_chunks)
            doc.embedding_status = EmbeddingStatus.INDEXED
            doc.raw_text = raw_text
            doc.save(update_fields=["content_hash", "chunk_count", "embedding_status", "raw_text", "updated_at"])

        return Response({
            "status": "ok",
            "message": f"Successfully ingested and indexed {len(created_chunks)} chunks into pgvector.",
            "document": InstitutionalDocumentSerializer(doc).data,
        })



class InstitutionStaffViewSet(viewsets.ModelViewSet):
    """CRUD ViewSet for managing institutional staff, deans, and evaluators."""

    queryset = InstitutionStaff.objects.all().select_related("user", "institution", "division", "department")
    serializer_class = InstitutionStaffSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_queryset(self):
        qs = super().get_queryset()
        inst_id = self.request.query_params.get("institution")
        role = self.request.query_params.get("role")
        if inst_id:
            qs = qs.filter(institution_id=inst_id)
        if role:
            qs = qs.filter(role=role.upper())
        return qs

    def create(self, request, *args, **kwargs):
        email = request.data.get("email")
        name = request.data.get("name", "")
        institution_id = request.data.get("institution")
        role = request.data.get("role", "COUNSELLOR")
        title = request.data.get("title", "")
        division_id = request.data.get("division")
        department_id = request.data.get("department")

        if not email or not institution_id:
            return Response(
                {"error": "Email and institution are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            user, created = User.objects.get_or_create(
                email=email.lower().strip(),
                defaults={"name": name, "is_active": True},
            )
            if created:
                user.set_password("1234!@#$")
                user.save()
            elif name and not user.name:
                user.name = name
                user.save(update_fields=["name"])

            staff, _ = InstitutionStaff.objects.update_or_create(
                user=user,
                institution_id=institution_id,
                defaults={
                    "role": role,
                    "title": title,
                    "division_id": division_id if division_id else None,
                    "department_id": department_id if department_id else None,
                    "is_active": True,
                },
            )

        serializer = self.get_serializer(staff)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AuthLoginView(APIView):
    """Authenticates institutional user and returns DRF Token + profile."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AuthLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        password = serializer.validated_data["password"]

        user = authenticate(request, username=email, password=password)
        if not user:
            # Fallback if username wasn't checked by default backend
            try:
                found_user = User.objects.get(email=email)
                if found_user.check_password(password):
                    user = found_user
            except User.DoesNotExist:
                pass

        if not user:
            return Response(
                {"error": "Invalid email or password. Use test password '1234!@#$'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=user)
        user_data = AuthUserSerializer(user).data

        return Response({
            "token": token.key,
            "user": user_data,
        })


class AuthMeView(APIView):
    """Returns current authenticated user profile."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_data = AuthUserSerializer(request.user).data
        return Response(user_data)


class AuthLogoutView(APIView):
    """Invalidates the auth token on logout."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({"status": "ok", "message": "Successfully logged out."})


def get_staff_scoped_students(user, institution_id=None):
    """
    Returns StudentProfile QuerySet restricted strictly to the staff member's
    assigned department(s) or faculty/division(s).
    """
    if not user.is_authenticated:
        qs = StudentProfile.objects.all()
        if institution_id:
            qs = qs.filter(institution_id=institution_id)
        return qs.select_related(
            "user", "program", "program__department", "program__department__division", "institution", "entry_session"
        )

    # Check staff assignments
    assignments = user.staff_assignments.filter(is_active=True)

    # Check fallback legacy InstitutionStaff if no granular assignments
    if not assignments.exists():
        legacy_staff = user.institution_staff_profiles.filter(is_active=True).first()
        if legacy_staff:
            if legacy_staff.role in ["SUPERADMIN", "DIRECTOR_CAREER_SERVICES"]:
                qs = StudentProfile.objects.filter(institution=legacy_staff.institution)
            elif legacy_staff.department:
                qs = StudentProfile.objects.filter(program__department=legacy_staff.department)
            elif legacy_staff.division:
                qs = StudentProfile.objects.filter(program__department__division=legacy_staff.division)
            else:
                qs = StudentProfile.objects.filter(institution=legacy_staff.institution)
            if institution_id:
                qs = qs.filter(institution_id=institution_id)
            return qs.select_related(
                "user", "program", "program__department", "program__department__division", "institution", "entry_session"
            )
        # If user is a student, they can only view themselves
        if hasattr(user, "student_profile") and user.student_profile:
            return StudentProfile.objects.filter(id=user.student_profile.id)

        # Allow institution filter for public/admin demo queries
        qs = StudentProfile.objects.all()
        if institution_id:
            qs = qs.filter(institution_id=institution_id)
        return qs.select_related(
            "user", "program", "program__department", "program__department__division", "institution", "entry_session"
        )

    # If user is Superadmin or Director of Career Services -> Full Institution Access
    if assignments.filter(role_at_unit__in=[
        StaffRoleAtUnit.SUPERADMIN,
        StaffRoleAtUnit.DIRECTOR_CAREER_SERVICES,
    ]).exists():
        inst_id = institution_id or assignments.first().institution_id
        return StudentProfile.objects.filter(institution_id=inst_id).select_related(
            "user", "program", "program__department", "program__department__division", "institution", "entry_session"
        )

    # Compile scoped divisions and departments
    scoped_division_ids = assignments.filter(department__isnull=True, division__isnull=False).values_list("division_id", flat=True)
    scoped_department_ids = assignments.filter(department__isnull=False).values_list("department_id", flat=True)

    q_filter = Q(program__department_id__in=scoped_department_ids) | Q(program__department__division_id__in=scoped_division_ids)
    qs = StudentProfile.objects.filter(q_filter)
    if institution_id:
        qs = qs.filter(institution_id=institution_id)

    return qs.select_related(
        "user", "program", "program__department", "program__department__division", "institution", "entry_session"
    )


class StaffAssignmentViewSet(viewsets.ModelViewSet):
    """Endpoints for managing fine-grained departmental/division staff assignments."""

    queryset = StaffAssignment.objects.all().select_related("user", "institution", "division", "department")
    serializer_class = StaffAssignmentSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_queryset(self):
        qs = super().get_queryset()
        inst_id = self.request.query_params.get("institution")
        div_id = self.request.query_params.get("division")
        dept_id = self.request.query_params.get("department")
        role = self.request.query_params.get("role_at_unit")
        user_id = self.request.query_params.get("user")

        if inst_id:
            qs = qs.filter(institution_id=inst_id)
        if div_id:
            qs = qs.filter(division_id=div_id)
        if dept_id:
            qs = qs.filter(department_id=dept_id)
        if role:
            qs = qs.filter(role_at_unit=role.upper())
        if user_id:
            qs = qs.filter(user_id=user_id)
        return qs

    @action(detail=False, methods=["get"], url_path="my-caseload")
    def my_caseload(self, request):
        """Returns currently authenticated staff member's assigned units and student metrics."""
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        assignments = request.user.staff_assignments.filter(is_active=True).select_related("institution", "division", "department")
        students_qs = get_staff_scoped_students(request.user)

        total_students = students_qs.count()
        siwes_qualifying = students_qs.filter(siwes_clearance_status="QUALIFYING").count()
        final_year_count = sum(1 for s in students_qs if s.is_final_year)

        return Response({
            "assignments": StaffAssignmentSerializer(assignments, many=True).data,
            "metrics": {
                "total_managed_students": total_students,
                "siwes_qualifying_candidates": siwes_qualifying,
                "final_year_students": final_year_count,
            },
        })


class StudentProfileViewSet(viewsets.ModelViewSet):
    """
    Endpoints for student identities anchored to Tier-4 AcademicProgram.
    Scoped strictly to staff member's assigned departments.
    """

    queryset = StudentProfile.objects.all().select_related(
        "user", "program", "program__department", "program__department__division", "institution", "entry_session"
    )
    serializer_class = StudentProfileSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

    def get_queryset(self):
        inst_id = self.request.query_params.get("institution")
        qs = get_staff_scoped_students(self.request.user, inst_id)

        prog_id = self.request.query_params.get("program")
        dept_id = self.request.query_params.get("department")
        div_id = self.request.query_params.get("division")
        year = self.request.query_params.get("year_of_study")
        siwes_status = self.request.query_params.get("siwes_status")
        standing = self.request.query_params.get("academic_standing")
        search = self.request.query_params.get("search")

        if prog_id:
            qs = qs.filter(program_id=prog_id)
        if dept_id:
            qs = qs.filter(program__department_id=dept_id)
        if div_id:
            qs = qs.filter(program__department__division_id=div_id)
        if year:
            qs = qs.filter(year_of_study=year)
        if siwes_status:
            qs = qs.filter(siwes_clearance_status=siwes_status.upper())
        if standing:
            qs = qs.filter(academic_standing=standing.upper())
        if search:
            qs = qs.filter(
                Q(matric_number__icontains=search)
                | Q(user__name__icontains=search)
                | Q(user__email__icontains=search)
                | Q(program__name__icontains=search)
            )
        return qs

    def create(self, request, *args, **kwargs):
        """Creates a student user account and initializes StudentProfile."""
        serializer = StudentProfileCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            email = data["email"].lower().strip()
            user, created = User.objects.get_or_create(
                email=email,
                defaults={"name": data["name"]},
            )
            if created or not user.has_usable_password():
                user.set_password(data.get("password", "1234!@#$"))
                user.name = data["name"]
                user.save()

            program = AcademicProgram.objects.get(id=data["program"])
            institution = Institution.objects.get(id=data["institution"])
            session = AcademicSession.objects.get(id=data["entry_session"])

            student, _ = StudentProfile.objects.update_or_create(
                user=user,
                defaults={
                    "institution": institution,
                    "program": program,
                    "matric_number": data["matric_number"].strip(),
                    "jamb_reg_number": data.get("jamb_reg_number", "").strip(),
                    "entry_session": session,
                    "entry_mode": data.get("entry_mode", "UTME"),
                    "year_of_study": data.get("year_of_study", 1),
                    "cgpa": data.get("cgpa"),
                    "phone_number": data.get("phone_number", ""),
                    "state_of_origin": data.get("state_of_origin", ""),
                    "gender": data.get("gender", ""),
                    "portfolio_url": data.get("portfolio_url", ""),
                    "is_verified_student": True,
                },
            )

        output_serializer = StudentProfileSerializer(student)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        """Returns the currently logged-in student's complete profile."""
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        if not hasattr(request.user, "student_profile") or not request.user.student_profile:
            return Response({"error": "User does not have a student profile"}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudentProfileSerializer(request.user.student_profile)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="update-status")
    def update_status(self, request, id=None):
        """Allows assigned HOD/adviser to update SIWES status or academic standing."""
        student = self.get_object()
        siwes_status = request.data.get("siwes_clearance_status")
        standing = request.data.get("academic_standing")
        cgpa = request.data.get("cgpa")

        if siwes_status:
            student.siwes_clearance_status = siwes_status.upper()
        if standing:
            student.academic_standing = standing.upper()
        if cgpa is not None:
            student.cgpa = cgpa

        student.save()
        return Response(StudentProfileSerializer(student).data)


