from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Booking
from .serializers import BookingSerializer
from availability.models import AvailabilitySlot

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().select_related("owner", "sitter")
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Owner creates booking request; sitter slot must be open"""
        owner_profile = self.request.user.owner_profile
        booking = serializer.save(owner=owner_profile)

        AvailabilitySlot.objects.filter(
            sitter=booking.sitter,
            status="open",
            start_ts__lte=booking.start_ts,
            end_ts__gte=booking.end_ts
        ).update(status="booked")

        return booking

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        booking = self.get_object()
        if booking.sitter != request.user.sitter_profile:
            return Response({"detail": "You cannot accept this booking"}, status=403)

        if booking.status != "requested":
            return Response({"detail": "Only requested bookings can be accepted"}, status=400)

        booking.status = "confirmed"
        booking.save()
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):
        booking = self.get_object()
        if booking.sitter != request.user.sitter_profile:
            return Response({"detail": "You cannot decline this booking"}, status=403)

        if booking.status != "requested":
            return Response({"detail": "Only requested bookings can be declined"}, status=400)

        booking.status = "canceled"
        booking.save()

        AvailabilitySlot.objects.filter(
            sitter=booking.sitter,
            status="booked",
            start_ts__lte=booking.start_ts,
            end_ts__gte=booking.end_ts
        ).update(status="open")

        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        user = request.user

        if hasattr(user, "owner_profile") and booking.owner == user.owner_profile:
            actor = "owner"
        elif hasattr(user, "sitter_profile") and booking.sitter == user.sitter_profile:
            actor = "sitter"
        else:
            return Response({"detail": "You cannot cancel this booking"}, status=403)

        if booking.status not in ["requested", "confirmed"]:
            return Response({"detail": f"Cannot cancel a booking in '{booking.status}' status"}, status=400)

        booking.status = "canceled"
        booking.save()

        if actor == "sitter":
            AvailabilitySlot.objects.filter(
                sitter=booking.sitter,
                status="booked",
                start_ts__lte=booking.start_ts,
                end_ts__gte=booking.end_ts
            ).update(status="open")

        return Response(BookingSerializer(booking).data)
