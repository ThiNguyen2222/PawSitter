# Create your views here.
from django.db.models import Q
from rest_framework import viewsets, filters, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SitterProfile, OwnerProfile, Pet, Tag, Specialty
from .serializers import (
    PublicSitterCardSerializer,
    SitterProfileSerializer,
    OwnerProfileSerializer,
    OwnerProfileWithPetsSerializer,
    PetSerializer,
    TagSerializer,
    SpecialtySerializer
)

# -----------------------------
# Tag / Specialty ViewSets
# -----------------------------
class TagViewSet(viewsets.ModelViewSet):
    # List/create/update tags used by sitters. Public can read; auth required for writes.
    queryset = Tag.objects.all().order_by("name")
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class SpecialtyViewSet(viewsets.ModelViewSet):
    # List/create/update specialties used by sitters.
    queryset = Specialty.objects.all().order_by("name")
    serializer_class = SpecialtySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

# -----------------------------
# SitterProfile ViewSet
# -----------------------------
class SitterProfileViewSet(viewsets.ModelViewSet):
    # Sitter profile CRUD and search.
    # list     -> Public-facing card serializer
    # retrieve -> Full detail serializer
    # create/update/delete -> Auth required
    queryset = SitterProfile.objects.select_related("user").prefetch_related("tags").order_by("-avg_rating")

    def get_serializer_class(self):
        # Use lightweight serializer for list; full serializer otherwise
        return PublicSitterCardSerializer if self.action == "list" else SitterProfileSerializer

    def get_permissions(self):
        # Public can browse; auth required for writes
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]

    # ---------- CREATE / UPDATE / DELETE ----------
    def perform_create(self, serializer):
        # Assign the authenticated user to the profile on create
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Only allow users to update their own profile
        if serializer.instance.user != self.request.user:
            raise PermissionDenied("You can only update your own profile.")
        serializer.save()

    def perform_destroy(self, instance):
        # Only allow users to delete their own profile
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own profile.")
        instance.delete()

    # ---------- CUSTOM ACTIONS ----------
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        # Return the authenticated sitter's profile
        try:
            sitter_profile = SitterProfile.objects.select_related("user").prefetch_related("tags", "specialties").get(user=request.user)
            serializer = SitterProfileSerializer(sitter_profile)
            return Response(serializer.data)
        except SitterProfile.DoesNotExist:
            return Response({"detail": "Sitter profile not found for this user."}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=False, methods=["patch"], permission_classes=[IsAuthenticated])
    def update_taxonomy(self, request):
        # Update sitter tags + specialties (IDs)
        try:
            sitter = SitterProfile.objects.get(user=request.user)
        except SitterProfile.DoesNotExist:
            return Response({"detail": "Sitter profile not found."}, status=404)

        tag_ids = request.data.get("tags", [])
        spec_ids = request.data.get("specialties", [])

        if not isinstance(tag_ids, list) or not isinstance(spec_ids, list):
            return Response({"detail": "Both 'tags' and 'specialties' must be lists of IDs."}, status=400)

        # Update relations
        sitter.tags.set(Tag.objects.filter(id__in=tag_ids))
        sitter.specialties.set(Specialty.objects.filter(id__in=spec_ids))
        sitter.save()

        serializer = SitterProfileSerializer(sitter)
        return Response(serializer.data, status=200)

    # ---------- QUERYSET FILTERS ----------
    def get_queryset(self):
        # Apply search and filtering params
        qs = super().get_queryset()
        q = self.request.query_params

        # Free-text search
        search = q.get("search")
        if search:
            qs = qs.filter(Q(display_name__icontains=search) | Q(bio__icontains=search))

        # Filters by rating, rate, zip
        min_rating = q.get("min_rating")
        if min_rating is not None:
            qs = qs.filter(avg_rating__gte=min_rating)

        max_rate = q.get("max_rate")
        if max_rate is not None:
            qs = qs.filter(rate_hourly__lte=max_rate)

        zip_code = q.get("zip")
        if zip_code:
            qs = qs.filter(home_zip=zip_code)

        # Tag filters (any / all)
        tags_any = q.get("tags_any")
        if tags_any:
            slugs = [s.strip() for s in tags_any.split(",") if s.strip()]
            if slugs:
                qs = qs.filter(tags__slug__in=slugs).distinct()

        tags_all = q.get("tags_all")
        if tags_all:
            slugs = [s.strip() for s in tags_all.split(",") if s.strip()]
            for slug in slugs:
                qs = qs.filter(tags__slug=slug)
            qs = qs.distinct()

        return qs

# -----------------------------
# OwnerProfile ViewSet
# -----------------------------
class OwnerProfileViewSet(viewsets.ModelViewSet):
    # CRUD for OwnerProfile
    queryset = OwnerProfile.objects.all()

    def get_serializer_class(self):
        # Use nested serializer when retrieving detail
        if self.action == "retrieve":
            return OwnerProfileWithPetsSerializer
        return OwnerProfileSerializer

    def get_permissions(self):
        # Public can list/retrieve; auth required for writes
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        # Limit write operations to the authenticated user's profile
        qs = super().get_queryset()
        if self.action in ("update", "partial_update", "destroy"):
            qs = qs.filter(user=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        # Return the authenticated owner's profile
        try:
            owner_profile = OwnerProfile.objects.get(user=request.user)
            serializer = OwnerProfileWithPetsSerializer(owner_profile)
            return Response(serializer.data)
        except OwnerProfile.DoesNotExist:
            return Response({"detail": "Owner profile not found for this user."}, status=404)

# -----------------------------
# Pet ViewSet (nested under owner)
# -----------------------------
class PetViewSet(viewsets.ModelViewSet):
    # Nested CRUD for Pets under an owner: /api/profiles/owners/<owner_id>/pets/
    serializer_class = PetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return pets only for the authenticated owner
        owner_id = self.kwargs.get("owner_pk")

        try:
            owner = OwnerProfile.objects.get(pk=owner_id)
        except OwnerProfile.DoesNotExist:
            raise PermissionDenied("Owner profile not found.")

        try:
            request_owner_profile = self.request.user.owner_profile
        except AttributeError:
            raise PermissionDenied("You must have an owner profile to access pets.")

        if owner != request_owner_profile:
            raise PermissionDenied("You cannot access pets of another owner.")

        return owner.pets.all()

    def perform_create(self, serializer):
        # Assign pet to the authenticated owner
        owner_id = self.kwargs.get("owner_pk")

        try:
            owner = OwnerProfile.objects.get(pk=owner_id)
        except OwnerProfile.DoesNotExist:
            raise PermissionDenied("Owner profile not found.")

        try:
            request_owner_profile = self.request.user.owner_profile
        except AttributeError:
            raise PermissionDenied("You must have an owner profile to add pets.")

        if owner != request_owner_profile:
            raise PermissionDenied("You cannot add pets to another owner.")

        serializer.save(owner=owner)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_pets(self, request):
        # Return the authenticated user's pets
        try:
            owner = request.user.owner_profile
            pets = owner.pets.all()
            serializer = self.get_serializer(pets, many=True)
            return Response(serializer.data)
        except OwnerProfile.DoesNotExist:
            return Response({"detail": "You do not have an associated owner profile."}, status=400)
