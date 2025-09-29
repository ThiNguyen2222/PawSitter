# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import SitterProfile
from .serializers import PublicSitterCardSerializer, SitterProfileSerializer

class SitterProfileViewSet(viewsets.ModelViewSet):  # <-- was ReadOnlyModelViewSet
    """
    list     -> lightweight card serializer (browse/search)
    retrieve -> full detail serializer
    create/update/patch/delete -> full serializer (auth required)
    """
    queryset = SitterProfile.objects.all().order_by("-avg_rating")

    # Use a light serializer for list; full for everything else (detail + writes)
    def get_serializer_class(self):
        return PublicSitterCardSerializer if self.action == "list" else SitterProfileSerializer

    # Public can browse/read; writes require auth
    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == "list":
            # Keep list lean and fast
            qs = qs.only("id", "display_name", "rate_hourly", "avg_rating", "home_zip")
            # Optional filters
            q = self.request.query_params
            if "min_rating" in q:
                qs = qs.filter(avg_rating__gte=q["min_rating"])
            if "max_rate" in q:
                qs = qs.filter(rate_hourly__lte=q["max_rate"])
            if "zip" in q:
                qs = qs.filter(home_zip=q["zip"])
        return qs
