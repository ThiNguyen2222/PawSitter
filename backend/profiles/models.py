from django.db import models
from django.conf import settings
from django.utils.text import slugify

class OwnerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owner_profile"
    )
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    default_location = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to="owner_profiles/", blank=True, null=True, default="owner_profiles/default_profile.png")
    banner_picture = models.ImageField(upload_to="owner_banners/", blank=True, null=True, default="owner_banners/default_banner.png")
    
    def __str__(self):
        return f"{self.name} (Owner)"


class Pet(models.Model):
    owner = models.ForeignKey(
        OwnerProfile,
        on_delete=models.CASCADE,
        related_name="pets"
    )
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=50)
    breed = models.CharField(max_length=100, blank=True)
    age = models.IntegerField()
    notes = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to="pet_profiles/", blank=True, null=True,default="pet_profiles/default_banner.png")

    def __str__(self):
        return f"{self.name} ({self.species})"

class Tag(models.Model):
    """
    Represents flexible, user-defined keywords that describe
    a sitter's experience, skills, or services.
    Examples: "Overnight Care", "Medication-Trained", "Puppies", "Senior Pets"
    """
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
class Specialty(models.Model):
    """
    Represents a structured category of pet types or services
    (e.g. Dog, Cat, Bird, Reptile).
    Unlike tags, specialties are predefined and not user-created.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class SitterProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sitter_profile"
    )
    display_name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    rate_hourly = models.DecimalField(max_digits=6, decimal_places=2)
    service_radius_km = models.IntegerField(default=5)
    home_zip = models.CharField(max_length=20)
    avg_rating = models.FloatField(default=0.0)
    verification_status = models.CharField(max_length=20, default="PENDING")

    profile_picture = models.ImageField(upload_to="sitter_profiles/", blank=True, null=True,default="sitter_profiles/default_banner.png")
    banner_picture = models.ImageField(upload_to="sitter_banners/", blank=True, null=True,default="sitter_banners/default_banner.png")

    tags = models.ManyToManyField(Tag, related_name="sitters", blank=True)
    specialties = models.ManyToManyField(Specialty, related_name="sitters", blank=True)

    def __str__(self):
        return f"{self.display_name} (Sitter)"
