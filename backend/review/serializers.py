# review/serializers.py
from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.name', read_only=True)
    sitter_name = serializers.CharField(source='sitter.display_name', read_only=True)
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)
    sitter_id = serializers.IntegerField(source='sitter.id', read_only=True)
    owner_profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 
            'booking', 
            'owner_id',
            'owner_name',
            'sitter_id', 
            'sitter_name',
            'rating', 
            'comment', 
            'created_at',
            'owner_profile_picture_url'
        ]
        read_only_fields = ['id', 'owner_id', 'owner_name', 'sitter_id', 'sitter_name', 'created_at']

    def validate(self, attrs):
        user = self.context['request'].user
        
        # Only validate booking-related stuff on create
        if not self.instance:
            # Get owner profile (role already checked in view)
            try:
                owner = user.owner_profile
            except AttributeError:
                raise serializers.ValidationError("Owner profile not found.")
            
            booking = attrs.get('booking')
            
            # Validate booking exists
            if not booking:
                raise serializers.ValidationError("Booking is required.")
            
            # Validate booking belongs to this owner
            if booking.owner != owner:
                raise serializers.ValidationError("This booking does not belong to you.")
            
            # Validate booking is completed
            if booking.status != 'completed':
                raise serializers.ValidationError("You can only review completed bookings.")
            
            # Validate no duplicate review
            if Review.objects.filter(booking=booking).exists():
                raise serializers.ValidationError("A review for this booking already exists.")
            
            # Auto-assign owner and sitter
            attrs['owner'] = owner
            attrs['sitter'] = booking.sitter
        
        # Validate rating bounds (for both create and update)
        rating = attrs.get('rating')
        if rating is not None and not (1 <= rating <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        
        return attrs

    def create(self, validated_data):
        return super().create(validated_data)
    
    def get_owner_profile_picture_url(self, obj):
        try:
            profile = obj.owner  # OwnerProfile instance
            if profile.profile_picture:
                return profile.profile_picture.url
        except:
            pass
        return None
