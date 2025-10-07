from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import AvailabilitySlot

class AvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = '__all__'

    def validate(self, attrs):
        sitter = attrs.get("sitter")
        start = attrs.get("start_ts")
        end = attrs.get("end_ts")

        if start >= end:
            raise ValidationError("End time must be after start time.")

        overlapping = AvailabilitySlot.objects.filter(
            sitter=sitter,
            start_ts__lt=end,
            end_ts__gt=start
        )

        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)

        if overlapping.exists():
            raise ValidationError("This availability overlaps with an existing slot.")

        return attrs
