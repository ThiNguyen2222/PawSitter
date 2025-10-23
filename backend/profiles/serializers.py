from decimal import Decimal
import re
from django.db import IntegrityError, transaction
from django.utils.translation import gettext_lazy as _
from django.templatetags.static import static
from rest_framework import serializers
from .models import OwnerProfile, SitterProfile, Pet, Tag, Specialty


# -----------------------------
# Default static images
# -----------------------------
def get_default_profile_image():
    return static("images/default_profile.png")


def get_default_banner_image():
    return static("images/default_banner.png")


def get_default_pet_image():
    return static("images/default_pet.png")


# -----------------------------
# Nested / Related Serializers
# -----------------------------
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug"]
        read_only_fields = fields


class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ["id", "name", "slug"]
        read_only_fields = fields


class PetSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = Pet
        fields = ["id", "name", "species", "breed", "age", "notes", "profile_picture", "profile_picture_url"]
        read_only_fields = ("id",)

    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return get_default_pet_image()


# -----------------------------
# OwnerProfile Serializers
# -----------------------------
class OwnerProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    profile_picture_url = serializers.SerializerMethodField()
    banner_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = OwnerProfile
        fields = [
            "id", "user_id", "username", "email",
            "name", "phone", "default_location", "notes",
            "profile_picture", "banner_picture",
            "profile_picture_url", "banner_picture_url"
        ]
        read_only_fields = ("id", "user_id", "username", "email")

    def get_profile_picture_url(self, obj):
        return obj.profile_picture.url if obj.profile_picture else get_default_profile_image()

    def get_banner_picture_url(self, obj):
        return obj.banner_picture.url if obj.banner_picture else get_default_banner_image()

    def validate_phone(self, value: str) -> str:
        if not value:
            return value
        digits = re.sub(r"\D", "", value)
        if len(digits) < 10:
            raise serializers.ValidationError(_("Phone number appears too short."))
        if len(digits) > 15:
            raise serializers.ValidationError(_("Phone number appears too long."))
        return value

    def create(self, validated_data):
        user = getattr(self.context.get("request"), "user", None)
        if not user or not user.is_authenticated:
            raise serializers.ValidationError(_("Authentication required to create a profile."))
        try:
            with transaction.atomic():
                return OwnerProfile.objects.create(user=user, **validated_data)
        except IntegrityError:
            raise serializers.ValidationError(_("This user already has an owner profile."))

    def update(self, instance, validated_data):
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        return instance


class OwnerProfileWithPetsSerializer(OwnerProfileSerializer):
    pets = PetSerializer(many=True, read_only=True)

    class Meta(OwnerProfileSerializer.Meta):
        fields = OwnerProfileSerializer.Meta.fields + ["pets"]


# -----------------------------
# SitterProfile Serializers
# -----------------------------
class SitterProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    profile_picture_url = serializers.SerializerMethodField()
    banner_picture_url = serializers.SerializerMethodField()

    avg_rating = serializers.FloatField(read_only=True)
    verification_status = serializers.CharField(read_only=True)

    tags = TagSerializer(many=True, read_only=True)
    specialties = SpecialtySerializer(many=True, read_only=True)

    tag_names = serializers.ListField(
        child=serializers.CharField(trim_whitespace=True),
        write_only=True,
        required=False
    )
    specialty_slugs = serializers.ListField(
        child=serializers.CharField(trim_whitespace=True),
        write_only=True,
        required=False
    )

    class Meta:
        model = SitterProfile
        fields = [
            "id", "user_id", "username", "email",
            "display_name", "bio",
            "rate_hourly", "service_radius_km", "home_zip",
            "avg_rating", "verification_status",
            "profile_picture", "banner_picture",
            "profile_picture_url", "banner_picture_url",
            "tags", "specialties",
            "tag_names", "specialty_slugs"
        ]
        read_only_fields = (
            "id", "user_id", "username", "email",
            "avg_rating", "verification_status",
            "tags", "specialties"
        )

    def get_profile_picture_url(self, obj):
        return obj.profile_picture.url if obj.profile_picture else get_default_profile_image()

    def get_banner_picture_url(self, obj):
        return obj.banner_picture.url if obj.banner_picture else get_default_banner_image()

    def validate_rate_hourly(self, value: Decimal) -> Decimal:
        if value is not None:
            if value < 0:
                raise serializers.ValidationError(_("Hourly rate must be non-negative."))
            if value > 500:
                raise serializers.ValidationError(_("Hourly rate seems unusually high."))
        return value

    def validate_home_zip(self, value: str) -> str:
        if value and not re.match(r"^\d{5}(-\d{4})?$", value):
            raise serializers.ValidationError(_("ZIP code must be 5 digits or ZIP+4."))
        return value

    def validate(self, attrs):
        if attrs.get("service_radius_km") is not None and not attrs.get("home_zip"):
            raise serializers.ValidationError({"home_zip": _("Provide a home ZIP code when setting a service radius.")})
        return attrs

    def _apply_tags_and_specialties(self, sitter, tag_names, specialty_slugs):
        # Tags
        if tag_names is not None:
            tag_objs = []
            seen = set()
            for name in tag_names:
                name = name.strip()
                if not name or name.lower() in seen:
                    continue
                seen.add(name.lower())
                tag_obj, _ = Tag.objects.get_or_create(name__iexact=name, defaults={"name": name})
                tag_objs.append(tag_obj)
            sitter.tags.set(tag_objs)

        # Specialties
        if specialty_slugs is not None:
            spec_qs = Specialty.objects.filter(slug__in=specialty_slugs)
            missing = set(specialty_slugs) - set(spec_qs.values_list("slug", flat=True))
            if missing:
                raise serializers.ValidationError({"specialty_slugs": _(f"Unknown specialty slugs: {sorted(missing)}")})
            sitter.specialties.set(list(spec_qs))

    def create(self, validated_data):
        tag_names = validated_data.pop("tag_names", [])
        specialty_slugs = validated_data.pop("specialty_slugs", [])
        user = getattr(self.context.get("request"), "user", None)
        if not user or not user.is_authenticated:
            raise serializers.ValidationError(_("Authentication required to create a profile."))
        with transaction.atomic():
            try:
                profile = SitterProfile.objects.create(user=user, **validated_data)
            except IntegrityError:
                raise serializers.ValidationError(_("This user already has a sitter profile."))
            self._apply_tags_and_specialties(profile, tag_names, specialty_slugs)
        return profile

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        specialty_slugs = validated_data.pop("specialty_slugs", None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if tag_names is not None or specialty_slugs is not None:
            self._apply_tags_and_specialties(instance,
                                            tag_names or [],
                                            specialty_slugs or [])
        return instance


# -----------------------------
# Public Sitter Card Serializer
# -----------------------------
class PublicSitterCardSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(slug_field="name", many=True, read_only=True)
    specialties = serializers.SlugRelatedField(slug_field="slug", many=True, read_only=True)
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = SitterProfile
        fields = ["id", "display_name", "rate_hourly", "avg_rating", "home_zip", "tags", "specialties", "profile_picture_url"]
        read_only_fields = fields

    def get_profile_picture_url(self, obj):
        return obj.profile_picture.url if obj.profile_picture else get_default_profile_image()
