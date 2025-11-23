from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]

    def validate_role(self, value):
        v = str(value).strip().upper()
        if v not in {"SITTER", "OWNER"}:
            raise serializers.ValidationError("Invalid role. Must be 'SITTER' or 'OWNER'.")
        return v

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data["role"],
        )
        return user


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True, 
        write_only=True,
        validators=[validate_password]
    )

    def validate_current_password(self, value):
        """Verify that the current password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value

    def validate(self, attrs):
        """Ensure new password is different from current password"""
        if attrs['current_password'] == attrs['new_password']:
            raise serializers.ValidationError({
                "new_password": "New password must be different from current password"
            })
        return attrs

    def save(self):
        """Update the user's password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user