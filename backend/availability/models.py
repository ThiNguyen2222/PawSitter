from django.db import models

# Model representing a sitter's available time slot
class AvailabilitySlot(models.Model):
    # Link each slot to a sitter profile in the profiles app
    sitter = models.ForeignKey(
        'profiles.SitterProfile',
        on_delete=models.CASCADE,
        related_name='availability_slots'
    )

    # Start and end timestamps for the slot
    start_ts = models.DateTimeField()
    end_ts = models.DateTimeField()

    # Status of the slot: open, booked, or blocked
    status = models.CharField(
        max_length=20,
        choices=[('open', 'Open'), ('booked', 'Booked'), ('blocked', 'Blocked')],
        default='open'
    )

    class Meta:
        # Default ordering by start time
        ordering = ['start_ts']

    # String representation of the slot
    def __str__(self):
        return f"{self.sitter} | {self.start_ts} → {self.end_ts} ({self.status})"
