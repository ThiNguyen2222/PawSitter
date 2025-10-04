# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import SitterProfile, OwnerProfile, Pet
from .serializers import (
    PublicSitterCardSerializer,
    SitterProfileSerializer,
    OwnerProfileSerializer,
    OwnerProfileWithPetsSerializer,
    PetSerializer,
)

# -----------------------------
# SitterProfile ViewSet
# -----------------------------
class SitterProfileViewSet(viewsets.ModelViewSet):  # <-- was ReadOnlyModelViewSet
    """
    list     -> lightweight card serializer (browse/search)
    retrieve -> full detail serializer
    create/update/patch/delete -> full serializer (auth required)
    """
    queryset = SitterProfile.objects.all().order_by("-avg_rating")

    # Use a light serializer for list; full for everything else (detail + writes)
    def get_serializer_class(self):
        return PublicSitterCardSerializer if self.action == "list" else SitterProfileSerializer

    # Public can browse/read; writes require auth
    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == "list":
            # Keep list lean and fast
            qs = qs.only("id", "display_name", "rate_hourly", "avg_rating", "home_zip")
            # Optional filters
            q = self.request.query_params
            if "min_rating" in q:
                qs = qs.filter(avg_rating__gte=q["min_rating"])
            if "max_rate" in q:
                qs = qs.filter(rate_hourly__lte=q["max_rate"])
            if "zip" in q:
                qs = qs.filter(home_zip=q["zip"])
        return qs


# -----------------------------
# OwnerProfile ViewSet
# -----------------------------
class OwnerProfileViewSet(viewsets.ModelViewSet):
    """
    CRUD for OwnerProfile
    """
    queryset = OwnerProfile.objects.all()

    def get_serializer_class(self):
        # Use nested serializer when retrieving detail
        if self.action == "retrieve":
            return OwnerProfileWithPetsSerializer
        return OwnerProfileSerializer

    def get_permissions(self):
        # Public can list/retrieve; auth required for create/update/delete
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        # Authenticated users can only access their own profile for writes
        if self.action in ("update", "partial_update", "destroy"):
            user = self.request.user
            qs = qs.filter(user=user)
        return qs


# -----------------------------
# Pet ViewSet (nested under owner)
# -----------------------------
class PetViewSet(viewsets.ModelViewSet):
    """
    Nested CRUD for Pets under an owner:
    /owners/<owner_id>/pets/
    """
    serializer_class = PetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        owner_id = self.kwargs.get("owner_pk")
        owner = OwnerProfile.objects.get(pk=owner_id)
        # Only allow owner to see their own pets
        if owner.user != self.request.user:
            raise PermissionDenied("You cannot access pets of another owner.")
        return owner.pets.all()

    def perform_create(self, serializer):
        owner_id = self.kwargs.get("owner_pk")
        owner = OwnerProfile.objects.get(pk=owner_id)
        if owner.user != self.request.user:
            raise PermissionDenied("You cannot add pets to another owner.")
        serializer.save(owner=owner)
