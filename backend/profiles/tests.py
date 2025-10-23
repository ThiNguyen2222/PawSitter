# tests.py
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile

from .models import OwnerProfile, SitterProfile, Pet, Tag, Specialty
from .serializers import (
    OwnerProfileSerializer,
    OwnerProfileWithPetsSerializer,
    SitterProfileSerializer,
    PublicSitterCardSerializer,
    PetSerializer,
    TagSerializer,
    SpecialtySerializer,
)

User = get_user_model()

class ProfileSerializerTests(TestCase):

    def setUp(self):
        # Create users
        self.owner_user = User.objects.create_user(username="owner1", password="pass")
        self.sitter_user = User.objects.create_user(username="sitter1", password="pass")

        # Tags & specialties
        self.tag1 = Tag.objects.create(name="overnight care")
        self.tag2 = Tag.objects.create(name="medication")
        self.spec1 = Specialty.objects.create(name="dog")
        self.spec2 = Specialty.objects.create(name="cat")

        # Owner profile
        self.owner_profile = OwnerProfile.objects.create(
            user=self.owner_user,
            name="Alice",
            phone="1234567890"
        )

        # Pet
        self.pet = Pet.objects.create(
            owner=self.owner_profile,
            name="Fido",
            species="Dog",
            age=3
        )

        # Sitter profile
        self.sitter_profile = SitterProfile.objects.create(
            user=self.sitter_user,
            display_name="Bob the Sitter",
            rate_hourly=Decimal("15.00"),
            service_radius_km=10,
            home_zip="12345"
        )
        self.sitter_profile.tags.set([self.tag1, self.tag2])
        self.sitter_profile.specialties.set([self.spec1, self.spec2])

    # -----------------------------
    # OwnerProfileSerializer
    # -----------------------------
    def test_owner_serializer_fields(self):
        serializer = OwnerProfileSerializer(self.owner_profile)
        data = serializer.data
        self.assertEqual(data["user_id"], self.owner_user.id)
        self.assertEqual(data["username"], self.owner_user.username)
        self.assertEqual(data["phone"], "1234567890")
        self.assertIn("profile_picture_url", data)
        self.assertIn("banner_picture_url", data)

    def test_owner_serializer_create(self):
        user = User.objects.create_user(username="owner2", password="pass")
        serializer = OwnerProfileSerializer(
            data={"name": "Charlie", "phone": "0987654321"},
            context={"request": type("req", (), {"user": user})()}
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        profile = serializer.save()
        self.assertEqual(profile.user, user)
        self.assertEqual(profile.name, "Charlie")

    def test_owner_with_pets_serializer(self):
        serializer = OwnerProfileWithPetsSerializer(self.owner_profile)
        data = serializer.data
        self.assertIn("pets", data)
        self.assertEqual(len(data["pets"]), 1)
        self.assertEqual(data["pets"][0]["name"], "Fido")

    # -----------------------------
    # PetSerializer
    # -----------------------------
    def test_pet_serializer(self):
        serializer = PetSerializer(self.pet)
        data = serializer.data
        self.assertEqual(data["name"], "Fido")
        self.assertIn("profile_picture_url", data)

    # -----------------------------
    # Tag & Specialty
    # -----------------------------
    def test_tag_serializer(self):
        serializer = TagSerializer(self.tag1)
        data = serializer.data
        self.assertEqual(data["name"], "overnight care")

    def test_specialty_serializer(self):
        serializer = SpecialtySerializer(self.spec1)
        data = serializer.data
        self.assertEqual(data["slug"], "dog")

    # -----------------------------
    # SitterProfileSerializer
    # -----------------------------
    def test_sitter_serializer_fields(self):
        serializer = SitterProfileSerializer(self.sitter_profile)
        data = serializer.data
        self.assertEqual(data["user_id"], self.sitter_user.id)
        self.assertIn("profile_picture_url", data)
        self.assertIn("banner_picture_url", data)
        self.assertEqual(len(data["tags"]), 2)
        self.assertEqual(len(data["specialties"]), 2)

    def test_sitter_serializer_create(self):
        user = User.objects.create_user(username="sitter2", password="pass")
        data = {
            "display_name": "New Sitter",
            "rate_hourly": "20.00",
            "service_radius_km": 15,
            "home_zip": "54321",
            "tag_names": ["overnight care"],
            "specialty_slugs": ["dog"]
        }
        serializer = SitterProfileSerializer(data=data, context={"request": type("req", (), {"user": user})()})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        profile = serializer.save()
        self.assertEqual(profile.user, user)
        self.assertEqual(profile.tags.first().name, "overnight care")
        self.assertEqual(profile.specialties.first().slug, "dog")

    def test_sitter_serializer_update_tags_specialties(self):
        serializer = SitterProfileSerializer(self.sitter_profile, data={
            "tag_names": ["medication"],
            "specialty_slugs": ["cat"]
        }, partial=True, context={"request": type("req", (), {"user": self.sitter_user})()})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        profile = serializer.save()
        self.assertEqual(profile.tags.count(), 1)
        self.assertEqual(profile.specialties.count(), 1)

    # -----------------------------
    # PublicSitterCardSerializer
    # -----------------------------
    def test_public_card_serializer(self):
        serializer = PublicSitterCardSerializer(self.sitter_profile)
        data = serializer.data
        self.assertIn("display_name", data)
        self.assertIn("tags", data)
        self.assertIn("specialties", data)
        self.assertIn("profile_picture_url", data)
    
    # -----------------------------
    # Image upload tests (fixed)
    # -----------------------------
    def test_owner_profile_picture_upload(self):
        dummy_image = SimpleUploadedFile(
            "test_owner.png",
            b"fake-image-content",
            content_type="image/png"
        )
        self.owner_profile.profile_picture = dummy_image
        self.owner_profile.save()
        self.assertTrue(self.owner_profile.profile_picture.name.startswith("owner_profiles/test_owner"))

    def test_pet_profile_picture_upload(self):
        dummy_image = SimpleUploadedFile(
            "test_pet.png",
            b"fake-image-content",
            content_type="image/png"
        )
        self.pet.profile_picture = dummy_image
        self.pet.save()
        self.assertTrue(self.pet.profile_picture.name.startswith("pet_profiles/test_pet"))

    def test_sitter_profile_picture_upload(self):
        dummy_image = SimpleUploadedFile(
            "test_sitter.png",
            b"fake-image-content",
            content_type="image/png"
        )
        self.sitter_profile.profile_picture = dummy_image
        self.sitter_profile.save()
        self.assertTrue(self.sitter_profile.profile_picture.name.startswith("sitter_profiles/test_sitter"))

    def test_owner_banner_upload(self):
        dummy_banner = SimpleUploadedFile(
            "owner_banner.png",
            b"fake-image-content",
            content_type="image/png"
        )
        self.owner_profile.banner_picture = dummy_banner
        self.owner_profile.save()
        self.assertTrue(self.owner_profile.banner_picture.name.startswith("owner_banners/owner_banner"))

    def test_sitter_banner_upload(self):
        dummy_banner = SimpleUploadedFile(
            "sitter_banner.png",
            b"fake-image-content",
            content_type="image/png"
        )
        self.sitter_profile.banner_picture = dummy_banner
        self.sitter_profile.save()
        self.assertTrue(self.sitter_profile.banner_picture.name.startswith("sitter_banners/sitter_banner"))
