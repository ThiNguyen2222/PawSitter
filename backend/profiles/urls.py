from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SitterProfileViewSet

router = DefaultRouter()
router.register(r"", SitterProfileViewSet, basename="sitters")

urlpatterns = [
    path("", include(router.urls)),
]
