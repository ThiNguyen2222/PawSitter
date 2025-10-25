from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.core.files.storage import default_storage

# -----------------------------
# Dynamic upload paths
# -----------------------------
# -----------------------------
# Dynamic upload paths
# -----------------------------
def owner_profile_picture_path(instance, filename):
    ext = filename.split('.')[-1]
    return f"owner_profiles/{instance.id}/profile.{ext}"

def owner_banner_picture_path(instance, filename):
    ext = filename.split('.')[-1]
    return f"owner_banners/{instance.id}/banner.{ext}"

def sitter_profile_picture_path(instance, filename):
    ext = filename.split('.')[-1]
    return f"sitter_profiles/{instance.id}/profile.{ext}"

def sitter_banner_picture_path(instance, filename):
    ext = filename.split('.')[-1]
    return f"sitter_banners/{instance.id}/banner.{ext}"

def pet_profile_picture_path(instance, filename):
    ext = filename.split('.')[-1]
    return f"pet_profiles/{instance.owner.id}/{instance.name}_profile.{ext}"

# -----------------------------
# OwnerProfile
# -----------------------------
class OwnerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="owner_profile")
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    default_location = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to=owner_profile_picture_path, blank=True, null=True)
    banner_picture = models.ImageField(upload_to=owner_banner_picture_path, blank=True, null=True)

    def __str__(self):
        return f"{self.name} (Owner)"

    def save(self, *args, **kwargs):
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
# Pet
# -----------------------------
class Pet(models.Model):
    owner = models.ForeignKey(OwnerProfile, on_delete=models.CASCADE, related_name="pets")
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=50)
    breed = models.CharField(max_length=100, blank=True)
    age = models.IntegerField()
    notes = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to=pet_profile_picture_path, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.species})"

    def save(self, *args, **kwargs):
        if self.pk:
            old = Pet.objects.filter(pk=self.pk).first()
            if old and old.profile_picture != self.profile_picture:
                if old.profile_picture and default_storage.exists(old.profile_picture.name):
                    default_storage.delete(old.profile_picture.name)
        super().save(*args, **kwargs)


# -----------------------------
# Tag & Specialty
# -----------------------------
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Specialty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# -----------------------------
# SitterProfile
# -----------------------------
class SitterProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sitter_profile")
    display_name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    rate_hourly = models.DecimalField(max_digits=6, decimal_places=2)
    service_radius_km = models.IntegerField(default=5)
    home_zip = models.CharField(max_length=20)
    avg_rating = models.FloatField(default=0.0)
    verification_status = models.CharField(max_length=20, default="PENDING")

    profile_picture = models.ImageField(upload_to=sitter_profile_picture_path, blank=True, null=True)
    banner_picture = models.ImageField(upload_to=sitter_banner_picture_path, blank=True, null=True)

    tags = models.ManyToManyField(Tag, related_name="sitters", blank=True)
    specialties = models.ManyToManyField(Specialty, related_name="sitters", blank=True)

    def __str__(self):
        return f"{self.display_name} (Sitter)"

    def save(self, *args, **kwargs):
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
