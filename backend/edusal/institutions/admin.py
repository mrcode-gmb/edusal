from django.contrib import admin
from .models import (
    Institution,
    AcademicDivision,
    Department,
    AcademicProgram,
    AcademicSession,
    InstitutionalDocument,
    InstitutionalDocumentChunk,
)


class AcademicDivisionInline(admin.TabularInline):
    model = AcademicDivision
    extra = 0
    show_change_link = True


class DepartmentInline(admin.TabularInline):
    model = Department
    extra = 0
    show_change_link = True


class AcademicProgramInline(admin.TabularInline):
    model = AcademicProgram
    extra = 0
    show_change_link = True


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ["name", "short_name", "institution_type", "regulator", "state", "status", "is_founding_partner"]
    list_filter = ["institution_type", "ownership", "regulator", "status", "is_founding_partner", "state"]
    search_fields = ["name", "short_name", "slug"]
    prepopulated_fields = {"slug": ("short_name",)}
    inlines = [AcademicDivisionInline]


@admin.register(AcademicDivision)
class AcademicDivisionAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "institution", "division_type", "dean_name", "is_active"]
    list_filter = ["division_type", "is_active", "institution"]
    search_fields = ["name", "code", "dean_name", "institution__name"]
    inlines = [DepartmentInline]


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "division", "institution", "hod_name", "siwes_eligible", "is_active"]
    list_filter = ["siwes_eligible", "is_active", "institution", "division"]
    search_fields = ["name", "code", "hod_name", "division__name"]
    inlines = [AcademicProgramInline]


@admin.register(AcademicProgram)
class AcademicProgramAdmin(admin.ModelAdmin):
    list_display = ["name", "program_code", "award_level", "department", "institution", "duration_years", "is_active"]
    list_filter = ["award_level", "is_active", "institution"]
    search_fields = ["name", "program_code", "department__name"]


@admin.register(AcademicSession)
class AcademicSessionAdmin(admin.ModelAdmin):
    list_display = ["institution", "session_label", "current_semester", "is_current", "start_date", "end_date"]
    list_filter = ["is_current", "current_semester", "institution"]
    search_fields = ["session_label", "institution__name"]


class InstitutionalDocumentChunkInline(admin.TabularInline):
    model = InstitutionalDocumentChunk
    extra = 0
    fields = ["chunk_index", "page_number", "section_reference", "content"]
    readonly_fields = ["chunk_index", "page_number", "section_reference", "content"]


@admin.register(InstitutionalDocument)
class InstitutionalDocumentAdmin(admin.ModelAdmin):
    list_display = ["title", "institution", "doc_type", "chunk_count", "embedding_status", "created_at"]
    list_filter = ["doc_type", "embedding_status", "institution"]
    search_fields = ["title", "institution__name", "content_hash"]
    inlines = [InstitutionalDocumentChunkInline]


@admin.register(InstitutionalDocumentChunk)
class InstitutionalDocumentChunkAdmin(admin.ModelAdmin):
    list_display = ["document", "chunk_index", "page_number", "section_reference"]
    list_filter = ["document__institution", "document__doc_type"]
    search_fields = ["content", "section_reference", "document__title"]
