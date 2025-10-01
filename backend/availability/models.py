from django.db import models

# Create your models here.
class AvailabilitySlot(models.Model):
    # Link each slot to a sitter profile in the profiles app
    sitter = models.ForeignKey(
        'profiles.SitterProfile',
        on_delete=models.CASCADE,
        related_name='availability_slots'
    )
    start_ts = models.DateTimeField()
    end_ts = models.DateTimeField()
    is_recurring = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=[('open', 'Open'), ('booked', 'Booked'), ('blocked', 'Blocked')],
        default='open'
    )

    class Meta:
        ordering = ['start_ts']

    def __str__(self):
        return f"{self.sitter} | {self.start_ts} → {self.end_ts} ({self.status})"