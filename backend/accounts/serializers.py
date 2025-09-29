from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]

    def validate_role(self, value):
        # Normalize to your model’s stored values "SITTER"/"OWNER"
        v = str(value).strip().upper()
        if v not in {"SITTER", "OWNER"}:  # adjust to match your model’s choices
            raise serializers.ValidationError("Invalid role.")
        return v

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data["role"],
        )
        return user
