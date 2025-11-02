from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from .models import Booking
from .serializers import BookingSerializer
from availability.models import AvailabilitySlot


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "OWNER":
            return Booking.objects.filter(owner=user.owner_profile)
        elif user.role == "SITTER":
            return Booking.objects.filter(sitter=user.sitter_profile)
        return Booking.objects.none()

    @transaction.atomic
    def perform_update(self, serializer):
        booking = self.get_object()
        user = self.request.user
        old_status = booking.status
        new_status = serializer.validated_data.get("status")

        if user.role == "SITTER" and booking.sitter == user.sitter_profile:
            if new_status not in ["confirmed", "completed", "canceled"]:
                raise PermissionDenied("Sitter cannot set this status.")
        elif user.role == "OWNER" and booking.owner == user.owner_profile:
            if new_status != "canceled":
                raise PermissionDenied("Owner can only cancel the booking.")
        else:
            raise PermissionDenied("You cannot update this booking.")

        serializer.save()

        self._update_availability_slots(booking, old_status, new_status)

    @transaction.atomic
    def perform_create(self, serializer):
        """When a booking is created, mark overlapping slots as 'booked'"""
        booking = serializer.save()
        
        if booking.status == 'confirmed':
            self._mark_slots_as_booked(booking)

    def _update_availability_slots(self, booking, old_status, new_status):
        """
        Update availability slot statuses based on booking status changes.
        - confirmed: Mark overlapping 'open' slots as 'booked'
        - canceled/completed: Mark overlapping 'booked' slots back to 'open'
        """
        if old_status != new_status:
            if new_status == 'confirmed' and old_status == 'requested':
                self._mark_slots_as_booked(booking)
            
            elif new_status in ['canceled', 'completed'] and old_status in ['requested', 'confirmed']:
                self._mark_slots_as_open(booking)

    def _mark_slots_as_booked(self, booking):
        """Mark overlapping open slots as booked"""
        overlapping_slots = AvailabilitySlot.objects.filter(
            sitter=booking.sitter,
            status='open',
            start_ts__lt=booking.end_ts,
            end_ts__gt=booking.start_ts
        )
        overlapping_slots.update(status='booked')

    def _mark_slots_as_open(self, booking):
        """
        Mark overlapping booked slots as open.
        Only changes slots that were marked as 'booked', not 'blocked'.
        """
        overlapping_slots = AvailabilitySlot.objects.filter(
            sitter=booking.sitter,
            status='booked',
            start_ts__lt=booking.end_ts,
            end_ts__gt=booking.start_ts
        )
        
        for slot in overlapping_slots:
            other_bookings = Booking.objects.filter(
                sitter=booking.sitter,
                status__in=['requested', 'confirmed'],
                start_ts__lt=slot.end_ts,
                end_ts__gt=slot.start_ts
            ).exclude(pk=booking.pk)
            
            if not other_bookings.exists():
                slot.status = 'open'
                slot.save()