from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'sitter', 'owner', 'owner_name', 'booking', 'rating', 'comment', 'created_at']
        read_only_fields = ['owner', 'sitter', 'created_at']

    def validate(self, attrs):
        request = self.context['request']
        owner = request.user.ownerprofile
        sitter = attrs.get('sitter')
        booking = attrs.get('booking')

        if booking.owner != owner or booking.sitter != sitter:
            raise serializers.ValidationError("Invalid booking for this sitter.")

        if booking.status != "completed":
            raise serializers.ValidationError("You can only review completed bookings.")

        return attrs

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user.ownerprofile
        return super().create(validated_data)
