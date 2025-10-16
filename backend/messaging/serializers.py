from rest_framework import serializers
from django.db.models import Q
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

    def _normalize_pair(self, a, b):
        return (a, b) if a.id <= b.id else (b, a)

    def validate(self, attrs):
        a = attrs.get("user_a")
        b = attrs.get("user_b")
        # ensure two distinct users in a thread
        if a == b:
            raise serializers.ValidationError("A thread requires two distinct users.")
        
        # normalize order (so uniqueness works consistently)
        a, b = self._normalize_pair(a, b)
        attrs["user_a"], attrs["user_b"] = a, b

        booking = attrs.get("booking")
        # duplicate checks to fail fast with 400 (instead of DB IntegrityError)
        qs = MessageThread.objects.filter(user_a=a, user_b=b)
        if booking is None:
            if qs.filter(booking__isnull=True).exists():
                raise serializers.ValidationError("A thread between these users already exists.")
        else:
            if qs.filter(booking=booking).exists():
                raise serializers.ValidationError("A thread for this booking and user pair already exists.")
            
        return attrs

    def get_last_message(self, obj):
        m = obj.messages.order_by("-created_at").first()
        if not m:
            return None
        return {"id": m.id, "body": m.body, "created_at": m.created_at}

    def get_participants(self, obj):
        # adjust if you want emails/usernames instead of __str__
        return [str(obj.user_a), str(obj.user_b)]

    