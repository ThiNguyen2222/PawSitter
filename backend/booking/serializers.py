from rest_framework import serializers
from .models import Booking
from availability.models import AvailabilitySlot

class BookingSerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(source="owner.id", read_only=True)
    sitter_id = serializers.IntegerField(source="sitter.id", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "owner_id",
            "sitter_id",
            "start_ts",
            "end_ts",
            "price_quote",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "status", "created_at", "updated_at")

    def validate(self, attrs):
        """Ensure sitter is available in the given time window"""
        sitter = self.context["request"].data.get("sitter")
        start = attrs.get("start_ts")
        end = attrs.get("end_ts")

        if start >= end:
            raise serializers.ValidationError("End time must be after start time.")

        if sitter and AvailabilitySlot.objects.filter(
            sitter_id=sitter,
            status="open",
            start_ts__lte=start,
            end_ts__gte=end
        ).exists() is False:
            raise serializers.ValidationError("Sitter is not available for the requested time.")

        return attrs
