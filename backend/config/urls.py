from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include
from django.urls import path
from django.views import defaults as default_views
from django.views.generic import TemplateView
from drf_spectacular.views import SpectacularAPIView
from drf_spectacular.views import SpectacularSwaggerView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path("", TemplateView.as_view(template_name="pages/home.html"), name="home"),
    path(
        "about/",
        TemplateView.as_view(template_name="pages/about.html"),
        name="about",
    ),
    # Django Admin, use {% url 'admin:index' %}
    path(settings.ADMIN_URL, admin.site.urls),
    # User management
    path("users/", include("nexus.users.urls", namespace="users")),
    path("accounts/", include("allauth.urls")),
    # Your stuff: custom urls includes go here
    # ...
    # Media files
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
]

from nexus.institutions.api.views import AuthLoginView, AuthMeView, AuthLogoutView, InstitutionRegistrationView, PlatformAdminOverviewView, AdminInstitutionDetailView, AdminInstitutionStatusView

# API URLS
urlpatterns += [
    # API base url
    path("api/institutions/register/", InstitutionRegistrationView.as_view(), name="institution-register"),
    path("api/auth/login/", AuthLoginView.as_view(), name="auth-login"),
    path("api/auth/me/", AuthMeView.as_view(), name="auth-me"),
    path("api/auth/logout/", AuthLogoutView.as_view(), name="auth-logout"),
    path("api/admin/overview/", PlatformAdminOverviewView.as_view(), name="admin-overview"),
    path(
        "api/admin/institutions/<uuid:institution_id>/",
        AdminInstitutionDetailView.as_view(),
        name="admin-institution-detail",
    ),
    path(
        "api/admin/institutions/<uuid:institution_id>/<str:action>/",
        AdminInstitutionStatusView.as_view(),
        name="admin-institution-status",
    ),
    path("api/", include("nexus.core.urls")),
    path("api/", include("config.api_router")),
    # DRF auth token
    path("api/auth-token/", obtain_auth_token, name="obtain_auth_token"),
    path("api/schema/", SpectacularAPIView.as_view(), name="api-schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="api-schema"),
        name="api-docs",
    ),
]

if settings.DEBUG:
    # This allows the error pages to be debugged during development, just visit
    # these url in browser to see how these error pages look like.
    urlpatterns += [
        path(
            "400/",
            default_views.bad_request,
            kwargs={"exception": Exception("Bad Request!")},
        ),
        path(
            "403/",
            default_views.permission_denied,
            kwargs={"exception": Exception("Permission Denied")},
        ),
        path(
            "404/",
            default_views.page_not_found,
            kwargs={"exception": Exception("Page not Found")},
        ),
        path("500/", default_views.server_error),
    ]
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns = [
            path("__debug__/", include(debug_toolbar.urls)),
            *urlpatterns,
        ]
