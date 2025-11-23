from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AvailabilitySlotViewSet

# Create a router and register the availability viewset
router = DefaultRouter()
router.register(r"", AvailabilitySlotViewSet, basename="availability")

# Include router URLs in urlpatterns
urlpatterns = [
    path("", include(router.urls)),
]
