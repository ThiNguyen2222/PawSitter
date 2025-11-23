import uuid
from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.core.files.storage import default_storage

# -----------------------------
# Dynamic upload paths
# -----------------------------
def owner_profile_picture_path(instance, filename):
    # Path for owner profile picture uploads
    # Uses user.id so the path exists even on initial creation
    ext = filename.split('.')[-1]
    return f"owner_profiles/{instance.user.id}/profile.{ext}"

def owner_banner_picture_path(instance, filename):
    # Path for owner banner uploads
    ext = filename.split('.')[-1]
    return f"owner_banners/{instance.user.id}/banner.{ext}"

def sitter_profile_picture_path(instance, filename):
    # Path for sitter profile picture uploads
    ext = filename.split('.')[-1]
    return f"sitter_profiles/{instance.user.id}/profile.{ext}"

def sitter_banner_picture_path(instance, filename):
    # Path for sitter banner uploads
    ext = filename.split('.')[-1]
    return f"sitter_banners/{instance.user.id}/banner.{ext}"

def pet_profile_picture_path(instance, filename):
    # Path for pet profile pictures
    # Uses owner.user.id and a short UUID to avoid filename conflicts
    ext = filename.split('.')[-1]
    unique_id = uuid.uuid4().hex[:8]  # ensures uniqueness
    return f"pet_profiles/{instance.owner.user.id}/{unique_id}.{ext}"

# -----------------------------
# OwnerProfile Model
# -----------------------------
class OwnerProfile(models.Model):
    # Model for pet owners
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="owner_profile"
    )
    name = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    default_location = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    profile_picture = models.ImageField(
        upload_to=owner_profile_picture_path, blank=True, null=True
    )
    banner_picture = models.ImageField(
        upload_to=owner_banner_picture_path, blank=True, null=True
    )

    def __str__(self):
        return f"{self.name} (Owner)"

    def save(self, *args, **kwargs):
        # Delete old profile/banner images from storage if replaced
        # Prevents orphaned files on update
        if self.pk:
            old = OwnerProfile.objects.filter(pk=self.pk).first()
            if old:
                if old.profile_picture and old.profile_picture != self.profile_picture:
                    if default_storage.exists(old.profile_picture.name):
                        default_storage.delete(old.profile_picture.name)
                if old.banner_picture and old.banner_picture != self.banner_picture:
                    if default_storage.exists(old.banner_picture.name):
                        default_storage.delete(old.banner_picture.name)
        super().save(*args, **kwargs)

# -----------------------------
# Pet Model
# -----------------------------
class Pet(models.Model):
    # Model for pets
    owner = models.ForeignKey(
        OwnerProfile, on_delete=models.CASCADE, related_name="pets"
    )
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=50)
    breed = models.CharField(max_length=100, blank=True)
    age = models.IntegerField()
    notes = models.TextField(blank=True)
    profile_picture = models.ImageField(
        upload_to=pet_profile_picture_path, blank=True, null=True
    )

    def __str__(self):
        return f"{self.name} ({self.species})"

    def save(self, *args, **kwargs):
        # Delete old pet profile picture if replaced
        if self.pk:
            old = Pet.objects.filter(pk=self.pk).first()
            if old and old.profile_picture != self.profile_picture:
                if old.profile_picture and default_storage.exists(old.profile_picture.name):
                    default_storage.delete(old.profile_picture.name)
        super().save(*args, **kwargs)

# -----------------------------
# Tag & Specialty Models
# -----------------------------
class Tag(models.Model):
    # Model for tags used by sitters
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)

    def save(self, *args, **kwargs):
        # Auto-generate slug from name if not provided
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Specialty(models.Model):
    # Model for sitter specialties
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    def save(self, *args, **kwargs):
        # Auto-generate slug from name if not provided
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

# -----------------------------
# SitterProfile Model
# -----------------------------
class SitterProfile(models.Model):
    # Model for sitters
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sitter_profile"
    )
    display_name = models.CharField(max_length=100, blank=True, default='')
    bio = models.TextField(blank=True)
    rate_hourly = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    service_radius_km = models.IntegerField(default=5)
    home_zip = models.CharField(max_length=20, blank=True, default='')
    avg_rating = models.FloatField(default=0.0)
    verification_status = models.CharField(max_length=20, default="PENDING")
    phone = models.CharField(max_length=20, blank=True, null=True)

    profile_picture = models.ImageField(
        upload_to=sitter_profile_picture_path, blank=True, null=True
    )
    banner_picture = models.ImageField(
        upload_to=sitter_banner_picture_path, blank=True, null=True
    )

    tags = models.ManyToManyField(Tag, related_name="sitters", blank=True)
    specialties = models.ManyToManyField(Specialty, related_name="sitters", blank=True)

    def __str__(self):
        return f"{self.display_name} (Sitter)"

    def save(self, *args, **kwargs):
        # Delete old profile/banner images if replaced to prevent orphaned files
        if self.pk:
            old = SitterProfile.objects.filter(pk=self.pk).first()
            if old:
                if old.profile_picture and old.profile_picture != self.profile_picture:
                    if default_storage.exists(old.profile_picture.name):
                        default_storage.delete(old.profile_picture.name)
                if old.banner_picture and old.banner_picture != self.banner_picture:
                    if default_storage.exists(old.banner_picture.name):
                        default_storage.delete(old.banner_picture.name)
        super().save(*args, **kwargs)
