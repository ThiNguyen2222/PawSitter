from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import MessageThread, Message
from .serializers import MessageThreadSerializer, MessageSerializer
from .permissions import IsThreadParticipant

class ThreadListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/messaging/threads/     -> list user's threads
    POST /api/messaging/threads/     -> create a thread
    """
    serializer_class = MessageThreadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        return MessageThread.objects.filter(user_a=u).union(
            MessageThread.objects.filter(user_b=u)
        ).order_by("-created_at")

    def perform_create(self, serializer):
        # ensure the requester is one of the participants
        user = self.request.user
        user_a = serializer.validated_data.get("user_a")
        user_b = serializer.validated_data.get("user_b")
        if user not in (user_a, user_b):
            raise PermissionError("You must be a participant of the thread you create.")
        serializer.save()


class ThreadMessagesListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/messaging/threads/<id>/messages/ -> list messages in a thread
    POST /api/messaging/threads/<id>/messages/ -> send a message to the thread
    """
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, IsThreadParticipant]

    def get_thread(self):
        thread = get_object_or_404(MessageThread, pk=self.kwargs["pk"])
        # object-level permission check
        for perm in self.permission_classes:
            if hasattr(perm, "has_object_permission"):
                if not perm().has_object_permission(self.request, self, thread):
                    self.permission_denied(self.request, message="Not a thread participant.")
        return thread

    def get_queryset(self):
        thread = self.get_thread()
        return Message.objects.filter(thread=thread).select_related("sender")

    def perform_create(self, serializer):
        thread = self.get_thread()
        serializer.save(thread=thread, sender=self.request.user)

