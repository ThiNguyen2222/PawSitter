from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from django.contrib.auth import get_user_model

from .models import Booking
from profiles.models import SitterProfile, Pet, OwnerProfile
from availability.models import AvailabilitySlot

User = get_user_model()

class OwnerUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "username"]


class OwnerProfileSerializer(serializers.ModelSerializer):
    user = OwnerUserSerializer(read_only=True)

    class Meta:
        model = OwnerProfile
        fields = ["id", "user"]

class BookingSerializer(serializers.ModelSerializer):
    owner = OwnerProfileSerializer(read_only=True)

    # Read-only fields for owner and sitter IDs
    owner_id = serializers.IntegerField(source="owner.id", read_only=True)
    sitter_id = serializers.IntegerField(source="sitter.id", read_only=True)
    sitter_name = serializers.CharField(source="sitter.display_name", read_only=True)

    # Write-only sitter selection
    sitter = serializers.PrimaryKeyRelatedField(
        queryset=SitterProfile.objects.all(),
        write_only=True
    )

    # Write-only pet IDs for assignment
    pets = serializers.PrimaryKeyRelatedField(
        queryset=Pet.objects.all(),
        many=True,
        write_only=True
    )

    # Read-only pet info for display
    pet_ids = serializers.SerializerMethodField(read_only=True)
    pet_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "owner",
            "owner_id",
            "sitter_id",
            "sitter",
            "sitter_name", # ✅ NEW field
            "pets",       # Write only
            "pet_ids",    # Read only - just IDs
            "pet_details",# Read only - full pet info
            "service_type",
            "start_ts",
            "end_ts",
            "price_quote",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "created_at", "updated_at", "pet_ids", "pet_details", "owner", "sitter_name")

    # Methods to retrieve pet info
    def get_pet_ids(self, obj):
        # Return list of pet IDs
        return [pet.id for pet in obj.pets.all()]
    
    def get_pet_details(self, obj):
        # Return detailed info for each pet
        return [
            {
                "id": pet.id,
                "name": pet.name,
                "species": pet.species,
                "breed": pet.breed,
            }
            for pet in obj.pets.all()
        ]

    # Validate pets belong to the booking owner
    def validate_pets(self, pets):
        user = self.context["request"].user
        try:
            owner_profile = user.owner_profile
        except AttributeError:
            raise ValidationError("Authenticated user must have an owner profile.")
        
        if not pets:
            raise ValidationError("At least one pet is required for booking.")
        
        for pet in pets:
            if pet.owner != owner_profile:
                raise ValidationError(f"Pet '{pet.name}' does not belong to you.")
        
        return pets

    # Validate booking times and sitter availability
    def validate(self, attrs):
        sitter = attrs.get("sitter")
        start = attrs.get("start_ts")
        end = attrs.get("end_ts")

        if start is not None and end is not None:
            if start >= end:
                raise serializers.ValidationError("End time must be after start time.")

            if sitter:
                # Check for blocked or booked slots
                blocked_or_booked_slots = AvailabilitySlot.objects.filter(
                    sitter=sitter,
                    status__in=['blocked', 'booked'],
                    start_ts__lt=end,
                    end_ts__gt=start
                )
                if blocked_or_booked_slots.exists():
                    raise serializers.ValidationError(
                        "Sitter has blocked time or existing bookings during the requested period."
                    )

                # Check for open slots covering the booking period
                open_slots = AvailabilitySlot.objects.filter(
                    sitter=sitter,
                    status='open',
                    start_ts__lt=end,
                    end_ts__gt=start
                ).order_by('start_ts')

                if not open_slots.exists():
                    raise serializers.ValidationError(
                        "Sitter has no available time slots for the requested period."
                    )

                earliest_slot_start = min(slot.start_ts for slot in open_slots)
                latest_slot_end = max(slot.end_ts for slot in open_slots)
                
                if earliest_slot_start > start or latest_slot_end < end:
                    raise serializers.ValidationError(
                        "Sitter's available time slots don't fully cover the requested booking period."
                    )

                # Check overlapping bookings
                overlapping = Booking.objects.filter(
                    sitter=sitter,
                    status__in=["requested", "confirmed"],
                    start_ts__lt=end,
                    end_ts__gt=start
                )
                if self.instance:
                    overlapping = overlapping.exclude(pk=self.instance.pk)

                if overlapping.exists():
                    raise serializers.ValidationError(
                        "Sitter already has a booking during this time."
                    )

        return attrs

    # Create booking and assign pets
    def create(self, validated_data):
        user = self.context["request"].user
        try:
            owner_profile = user.owner_profile
        except AttributeError:
            raise ValidationError("Authenticated user must have an owner profile.")
        
        pets = validated_data.pop('pets')
        validated_data["owner"] = owner_profile
        booking = super().create(validated_data)
        booking.pets.set(pets)
        
        return booking
    
    # Update booking and handle pets assignment
    def update(self, instance, validated_data):
        pets = validated_data.pop('pets', None)
        booking = super().update(instance, validated_data)
        
        if pets is not None:
            booking.pets.set(pets)
        
        return booking
