from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Booking
from profiles.models import SitterProfile
from availability.models import AvailabilitySlot

class BookingSerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(source="owner.id", read_only=True)
    sitter_id = serializers.IntegerField(source="sitter.id", read_only=True)
    sitter = serializers.PrimaryKeyRelatedField(
        queryset=SitterProfile.objects.all(),
        write_only=True
    )

    class Meta:
        model = Booking
        fields = [
            "id",
            "owner_id",
            "sitter_id",
            "sitter",
            "service_type",
            "start_ts",
            "end_ts",
            "price_quote",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at")

    def validate(self, attrs):
        sitter = attrs.get("sitter")
        start = attrs.get("start_ts")
        end = attrs.get("end_ts")

        if start is not None and end is not None:
            if start >= end:
                raise serializers.ValidationError("End time must be after start time.")

            if sitter and not AvailabilitySlot.objects.filter(
                sitter=sitter,
                status="open",
                start_ts__lte=start,
                end_ts__gte=end
            ).exists():
                raise serializers.ValidationError("Sitter is not available for the requested time.")

            overlapping = Booking.objects.filter(
                sitter=sitter,
                status__in=["requested", "confirmed"],
                start_ts__lt=end,
                end_ts__gt=start
            )
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)

            if overlapping.exists():
                raise serializers.ValidationError("Sitter already has a booking during this time.")

        return attrs


    def create(self, validated_data):
        user = self.context["request"].user
        try:
            owner_profile = user.owner_profile
        except AttributeError:
            raise ValidationError("Authenticated user must have an owner profile.")
        validated_data["owner"] = owner_profile
        return super().create(validated_data)
