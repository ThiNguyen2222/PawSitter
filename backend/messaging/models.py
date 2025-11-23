from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone

# Alias for the user model
User = settings.AUTH_USER_MODEL

# -----------------------------
# MessageThread model
# -----------------------------
class MessageThread(models.Model):
    # Optional link to a booking; can be null if thread is not tied to a booking
    booking = models.ForeignKey(
        "booking.Booking", on_delete=models.SET_NULL, null=True, blank=True, related_name="threads"
    )
    # First participant in the thread
    user_a = models.ForeignKey(User, on_delete=models.CASCADE, related_name="threads_as_a")
    # Second participant in the thread
    user_b = models.ForeignKey(User, on_delete=models.CASCADE, related_name="threads_as_b")
    # Timestamp when the thread was created
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            # Enforce only one thread per booking per user pair
            models.UniqueConstraint(fields=["booking", "user_a", "user_b"], name="uniq_thread_per_booking"),
            # Enforce only one thread per user pair if no booking is associated
            models.UniqueConstraint(
                fields=["user_a", "user_b"], 
                condition=Q(booking__isnull=True), 
                name="uniq_thread_pair_when_booking_null",
            ),
            # Prevent a user from being in a thread with themselves
            models.CheckConstraint(
                check=~Q(user_a=models.F('user_b')),
                name='different_participants'
            )
        ]
        # Index on created_at for faster ordering / queries
        indexes = [models.Index(fields=["created_at"])]

    def save(self, *args, **kwargs):
        # Ensure user_a_id is always less than user_b_id to maintain consistency
        if self.user_a_id and self.user_b_id and self.user_a_id > self.user_b_id:
            self.user_a, self.user_b = self.user_b, self.user_a
        super().save(*args, **kwargs)

    def __str__(self):
        # Display thread ID and participants
        return f"Thread #{self.pk} ({self.user_a} ↔ {self.user_b})"


# -----------------------------
# Message model
# -----------------------------
class Message(models.Model):
    # Link message to its thread
    thread = models.ForeignKey(MessageThread, on_delete=models.CASCADE, related_name="messages")
    # The user who sent the message
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    # Message content
    body = models.TextField()
    # Timestamp when message was created
    created_at = models.DateTimeField(auto_now_add=True)
    # Timestamp when message was read; null if unread
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        # Order messages chronologically
        ordering = ["created_at"]
        # Index to speed up queries filtering by thread and creation time
        indexes = [models.Index(fields=["thread", "created_at"])]

    def __str__(self):
        # Short display for message
        return f"Msg({self.sender}) in T{self.thread_id}: {self.body[:30]}"
