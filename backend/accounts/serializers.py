from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User
from profiles.models import OwnerProfile, SitterProfile

class RegisterSerializer(serializers.ModelSerializer):
    # Password is write-only and validated using Django's validators
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]

    # Ensure role is either SITTER or OWNER
    def validate_role(self, value):
        v = str(value).strip().upper()
        if v not in {"SITTER", "OWNER"}:
            raise serializers.ValidationError("Invalid role. Must be 'SITTER' or 'OWNER'.")
        return v

    # Create a new user and corresponding profile based on role
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data["role"],
        )

        if user.role == "OWNER":
            OwnerProfile.objects.create(user=user)
        elif user.role == "SITTER":
            SitterProfile.objects.create(user=user)

        return user


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True, 
        write_only=True,
        validators=[validate_password]
    )

    # Verify that the current password is correct
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value

    # Ensure new password is different from current password
    def validate(self, attrs):
        if attrs['current_password'] == attrs['new_password']:
            raise serializers.ValidationError({
                "new_password": "New password must be different from current password"
            })
        return attrs

    # Update the user's password
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
