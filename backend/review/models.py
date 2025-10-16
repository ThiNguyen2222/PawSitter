from django.db import models
from django.conf import settings

class Review(models.Model):
    sitter = models.ForeignKey('profiles.SitterProfile', on_delete=models.CASCADE, related_name='reviews')
    owner = models.ForeignKey('profiles.OwnerProfile', on_delete=models.CASCADE, related_name='reviews')
    booking = models.OneToOneField('booking.Booking', on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sitter', 'booking')

    def __str__(self):
        return f"{self.owner.user} → {self.sitter.user} ({self.rating})"
