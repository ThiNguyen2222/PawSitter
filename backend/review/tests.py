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
    # Image uploads and replacements
    # -----------------------------
    def test_owner_profile_picture_upload(self):
        dummy = SimpleUploadedFile("owner.png", b"fake", content_type="image/png")
        self.owner_profile.profile_picture = dummy
        self.owner_profile.save()
        self.assertIn(f"owner_profiles/{self.owner_user.id}/profile", self.owner_profile.profile_picture.name)

    def test_owner_profile_picture_replacement(self):
        dummy1 = SimpleUploadedFile("owner1.png", b"fake", content_type="image/png")
        dummy2 = SimpleUploadedFile("owner2.png", b"fake", content_type="image/png")
        self.owner_profile.profile_picture = dummy1
        self.owner_profile.save()
        self.owner_profile.profile_picture = dummy2
        self.owner_profile.save()
        self.assertIn(f"owner_profiles/{self.owner_user.id}/profile", self.owner_profile.profile_picture.name)

    def test_owner_banner_upload(self):
        dummy = SimpleUploadedFile("banner.png", b"fake", content_type="image/png")
        self.owner_profile.banner_picture = dummy
        self.owner_profile.save()
        self.assertIn(f"owner_banners/{self.owner_user.id}/banner", self.owner_profile.banner_picture.name)

    def test_owner_banner_replacement(self):
        dummy1 = SimpleUploadedFile("banner1.png", b"fake", content_type="image/png")
        dummy2 = SimpleUploadedFile("banner2.png", b"fake", content_type="image/png")
        self.owner_profile.banner_picture = dummy1
        self.owner_profile.save()
        self.owner_profile.banner_picture = dummy2
        self.owner_profile.save()
        self.assertIn(f"owner_banners/{self.owner_user.id}/banner", self.owner_profile.banner_picture.name)

    def test_pet_profile_picture_upload(self):
        dummy = SimpleUploadedFile("pet.png", b"fake", content_type="image/png")
        self.pet.profile_picture = dummy
        self.pet.save()
        self.assertIn(f"pet_profiles/{self.owner_user.id}/Fido_profile", self.pet.profile_picture.name)

    def test_sitter_profile_picture_upload(self):
        dummy = SimpleUploadedFile("sitter.png", b"fake", content_type="image/png")
        self.sitter_profile.profile_picture = dummy
        self.sitter_profile.save()
        self.assertIn(f"sitter_profiles/{self.sitter_user.id}/profile", self.sitter_profile.profile_picture.name)

    def test_sitter_profile_picture_replacement(self):
        dummy1 = SimpleUploadedFile("sitter1.png", b"fake", content_type="image/png")
        dummy2 = SimpleUploadedFile("sitter2.png", b"fake", content_type="image/png")
        self.sitter_profile.profile_picture = dummy1
        self.sitter_profile.save()
        self.sitter_profile.profile_picture = dummy2
        self.sitter_profile.save()
        self.assertIn(f"sitter_profiles/{self.sitter_user.id}/profile", self.sitter_profile.profile_picture.name)

    def test_sitter_banner_upload(self):
        dummy = SimpleUploadedFile("banner.png", b"fake", content_type="image/png")
        self.sitter_profile.banner_picture = dummy
        self.sitter_profile.save()
        self.assertIn(f"sitter_banners/{self.sitter_user.id}/banner", self.sitter_profile.banner_picture.name)

    def test_sitter_banner_replacement(self):
        dummy1 = SimpleUploadedFile("banner1.png", b"fake", content_type="image/png")
        dummy2 = SimpleUploadedFile("banner2.png", b"fake", content_type="image/png")
        self.sitter_profile.banner_picture = dummy1
        self.sitter_profile.save()
        self.sitter_profile.banner_picture = dummy2
        self.sitter_profile.save()
        self.assertIn(f"sitter_banners/{self.sitter_user.id}/banner", self.sitter_profile.banner_picture.name)
