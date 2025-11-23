from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet

# Create a router and register the BookingViewSet
router = DefaultRouter()
router.register(r"", BookingViewSet, basename="booking")

# Include router URLs in urlpatterns
urlpatterns = [
    path("", include(router.urls)),
]
