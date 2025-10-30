from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import AvailabilitySlot

class AvailabilitySlotSerializer(serializers.ModelSerializer):
    sitter_id = serializers.IntegerField(source='sitter.id', read_only=True)
    
    class Meta:
        model = AvailabilitySlot
        fields = ['id', 'sitter_id', 'start_ts', 'end_ts', 'status']
        read_only_fields = ['id', 'sitter_id']
    
    def validate(self, attrs):
        request = self.context.get('request')

        if self.instance:
            sitter = self.instance.sitter
        elif request and request.user.role == "SITTER":
            try:
                sitter = request.user.sitter_profile
            except AttributeError:
                raise ValidationError("Sitter profile not found")
        else:
            return attrs
    
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