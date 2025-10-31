from rest_framework import viewsets, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Review.objects.all()

    def get_queryset(self):
        user = self.request.user
        sitter_id = self.request.query_params.get('sitter')
        
        # If sitter_id provided, return reviews for that sitter (public view)
        if sitter_id:
            return Review.objects.filter(sitter_id=sitter_id).order_by('-created_at')
        
        # Otherwise, filter by role
        if user.role == 'OWNER':
            # Owners see their own reviews
            return Review.objects.filter(owner=user.owner_profile).order_by('-created_at')
        elif user.role == 'SITTER':
            # Sitters see reviews about them
            return Review.objects.filter(sitter=user.sitter_profile).order_by('-created_at')
        
        return Review.objects.none()

    def create(self, request, *args, **kwargs):
        # Check permission BEFORE validation
        if request.user.role != 'OWNER':
            raise PermissionDenied("Only owners can create reviews.")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        # Check permission BEFORE validation
        review = self.get_object()
        if review.owner.user != request.user:
            raise PermissionDenied("You can only update your own reviews.")
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        # Check permission BEFORE validation
        review = self.get_object()
        if review.owner.user != request.user:
            raise PermissionDenied("You can only update your own reviews.")
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        # Check permission BEFORE deletion
        review = self.get_object()
        if review.owner.user != request.user:
            raise PermissionDenied("You can only delete your own reviews.")
        return super().destroy(request, *args, **kwargs)