from typing import Any, Dict, List
from decimal import Decimal

from django.db import IntegrityError, transaction
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from .models import OwnerProfile, SitterProfile, Pet, Tag, Specialty


# -----------------------------
# Pet (nested use)
# -----------------------------
class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = ["id", "name", "species", "breed", "age", "notes"]
        read_only_fields = ("id",)


# -----------------------------
# Owner Profile Serializer
# -----------------------------
class OwnerProfileSerializer(serializers.ModelSerializer):
    # Convenience read-only user context, Front-end convenience
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = OwnerProfile
        fields = [
            "id",
            "user_id",
            "username",
            "email",
            "name",
            "phone",
            "default_location",
            "notes",
        ]
        read_only_fields = ("id", "user_id", "username", "email")

    def validate_phone(self, value: str) -> str:
        # light validation; allows many formats
        import re
        if not value:
            return value
        digits = re.sub(r"\D", "", value)
        if len(digits) < 10:
            raise serializers.ValidationError(_("Phone number appears too short."))
        if len(digits) > 15:
            raise serializers.ValidationError(_("Phone number appears too long."))
        return value

    def create(self, validated_data: Dict[str, Any]) -> OwnerProfile:
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated:
            raise serializers.ValidationError(_("Authentication required to create a profile."))
        with transaction.atomic():
            try:
                profile = OwnerProfile.objects.create(user=user, **validated_data)
            except IntegrityError:
                raise serializers.ValidationError(_("This user already has an owner profile."))
        return profile

    def update(self, instance: OwnerProfile, validated_data: Dict[str, Any]) -> OwnerProfile:
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        return instance

class OwnerProfileWithPetsSerializer(OwnerProfileSerializer):
    pets = PetSerializer(many=True, read_only=True)

    class Meta(OwnerProfileSerializer.Meta):
        fields = OwnerProfileSerializer.Meta.fields + ["pets"]

# -----------------------------
# Tag Specialty (read-only nested)
# describe experience: EX “Medication trained”, “Overnight care”, “Puppy friendly”
# -----------------------------
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "category"]
        read_only_fields = fields

# -----------------------------
# Specialty 
# Core categories like species: “Dog”, “Cat”, “Bird”, "reptile", "rabbit"
# -----------------------------
class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ["id", "slug", "name"]
        read_only_fields = fields

# -----------------------------
# Sitter Profile Serializer
# -----------------------------
class SitterProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    avg_rating = serializers.FloatField(read_only=True)
    verification_status = serializers.CharField(read_only=True)

    rate_hourly = serializers.DecimalField(max_digits=6, decimal_places=2)
    service_radius_km = serializers.IntegerField()

    # Read-only nested for frontend display
    tags = TagSerializer(many=True, read_only=True)
    specialties = SpecialtySerializer(many=True, read_only=True)

    # Simple write inputs for frontend 
    # - tag_names: create/get Tags by name (case-insensitive)
    tag_names = serializers.ListField(
        child=serializers.CharField(trim_whitespace=True),
        write_only=True,
        required=False,
        help_text="List of tag names, e.g. ['overnight','medication','large dogs']",
    )
    # - specialty_slugs: attach existing Specialty rows by slug
    specialty_slugs = serializers.ListField(
        child=serializers.CharField(trim_whitespace=True),
        write_only=True,
        required=False,
        help_text="List of specialty slugs, e.g. ['dog','cat','bird']",
    )

    class Meta:
        model = SitterProfile
        fields = [
            "id",
            "user_id",
            "username",
            "email",
            "display_name",
            "bio",
            "rate_hourly",
            "service_radius_km",
            "home_zip",
            "avg_rating",
            "verification_status",
            "tag_names",
            "specialty_slugs",
        ]
        read_only_fields = (
            "id",
            "user_id",
            "username",
            "email",
            "avg_rating",
            "verification_status",
            "tags",
            "specialties",
        )

    # ---- field-level validators ----
    def validate_rate_hourly(self, value: Decimal) -> Decimal:
        if value is None:
            return value
        if value < Decimal("0"):
            raise serializers.ValidationError(_("Hourly rate must be non-negative."))
        if value > Decimal("500"):
            raise serializers.ValidationError(_("Hourly rate looks unusually high; please re-check."))
        return value

    def validate_service_radius_km(self, value: int) -> int:
        if value is None:
            return value
        if value < 0:
            raise serializers.ValidationError(_("Service radius must be non-negative."))
        if value > 500:
            raise serializers.ValidationError(_("Service radius seems too large for local services."))
        return value

    def validate_home_zip(self, value: str) -> str:
        import re
        if not value:
            return value
        if not re.match(r"^\d{5}(-\d{4})?$", value):
            raise serializers.ValidationError(_("ZIP code must be 5 digits or ZIP+4."))
        return value

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        if attrs.get("service_radius_km") is not None and not attrs.get("home_zip"):
            raise serializers.ValidationError({
                "home_zip": _("Provide a home ZIP code when setting a service radius.")
            })
        return attrs
    
    def _apply_tags_and_specialties(self, sitter: SitterProfile, tag_names: List[str], specialty_slugs: List[str],) -> None:
        # Tags: create or fetch by case-insensitive name
        if tag_names is not None:
            tag_objs = []
            seen = set()
            for raw in tag_names:
                name = raw.strip()
                if not name:
                    continue
                key = name.lower()
                if key in seen:
                    continue
                seen.add(key)
                tag_obj, _ = Tag.objects.get_or_create(name__iexact=name, defaults={"name": name})
                # get_or_create with __iexact requires a tiny dance:
                if isinstance(tag_obj, bool):  # safety: shouldn't happen
                    continue
                if not isinstance(tag_obj, Tag):
                    # If the __iexact get failed to return the instance, do a second fetch
                    tag_obj = Tag.objects.filter(name__iexact=name).first() or Tag.objects.create(name=name)
                tag_objs.append(tag_obj)
            sitter.tags.set(tag_objs)

        # Specialties: must already exist; attach by slug
        if specialty_slugs is not None:
            spec_qs = Specialty.objects.filter(slug__in=specialty_slugs)
            # Ensure all provided slugs exist (optional strictness)
            missing = set(specialty_slugs) - set(spec_qs.values_list("slug", flat=True))
            if missing:
                raise serializers.ValidationError({"specialty_slugs": _(f"Unknown specialty slugs: {sorted(missing)}")})
            sitter.specialties.set(list(spec_qs))

    def create(self, validated_data: Dict[str, Any]) -> SitterProfile:
        tag_names = validated_data.pop("tag_names", [])
        specialty_slugs = validated_data.pop("specialty_slugs", [])
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated:
            raise serializers.ValidationError(_("Authentication required to create a profile."))
        with transaction.atomic():
            try:
                profile = SitterProfile.objects.create(user=user, **validated_data)
            except IntegrityError:
                raise serializers.ValidationError(_("This user already has a sitter profile."))
            # Apply M2M after instance exists
            self._apply_tags_and_specialties(profile, tag_names, specialty_slugs)
        return profile

    def update(self, instance: SitterProfile, validated_data: Dict[str, Any]) -> SitterProfile:
        tag_names = validated_data.pop("tag_names", None)
        specialty_slugs = validated_data.pop("specialty_slugs", None)

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        # Only update M2M if keys present in payload
        if tag_names is not None or specialty_slugs is not None:
            self._apply_tags_and_specialties(instance, tag_names if tag_names is not None else [], specialty_slugs if specialty_slugs is not None else [])
        return instance

class PublicSitterCardSerializer(serializers.ModelSerializer):
    # Compact read-only slices for list/search cards
    tags = serializers.SlugRelatedField(slug_field="name", many=True, read_only=True)
    specialties = serializers.SlugRelatedField(slug_field="slug", many=True, read_only=True)

    class Meta:
        model = SitterProfile
        fields = ["id", "display_name", "rate_hourly", "avg_rating", "home_zip"]
        read_only_fields = fields
