from rest_framework import serializers
from .models import MessageThread, Message

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "thread", "sender", "body", "created_at", "read_at"]
        read_only_fields = ["id", "sender", "created_at", "read_at", "thread"]


class MessageThreadSerializer(serializers.ModelSerializer):
    # helpful extras for UI
    last_message = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()

    class Meta:
        model = MessageThread
        fields = ["id", "booking", "user_a", "user_b", "participants", "created_at", "last_message"]
        read_only_fields = ["id", "created_at"]

    def get_last_message(self, obj):
        m = obj.messages.order_by("-created_at").first()
        if not m:
            return None
        return {"id": m.id, "body": m.body, "created_at": m.created_at}

    def get_participants(self, obj):
        # adjust if you want emails/usernames instead of __str__
        return [str(obj.user_a), str(obj.user_b)]

    def validate(self, attrs):
        # ensure two distinct users in a thread
        if attrs.get("user_a") == attrs.get("user_b"):
            raise serializers.ValidationError("A thread requires two distinct users.")
        return attrs