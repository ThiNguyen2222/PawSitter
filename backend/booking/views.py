from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Booking
from .serializers import BookingSerializer

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

    def perform_update(self, serializer):
        booking = self.get_object()
        user = self.request.user
        new_status = serializer.validated_data.get("status")

        if user.role == "SITTER" and booking.sitter == user.sitter_profile:
            if new_status in ["confirmed", "completed", "canceled"]:
                serializer.save()
            else:
                raise PermissionDenied("Sitter cannot set this status.")
        elif user.role == "OWNER" and booking.owner == user.owner_profile:
            if new_status == "canceled":
                serializer.save()
            else:
                raise PermissionDenied("Owner can only cancel the booking.")
        else:
            raise PermissionDenied("You cannot update this booking.")
