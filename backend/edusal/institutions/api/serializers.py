from rest_framework import serializers
from edusal.institutions.models import (
    Institution,
    AcademicDivision,
    Department,
    AcademicProgram,
    AcademicSession,
    InstitutionalDocument,
    InstitutionalDocumentChunk,
)


class AcademicProgramSerializer(serializers.ModelSerializer):
    award_level_display = serializers.CharField(source="get_award_level_display", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = AcademicProgram
        fields = [
            "id",
            "institution",
            "department",
            "department_name",
            "name",
            "program_code",
            "award_level",
            "award_level_display",
            "duration_years",
            "siwes_duration_months",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class DepartmentSerializer(serializers.ModelSerializer):
    division_name = serializers.CharField(source="division.name", read_only=True)
    institution_name = serializers.CharField(source="institution.name", read_only=True)
    programs_count = serializers.IntegerField(source="programs.count", read_only=True)
    programs = AcademicProgramSerializer(many=True, read_only=True)

    class Meta:
        model = Department
        fields = [
            "id",
            "institution",
            "institution_name",
            "division",
            "division_name",
            "name",
            "code",
            "hod_name",
            "hod_email",
            "siwes_eligible",
            "is_active",
            "programs_count",
            "programs",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AcademicDivisionSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source="institution.name", read_only=True)
    division_type_display = serializers.CharField(source="get_division_type_display", read_only=True)
    departments_count = serializers.IntegerField(source="departments.count", read_only=True)
    departments = DepartmentSerializer(many=True, read_only=True)

    class Meta:
        model = AcademicDivision
        fields = [
            "id",
            "institution",
            "institution_name",
            "name",
            "code",
            "division_type",
            "division_type_display",
            "dean_name",
            "dean_email",
            "is_active",
            "departments_count",
            "departments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AcademicSessionSerializer(serializers.ModelSerializer):
    current_semester_display = serializers.CharField(source="get_current_semester_display", read_only=True)

    class Meta:
        model = AcademicSession
        fields = [
            "id",
            "institution",
            "session_label",
            "start_date",
            "end_date",
            "current_semester",
            "current_semester_display",
            "is_current",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class InstitutionalDocumentChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionalDocumentChunk
        fields = [
            "id",
            "document",
            "chunk_index",
            "page_number",
            "section_reference",
            "content",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class InstitutionalDocumentSerializer(serializers.ModelSerializer):
    doc_type_display = serializers.CharField(source="get_doc_type_display", read_only=True)
    embedding_status_display = serializers.CharField(source="get_embedding_status_display", read_only=True)
    division_name = serializers.CharField(source="division.name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)
    chunks = InstitutionalDocumentChunkSerializer(many=True, read_only=True)

    class Meta:
        model = InstitutionalDocument
        fields = [
            "id",
            "institution",
            "division",
            "division_name",
            "department",
            "department_name",
            "title",
            "doc_type",
            "doc_type_display",
            "file_path",
            "content_hash",
            "chunk_count",
            "embedding_status",
            "embedding_status_display",
            "raw_text",
            "chunks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "chunk_count", "embedding_status", "content_hash", "created_at", "updated_at"]


class InstitutionListSerializer(serializers.ModelSerializer):
    institution_type_display = serializers.CharField(source="get_institution_type_display", read_only=True)
    regulator_display = serializers.CharField(source="get_regulator_display", read_only=True)
    divisions_count = serializers.IntegerField(source="divisions.count", read_only=True)
    departments_count = serializers.IntegerField(source="departments.count", read_only=True)
    programs_count = serializers.IntegerField(source="programs.count", read_only=True)
    documents_count = serializers.IntegerField(source="documents.count", read_only=True)

    class Meta:
        model = Institution
        fields = [
            "id",
            "name",
            "short_name",
            "slug",
            "institution_type",
            "institution_type_display",
            "ownership",
            "regulator",
            "regulator_display",
            "tier_two_term",
            "state",
            "is_founding_partner",
            "status",
            "divisions_count",
            "departments_count",
            "programs_count",
            "documents_count",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class InstitutionDetailSerializer(serializers.ModelSerializer):
    institution_type_display = serializers.CharField(source="get_institution_type_display", read_only=True)
    regulator_display = serializers.CharField(source="get_regulator_display", read_only=True)
    divisions = AcademicDivisionSerializer(many=True, read_only=True)
    sessions = AcademicSessionSerializer(many=True, read_only=True)
    current_session = serializers.SerializerMethodField()

    class Meta:
        model = Institution
        fields = [
            "id",
            "name",
            "short_name",
            "slug",
            "institution_type",
            "institution_type_display",
            "ownership",
            "regulator",
            "regulator_display",
            "tier_two_term",
            "domain_whitelist",
            "address",
            "state",
            "is_founding_partner",
            "status",
            "divisions",
            "sessions",
            "current_session",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_current_session(self, obj):
        curr = obj.sessions.filter(is_current=True).first()
        if curr:
            return AcademicSessionSerializer(curr).data
        return None


class DocumentSearchQuerySerializer(serializers.Serializer):
    query = serializers.CharField(required=True, max_length=500)
    top_k = serializers.IntegerField(required=False, default=5, min_value=1, max_value=20)
    doc_type = serializers.CharField(required=False, allow_blank=True)
