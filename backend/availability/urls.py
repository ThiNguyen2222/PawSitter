from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AvailabilitySlotViewSet

router = DefaultRouter()
router.register(r"", AvailabilitySlotViewSet, basename="availability")

urlpatterns = [
    path("", include(router.urls)),
]

# In frontend, our fetch URL should be:
# fetch("http://localhost:8000/api/availability/?mine=true")
