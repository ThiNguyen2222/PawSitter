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
