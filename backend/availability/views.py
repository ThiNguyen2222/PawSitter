from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import AvailabilitySlot
from .serializers import AvailabilitySlotSerializer

class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    queryset = AvailabilitySlot.objects.all()
    serializer_class = AvailabilitySlotSerializer

    def get_permissions(self):
        """
        Allow unrestricted access to GET requests.
        Restrict POST/PUT/PATCH/DELETE to authenticated users.
        """
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    # added filtering so that sitters see only their own
    def get_queryset(self):
        qs = super().get_queryset()
        # filter by sitter id: /api/availability/slots?sitter=123
        sitter_id = self.request.query_params.get("sitter")
        if sitter_id:
            return qs.filter(sitter_id=sitter_id)

        # only my slots: /api/availability/slots?mine=true
        mine = self.request.query_params.get("mine")
        user = self.request.user
        if mine == "true" and user.is_authenticated and hasattr(user, "sitter_profile"):
            return qs.filter(sitter=user.sitter_profile)

        return qs
    
    def perform_create(self, serializer):
        """Auto-assign sitter from logged-in user"""
        user = self.request.user
        if user.role != "SITTER":
            raise PermissionDenied("Only sitters can create availability slots.")
        serializer.save(sitter=user.sitter_profile)
    
    def perform_update(self, serializer):
        """Ensure sitter can only update their own slots"""
        slot = self.get_object()
        user = self.request.user
        if user.role != "SITTER" or slot.sitter != user.sitter_profile:
            raise PermissionDenied("You can only update your own availability.")
        serializer.save()
    
    def perform_destroy(self, instance):
        """Ensure sitter can only delete their own slots"""
        user = self.request.user
        if user.role != "SITTER" or instance.sitter != user.sitter_profile:
            raise PermissionDenied("You can only delete your own availability.")
        instance.delete()