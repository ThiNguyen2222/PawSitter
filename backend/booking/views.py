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
        # Owners see only their bookings, sitters see only theirs
        if user.role == "OWNER":
            return Booking.objects.filter(owner=user.owner_profile)
        elif user.role == "SITTER":
            return Booking.objects.filter(sitter=user.sitter_profile)
        return Booking.objects.none()

    @transaction.atomic
    def perform_update(self, serializer):
        # Handle booking status updates with permission checks
        booking = self.get_object()
        user = self.request.user
        old_status = booking.status
        new_status = serializer.validated_data.get("status")

        # Role-based permission checks
        if user.role == "SITTER" and booking.sitter == user.sitter_profile:
            if new_status not in ["confirmed", "completed", "canceled"]:
                raise PermissionDenied("Sitter cannot set this status.")
        elif user.role == "OWNER" and booking.owner == user.owner_profile:
            if new_status != "canceled":
                raise PermissionDenied("Owner can only cancel the booking.")
        else:
            raise PermissionDenied("You cannot update this booking.")

        serializer.save()
        # Update availability slots according to new status
        self._update_availability_slots(booking, old_status, new_status)

    @transaction.atomic
    def perform_create(self, serializer):
        # On booking creation, mark overlapping slots as booked if confirmed
        booking = serializer.save()
        if booking.status == 'confirmed':
            self._mark_slots_as_booked(booking)

    # ----------------- Internal helper methods ----------------- #

    def _update_availability_slots(self, booking, old_status, new_status):
        # Adjust availability slots when booking status changes
        if old_status != new_status:
            if new_status == 'confirmed' and old_status == 'requested':
                self._mark_slots_as_booked(booking)
            elif new_status in ['canceled', 'completed'] and old_status in ['requested', 'confirmed']:
                self._mark_slots_as_open(booking)

    def _mark_slots_as_booked(self, booking):
        # Mark overlapping open slots as booked
        overlapping_slots = AvailabilitySlot.objects.filter(
            sitter=booking.sitter,
            status='open',
            start_ts__lt=booking.end_ts,
            end_ts__gt=booking.start_ts
        )
        overlapping_slots.update(status='booked')

    def _mark_slots_as_open(self, booking):
        # Revert overlapping booked slots to open if no other bookings exist
        overlapping_slots = AvailabilitySlot.objects.filter(
            sitter=booking.sitter,
            status='booked',
            start_ts__lt=booking.end_ts,
            end_ts__gt=booking.start_ts
        )

        for slot in overlapping_slots:
            # Ensure no other booking occupies this slot before reopening
            other_bookings = Booking.objects.filter(
                sitter=booking.sitter,
                status__in=['requested', 'confirmed'],
                start_ts__lt=slot.end_ts,
                end_ts__gt=slot.start_ts
            ).exclude(pk=booking.pk)

            if not other_bookings.exists():
                slot.status = 'open'
                slot.save()
