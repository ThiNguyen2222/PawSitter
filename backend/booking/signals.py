from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import Booking
from availability.models import AvailabilitySlot

@receiver(post_save, sender=Booking)
def update_availability_on_booking(sender, instance, created, **kwargs):
    """Mark availability as booked when booking is confirmed"""
    if instance.status == "confirmed":
        AvailabilitySlot.objects.filter(
            sitter=instance.sitter,
            status="open",
            start_ts__lte=instance.start_ts,
            end_ts__gte=instance.end_ts
        ).update(status="booked")
    
    elif instance.status in ["canceled", "completed"]:
        AvailabilitySlot.objects.filter(
            sitter=instance.sitter,
            status="booked",
            start_ts__lte=instance.start_ts,
            end_ts__gte=instance.end_ts
        ).update(status="open")

@receiver(pre_delete, sender=Booking)
def free_availability_on_delete(sender, instance, **kwargs):
    """Free up availability if booking is deleted"""
    if instance.status in ["confirmed", "requested"]:
        AvailabilitySlot.objects.filter(
            sitter=instance.sitter,
            status="booked",
            start_ts__lte=instance.start_ts,
            end_ts__gte=instance.end_ts
        ).update(status="open")