from rest_framework import viewsets, permissions
from .models import AvailabilitySlot
from .serializers import AvailabilitySlotSerializer

class AvailabilitySlotViewSet(viewsets.ModelViewSet):
    queryset = AvailabilitySlot.objects.all()
    serializer_class = AvailabilitySlotSerializer
    permission_classes = [permissions.IsAuthenticated]
