from django.conf import settings
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter

from edusal.users.api.views import UserViewSet
from edusal.institutions.api.views import (
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

app_name = "api"
urlpatterns = router.urls
