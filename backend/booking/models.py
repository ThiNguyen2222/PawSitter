from django.db import models
from django.conf import settings

class Booking(models.Model):
    STATUS_CHOICES = [
        ("requested", "Requested"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("canceled", "Canceled"),
    ]

    SERVICE_CHOICES = [
        ("house_sitting", "House Sitting"),
        ("pet_boarding", "Pet Boarding"),
        ("in_home_visit", "In-Home Visit"),
        ("pet_grooming", "Pet Grooming"),
        ("pet_walking", "Pet Walking"),
    ]

    owner = models.ForeignKey(
        "profiles.OwnerProfile",
        on_delete=models.CASCADE,
        related_name="bookings"
    )
    sitter = models.ForeignKey(
        "profiles.SitterProfile",
        on_delete=models.CASCADE,
        related_name="bookings"
    )
    service_type = models.CharField(
        max_length=20,
        choices=SERVICE_CHOICES,
        default="house_sitting"
    )
    start_ts = models.DateTimeField()
    end_ts = models.DateTimeField()
    price_quote = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="requested")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Booking #{self.id} | {self.owner} → {self.sitter} ({self.status}) [{self.service_type}]"

