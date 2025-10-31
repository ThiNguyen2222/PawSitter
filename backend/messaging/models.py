from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class MessageThread(models.Model):
    # optional link to a booking if you want one thread per booking
    booking = models.ForeignKey(
        "booking.Booking", on_delete=models.SET_NULL, null=True, blank=True, related_name="threads"
    )
    # participants (owner & sitter) — you can rename these if your roles differ
    user_a = models.ForeignKey(User, on_delete=models.CASCADE, related_name="threads_as_a")
    user_b = models.ForeignKey(User, on_delete=models.CASCADE, related_name="threads_as_b")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            # one thread for a given booking + pair
            models.UniqueConstraint(fields=["booking", "user_a", "user_b"], name="uniq_thread_per_booking"),
            # if there's NO booking, enforce one thread per pair
            models.UniqueConstraint(
                fields=["user_a", "user_b"], 
                condition=Q(booking__isnull=True), 
                name="uniq_thread_pair_when_booking_null",
            ),
            models.CheckConstraint(
                check=~Q(user_a=models.F('user_b')),
                name='different_participants'
            )
        ]
        indexes = [models.Index(fields=["created_at"])]

    def save(self, *args, **kwargs):
        if self.user_a_id and self.user_b_id and self.user_a_id > self.user_b_id:
            self.user_a, self.user_b = self.user_b, self.user_a
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Thread #{self.pk} ({self.user_a} ↔ {self.user_b})"


class Message(models.Model):
    thread = models.ForeignKey(MessageThread, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [models.Index(fields=["thread", "created_at"])]

    def __str__(self):
        return f"Msg({self.sender}) in T{self.thread_id}: {self.body[:30]}"