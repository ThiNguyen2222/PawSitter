from rest_framework import viewsets, permissions
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Review.objects.all()

    def get_queryset(self):
        sitter_id = self.request.query_params.get('sitter')
        if sitter_id:
            return Review.objects.filter(sitter_id=sitter_id).order_by('-created_at')
        return Review.objects.all()

    def perform_create(self, serializer):
        serializer.save()
