# review/models.py
from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Avg
from booking.models import Booking
from profiles.models import SitterProfile, OwnerProfile

class Review(models.Model):
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='review'
    )
    owner = models.ForeignKey(
        OwnerProfile,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    sitter = models.ForeignKey(
        SitterProfile,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.IntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('booking', 'sitter')

    def clean(self):
        # Booking must belong to owner
        if self.booking.owner != self.owner:
            raise ValidationError("This booking does not belong to the owner.")

        # Booking must have the correct sitter
        if self.booking.sitter != self.sitter:
            raise ValidationError("This sitter does not match the booking.")

        # Booking must be completed
        if self.booking.status != "completed":
            raise ValidationError("You can only review completed bookings.")

        # Rating bounds
        if not (1 <= self.rating <= 5):
            raise ValidationError("Rating must be between 1 and 5.")

        # Check for duplicate review
        if self.booking_id and Review.objects.exclude(pk=self.pk).filter(booking=self.booking).exists():
            raise ValidationError("A review for this booking already exists.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"Review {self.id} | {self.owner} → {self.sitter} ({self.rating})"
