# review/serializers.py
from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'sitter', 'owner', 'owner_name', 'booking', 'rating', 'comment', 'created_at']
        read_only_fields = ['owner', 'sitter', 'created_at']

    def validate(self, attrs):
        booking = attrs.get('booking')
        owner = self.context['request'].user.ownerprofile
        attrs['owner'] = owner
        attrs['sitter'] = booking.sitter
        return attrs

    def create(self, validated_data):
        return super().create(validated_data)
