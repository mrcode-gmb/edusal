from django.conf import settings
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter

from nexus.users.api.views import UserViewSet
from nexus.institutions.api.views import (
    InstitutionViewSet,
    AcademicDivisionViewSet,
    DepartmentViewSet,
    AcademicProgramViewSet,
    AcademicSessionViewSet,
    InstitutionalDocumentViewSet,
    InstitutionStaffViewSet,
    StaffAssignmentViewSet,
    StudentProfileViewSet,
    PathwayViewSet,
    PathwayMilestoneViewSet,
    StudentMilestoneSubmissionViewSet,
    DiagnosticAssessmentViewSet,
    StudentAssessmentSessionViewSet,
    AICoachViewSet,
    CounsellingSessionViewSet,
    CounsellingCaseNoteViewSet,
    CompanyBankDetailViewSet,
    PricingPlanViewSet,
    InstitutionInvoiceViewSet,
)

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

router.register("users", UserViewSet)
router.register("institutions", InstitutionViewSet, basename="institution")
router.register("divisions", AcademicDivisionViewSet, basename="division")
router.register("departments", DepartmentViewSet, basename="department")
router.register("programs", AcademicProgramViewSet, basename="program")
router.register("sessions", AcademicSessionViewSet, basename="session")
router.register("documents", InstitutionalDocumentViewSet, basename="document")
router.register("staff", InstitutionStaffViewSet, basename="staff")
router.register("staff-assignments", StaffAssignmentViewSet, basename="staff-assignment")
router.register("students", StudentProfileViewSet, basename="student")
router.register("pathways", PathwayViewSet, basename="pathway")
router.register("milestones", PathwayMilestoneViewSet, basename="milestone")
router.register("student-submissions", StudentMilestoneSubmissionViewSet, basename="student-submission")
router.register("diagnostic-assessments", DiagnosticAssessmentViewSet, basename="diagnostic-assessment")
router.register("student-assessments", StudentAssessmentSessionViewSet, basename="student-assessment")
router.register("ai-coach", AICoachViewSet, basename="ai-coach")
router.register("counselling-sessions", CounsellingSessionViewSet, basename="counselling-session")
router.register("counselling-case-notes", CounsellingCaseNoteViewSet, basename="counselling-case-note")
router.register("company-bank-details", CompanyBankDetailViewSet, basename="company-bank-detail")
router.register("pricing-plans", PricingPlanViewSet, basename="pricing-plan")
router.register("invoices", InstitutionInvoiceViewSet, basename="invoice")


app_name = "api"
urlpatterns = router.urls

