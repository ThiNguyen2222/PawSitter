from typing import Any, Dict
from decimal import Decimal

from django.db import IntegrityError, transaction
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from .models import OwnerProfile, SitterProfile, Pet


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
        ]
        read_only_fields = (
            "id",
            "user_id",
            "username",
            "email",
            "avg_rating",
            "verification_status",
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

    def create(self, validated_data: Dict[str, Any]) -> SitterProfile:
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated:
            raise serializers.ValidationError(_("Authentication required to create a profile."))
        with transaction.atomic():
            try:
                profile = SitterProfile.objects.create(user=user, **validated_data)
            except IntegrityError:
                raise serializers.ValidationError(_("This user already has a sitter profile."))
        return profile

    def update(self, instance: SitterProfile, validated_data: Dict[str, Any]) -> SitterProfile:
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        return instance

class PublicSitterCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = SitterProfile
        fields = ["id", "display_name", "rate_hourly", "avg_rating", "home_zip"]
        read_only_fields = fields
