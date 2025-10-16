from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from .views import SitterProfileViewSet, OwnerProfileViewSet, PetViewSet, TagViewSet, SpecialtyViewSet

# -----------------------------
# Sitter routes
# -----------------------------
router = DefaultRouter()
router.register(r"tags", TagViewSet, basename="tag")
router.register(r"specialties", SpecialtyViewSet, basename="specialty")
router.register(r"sitters", SitterProfileViewSet, basename="sitters")

# -----------------------------
# Owner routes
# -----------------------------
router.register(r"owners", OwnerProfileViewSet, basename="owners")

# Nested pets under owners
owners_router = NestedDefaultRouter(router, r"owners", lookup="owner")
owners_router.register(r"pets", PetViewSet, basename="owner-pets")

# -----------------------------
# URL patterns
# -----------------------------
urlpatterns = [
    path("", include(router.urls)),
    path("", include(owners_router.urls)),
]
