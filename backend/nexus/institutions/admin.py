from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.urls import reverse
from .models import (
    Institution,
    InstitutionStatus,
    AcademicDivision,
    Department,
    AcademicProgram,
    AcademicSession,
    InstitutionalDocument,
    InstitutionalDocumentChunk,
    InstitutionStaff,
    StaffAssignment,
    StudentProfile,
    CompanyBankDetail,
    PricingPlan,
    InstitutionInvoice,
    InvoiceStatus,
    Pathway,
    PathwayMilestone,
    StudentMilestoneSubmission,
    DiagnosticAssessment,
    CounsellingSession,
    CounsellingCaseNote,
)

# Custom Admin Site Branding for System Admin
admin.site.site_header = "Nexus Edutech Consult Ltd — System Administration"
admin.site.site_title = "Nexus System Admin"
admin.site.index_title = "System Administration, Governance & Billing Console"


# =============================================================================
# ADMIN-SPECIFIC OBJECTS: Company Banking, Pricing Plans & Invoices
# =============================================================================

@admin.register(CompanyBankDetail)
class CompanyBankDetailAdmin(admin.ModelAdmin):
    """Allows System Admin to configure Company Bank Details used on generated invoices."""

    list_display = [
        "bank_name",
        "account_number",
        "account_name",
        "currency",
        "support_email",
        "support_phone",
        "is_active",
        "updated_at",
    ]
    list_editable = ["is_active"]
    search_fields = ["bank_name", "account_number", "account_name", "support_email"]
    list_filter = ["is_active", "currency"]
    fieldsets = (
        ("Account Identification", {
            "fields": ("bank_name", "account_name", "account_number", "sort_code_or_swift", "currency", "is_active")
        }),
        ("Payment Instructions & Support", {
            "fields": ("payment_instructions", "support_email", "support_phone")
        }),
    )


@admin.register(PricingPlan)
class PricingPlanAdmin(admin.ModelAdmin):
    """Allows System Admin to define and edit subscription pricing, setup fees, and student limits."""

    list_display = [
        "code",
        "name",
        "base_fee_display",
        "setup_fee_display",
        "max_students",
        "billing_cycle",
        "is_active",
        "updated_at",
    ]
    list_editable = ["is_active"]
    search_fields = ["code", "name", "target_institution_type"]
    list_filter = ["is_active", "billing_cycle", "currency"]

    def base_fee_display(self, obj):
        return f"{obj.currency} {obj.base_fee:,.2f}"
    base_fee_display.short_description = "Base License Fee"

    def setup_fee_display(self, obj):
        return f"{obj.currency} {obj.setup_onboarding_fee:,.2f}"
    setup_fee_display.short_description = "Setup / Calibration Fee"


class InstitutionInvoiceInline(admin.TabularInline):
    model = InstitutionInvoice
    extra = 0
    fields = ["invoice_number", "plan_name", "total_amount", "vat_amount", "currency", "status", "payment_reference", "payment_receipt_link", "payment_date"]
    readonly_fields = ["invoice_number", "plan_name", "total_amount", "vat_amount", "currency", "status", "payment_reference", "payment_receipt_link", "payment_date"]
    show_change_link = True

    def payment_receipt_link(self, obj):
        if obj.payment_receipt_file:
            return format_html('<a href="{}" target="_blank" style="color: #1b4d3e; font-weight: bold;">View Receipt ↗</a>', obj.payment_receipt_file.url)
        return "-"
    payment_receipt_link.short_description = "Receipt"


@admin.register(InstitutionInvoice)
class InstitutionInvoiceAdmin(admin.ModelAdmin):
    """Allows System Admin to inspect invoices, review payment proofs, VAT calculations, and confirm activation."""

    list_display = [
        "invoice_number",
        "institution_link",
        "plan_name",
        "subtotal_display",
        "vat_display",
        "total_amount_display",
        "status_badge",
        "payment_reference",
        "payment_receipt_preview",
        "payment_date",
        "confirmed_at",
    ]
    list_filter = ["status", "currency", "plan", "payment_date", "created_at"]
    search_fields = [
        "invoice_number",
        "institution__name",
        "institution__short_name",
        "payment_reference",
        "issued_to_email",
        "issued_to_name",
        "payer_account_name",
    ]
    readonly_fields = [
        "invoice_number",
        "institution",
        "plan",
        "plan_name",
        "issued_to_name",
        "issued_to_email",
        "subtotal_amount",
        "setup_fee",
        "vat_rate",
        "vat_amount",
        "discount_amount",
        "total_amount",
        "currency",
        "bank_details_snapshot",
        "items_breakdown",
        "due_date",
        "payment_submitted_at",
        "confirmed_by",
        "confirmed_at",
        "created_at",
        "updated_at",
        "payment_receipt_display",
    ]

    fieldsets = (
        ("Invoice Summary & Status", {
            "fields": (
                "invoice_number",
                "institution",
                "plan_name",
                "status",
                "due_date",
            )
        }),
        ("Financial & VAT Breakdown (7.5% Exclusive)", {
            "fields": (
                "subtotal_amount",
                "setup_fee",
                "vat_rate",
                "vat_amount",
                "discount_amount",
                "total_amount",
                "currency",
                "items_breakdown",
                "bank_details_snapshot",
            )
        }),
        ("Recipient & Billing Contact", {
            "fields": ("issued_to_name", "issued_to_email")
        }),
        ("Payment Receipt Proof", {
            "fields": (
                "payment_reference",
                "payment_date",
                "payer_bank_name",
                "payer_account_name",
                "payment_receipt_file",
                "payment_receipt_display",
                "payment_notes",
                "payment_submitted_at",
            )
        }),
        ("System Admin Verification", {
            "fields": ("confirmed_by", "confirmed_at", "admin_notes")
        }),
    )

    actions = ["mark_as_paid_and_activate_institution", "mark_as_rejected"]

    def institution_link(self, obj):
        url = reverse("admin:institutions_institution_change", args=[obj.institution.id])
        return format_html('<a href="{}" style="font-weight: bold; color: #1b4d3e;">{}</a>', url, obj.institution.name)
    institution_link.short_description = "Institution"

    def subtotal_display(self, obj):
        return f"{obj.currency} {obj.subtotal_amount:,.2f}"
    subtotal_display.short_description = "Subtotal"

    def vat_display(self, obj):
        return f"{obj.currency} {obj.vat_amount:,.2f} ({obj.vat_rate}%)"
    vat_display.short_description = "VAT (7.5%)"

    def total_amount_display(self, obj):
        return f"{obj.currency} {obj.total_amount:,.2f}"
    total_amount_display.short_description = "Total Due"

    def status_badge(self, obj):
        color_map = {
            InvoiceStatus.UNPAID: ("#92400e", "#fef3c7"),
            InvoiceStatus.PAYMENT_SUBMITTED: ("#1e40af", "#dbeafe"),
            InvoiceStatus.PAID: ("#166534", "#dcfce7"),
            InvoiceStatus.VOID: ("#4b5563", "#f3f4f6"),
            InvoiceStatus.REJECTED: ("#991b1b", "#fee2e2"),
        }
        text_color, bg_color = color_map.get(obj.status, ("#374151", "#e5e7eb"))
        return format_html(
            '<span style="background-color: {}; color: {}; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 11px; text-transform: uppercase;">{}</span>',
            bg_color,
            text_color,
            obj.get_status_display(),
        )
    status_badge.short_description = "Status"

    def payment_receipt_preview(self, obj):
        if obj.payment_receipt_file:
            return format_html('<a href="{}" target="_blank" style="color: #1b4d3e; font-weight: bold;">View Proof ↗</a>', obj.payment_receipt_file.url)
        return mark_safe('<span style="color: #9ca3af;">No proof uploaded</span>')
    payment_receipt_preview.short_description = "Receipt Proof"

    def payment_receipt_display(self, obj):
        if obj.payment_receipt_file:
            ext = obj.payment_receipt_file.name.lower()
            if ext.endswith((".png", ".jpg", ".jpeg", ".webp")):
                return format_html(
                    '<div><a href="{0}" target="_blank"><img src="{0}" style="max-height: 250px; max-width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 8px;" /></a><br/><a href="{0}" target="_blank" class="button">Open Full Image ↗</a></div>',
                    obj.payment_receipt_file.url,
                )
            return format_html('<a href="{}" target="_blank" class="button">Download Payment Receipt PDF / Document ↗</a>', obj.payment_receipt_file.url)
        return mark_safe('<span style="color: #9ca3af;">No receipt file uploaded yet.</span>')
    def save_model(self, request, obj, form, change):
        if obj.status == InvoiceStatus.PAID:
            if not obj.confirmed_by:
                obj.confirmed_by = request.user
            if not obj.confirmed_at:
                obj.confirmed_at = timezone.now()
            institution = obj.institution
            if institution.status != InstitutionStatus.ACTIVE:
                institution.status = InstitutionStatus.ACTIVE
                institution.save(update_fields=["status", "updated_at"])
        elif obj.status == InvoiceStatus.REJECTED:
            institution = obj.institution
            if institution.status != InstitutionStatus.REJECTED:
                institution.status = InstitutionStatus.REJECTED
                institution.save(update_fields=["status", "updated_at"])
        super().save_model(request, obj, form, change)

    @admin.action(description="Confirm Payment & Activate Selected Institutions")
    def mark_as_paid_and_activate_institution(self, request, queryset):
        count = 0
        for invoice in queryset:
            invoice.status = InvoiceStatus.PAID
            invoice.confirmed_by = request.user
            invoice.confirmed_at = timezone.now()
            invoice.save(update_fields=["status", "confirmed_by", "confirmed_at", "updated_at"])

            institution = invoice.institution
            institution.status = InstitutionStatus.ACTIVE
            institution.save(update_fields=["status", "updated_at"])
            count += 1

        self.message_user(
            request,
            f"Successfully confirmed {count} invoice(s) and activated their corresponding institutions."
        )

    @admin.action(description="Reject Payment Proof for Selected Invoices")
    def mark_as_rejected(self, request, queryset):
        count = queryset.update(status=InvoiceStatus.REJECTED)
        for invoice in queryset:
            invoice.institution.status = InstitutionStatus.REJECTED
            invoice.institution.save(update_fields=["status", "updated_at"])
        self.message_user(request, f"Marked {count} invoice(s) as Rejected.")


# =============================================================================
# INSTITUTION OBJECTS: Governance, Faculties, Staff & Knowledge Base
# =============================================================================

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
    list_display = [
        "name",
        "short_name",
        "institution_type",
        "regulator",
        "ownership",
        "state",
        "status_badge",
        "created_at",
    ]
    list_filter = ["status", "institution_type", "regulator", "ownership", "state"]
    search_fields = ["name", "short_name", "slug"]
    inlines = [InstitutionInvoiceInline, AcademicDivisionInline]
    actions = ["activate_institutions", "suspend_institutions"]

    def status_badge(self, obj):
        color_map = {
            InstitutionStatus.ACTIVE: ("#166534", "#dcfce7"),
            InstitutionStatus.PENDING_PAYMENT: ("#92400e", "#fef3c7"),
            InstitutionStatus.PAYMENT_SUBMITTED: ("#1e40af", "#dbeafe"),
            InstitutionStatus.PROVISIONING: ("#6b21a8", "#f3e8ff"),
            InstitutionStatus.SUSPENDED: ("#991b1b", "#fee2e2"),
            InstitutionStatus.REJECTED: ("#991b1b", "#fee2e2"),
        }
        text_color, bg_color = color_map.get(obj.status, ("#374151", "#e5e7eb"))
        return format_html(
            '<span style="background-color: {}; color: {}; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 11px; text-transform: uppercase;">{}</span>',
            bg_color,
            text_color,
            obj.get_status_display(),
        )
    status_badge.short_description = "Status"

    @admin.action(description="Activate Selected Institutions")
    def activate_institutions(self, request, queryset):
        count = queryset.update(status=InstitutionStatus.ACTIVE)
        self.message_user(request, f"Activated {count} institution(s).")

    @admin.action(description="Suspend Selected Institutions")
    def suspend_institutions(self, request, queryset):
        count = queryset.update(status=InstitutionStatus.SUSPENDED)
        self.message_user(request, f"Suspended {count} institution(s).")


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


@admin.register(InstitutionStaff)
class InstitutionStaffAdmin(admin.ModelAdmin):
    list_display = ["user", "institution", "role", "title", "division", "department", "is_active"]
    list_filter = ["role", "is_active", "institution"]
    search_fields = ["user__email", "user__name", "title", "institution__name"]


@admin.register(StaffAssignment)
class StaffAssignmentAdmin(admin.ModelAdmin):
    list_display = ["user", "institution", "role_at_unit", "official_title", "division", "department", "can_evaluate_milestones", "is_active"]
    list_filter = ["role_at_unit", "can_evaluate_milestones", "is_active", "institution"]
    search_fields = ["user__email", "user__name", "official_title", "institution__name"]


# =============================================================================
# STUDENT & EMPLOYABILITY OBJECTS: Profiles, Pathways, Counselling
# =============================================================================

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ["matric_number", "user", "program", "institution", "year_of_study", "entry_mode", "academic_standing", "siwes_clearance_status"]
    list_filter = ["year_of_study", "entry_mode", "academic_standing", "siwes_clearance_status", "institution"]
    search_fields = ["matric_number", "user__email", "user__name", "program__name"]


@admin.register(Pathway)
class PathwayAdmin(admin.ModelAdmin):
    list_display = ["title", "institution", "program", "total_milestones_count", "total_points", "is_template", "is_active", "created_at"]
    list_filter = ["is_template", "is_active", "institution"]
    search_fields = ["title", "description", "program__name"]


@admin.register(PathwayMilestone)
class PathwayMilestoneAdmin(admin.ModelAdmin):
    list_display = ["title", "pathway", "milestone_type", "order_index", "year_of_study", "points", "is_mandatory"]
    list_filter = ["milestone_type", "year_of_study", "is_mandatory"]
    search_fields = ["title", "description"]


@admin.register(StudentMilestoneSubmission)
class StudentMilestoneSubmissionAdmin(admin.ModelAdmin):
    list_display = ["student", "milestone", "status", "points_awarded", "reviewed_by", "reviewed_at", "created_at"]
    list_filter = ["status", "milestone__milestone_type"]
    search_fields = ["student__matric_number", "milestone__title"]


@admin.register(DiagnosticAssessment)
class DiagnosticAssessmentAdmin(admin.ModelAdmin):
    list_display = ["title", "institution", "assessment_type", "total_questions", "is_active"]
    list_filter = ["assessment_type", "is_active", "institution"]
    search_fields = ["title"]


@admin.register(CounsellingSession)
class CounsellingSessionAdmin(admin.ModelAdmin):
    list_display = ["student", "counsellor", "topic", "status", "preferred_date", "meeting_mode"]
    list_filter = ["status", "topic", "meeting_mode"]
    search_fields = ["student__matric_number", "counsellor__user__name"]


@admin.register(CounsellingCaseNote)
class CounsellingCaseNoteAdmin(admin.ModelAdmin):
    list_display = ["student", "author", "is_confidential", "created_at"]
    list_filter = ["is_confidential", "created_at"]
    search_fields = ["student__matric_number", "summary"]


# =============================================================================
# CUSTOM ADMIN GROUPING: Separate Admin Objects from Institution Objects
# =============================================================================

original_get_app_list = admin.AdminSite.get_app_list

def get_custom_app_list(self, request, app_label=None):
    app_dict = self._build_app_dict(request, app_label)

    # Index all models across registered apps
    all_models = {}
    for app in app_dict.values():
        for model in app["models"]:
            all_models[model["object_name"].lower()] = model

    # Group 1: Nexus System Administration & Billing (Admin Specific Objects)
    admin_model_names = ["companybankdetail", "pricingplan", "institutioninvoice", "user"]
    admin_models = [all_models[name] for name in admin_model_names if name in all_models]

    # Group 2: Institution Governance & Academic Units (Institution Specific Objects)
    inst_model_names = [
        "institution",
        "academicdivision",
        "department",
        "academicprogram",
        "academicsession",
        "institutionstaff",
        "staffassignment",
        "institutionaldocument",
        "institutionaldocumentchunk",
    ]
    inst_models = [all_models[name] for name in inst_model_names if name in all_models]

    # Group 3: Student Employability, Pathways & Counselling
    student_model_names = [
        "studentprofile",
        "pathway",
        "pathwaymilestone",
        "studentmilestonesubmission",
        "diagnosticassessment",
        "counsellingsession",
        "counsellingcasenote",
    ]
    student_models = [all_models[name] for name in student_model_names if name in all_models]

    custom_apps = []

    if admin_models:
        custom_apps.append({
            "name": "Nexus System Administration & Billing (System Admin Only)",
            "app_label": "nexus_admin_billing",
            "app_url": "",
            "has_module_perms": True,
            "models": admin_models,
        })

    if inst_models:
        custom_apps.append({
            "name": "Institution Governance & Academic Units (Institution Objects)",
            "app_label": "nexus_institution_governance",
            "app_url": "",
            "has_module_perms": True,
            "models": inst_models,
        })

    if student_models:
        custom_apps.append({
            "name": "Student Employability, Pathways & Counselling",
            "app_label": "nexus_student_services",
            "app_url": "",
            "has_module_perms": True,
            "models": student_models,
        })

    # Add any other remaining apps (auth tokens, sites, allauth, etc.)
    used_names = set(admin_model_names + inst_model_names + student_model_names)
    for app in app_dict.values():
        remaining = [m for m in app["models"] if m["object_name"].lower() not in used_names]
        if remaining:
            custom_apps.append({
                "name": app["name"],
                "app_label": app["app_label"],
                "app_url": app.get("app_url", ""),
                "has_module_perms": True,
                "models": remaining,
            })

    return custom_apps

admin.AdminSite.get_app_list = get_custom_app_list

