from django.shortcuts import render, get_object_or_404
from django.db.models import Prefetch, Q
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import api_view, permission_classes

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
        # FIXED: Use Q() instead of union(), and add prefetch to avoid N+1
        u = self.request.user
        
        # Prefetch only the last message
        last_message_prefetch = Prefetch(
            'messages',
            queryset=Message.objects.select_related('sender').order_by('-created_at')[:1],
            to_attr='last_message_cached'
        )
        
        return MessageThread.objects.filter(
            Q(user_a=u) | Q(user_b=u)
        ).select_related(
            'user_a', 'user_b', 'booking'
        ).prefetch_related(
            last_message_prefetch
        ).order_by("-created_at")

    def perform_create(self, serializer):
        # ensure the requester is one of the participants
        user = self.request.user
        user_a = serializer.validated_data.get("user_a")
        user_b = serializer.validated_data.get("user_b")
        if user not in (user_a, user_b):
            raise PermissionDenied("You must be a participant of the thread you create.")
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_thread_as_read(request, pk):
    """Mark all unread messages in a thread as read for the current user"""
    thread = get_object_or_404(MessageThread, pk=pk)
    
    # Check permission: user must be a participant
    if request.user not in [thread.user_a, thread.user_b]:
        raise PermissionDenied("You are not a participant in this thread.")
    
    # Mark all unread messages (not sent by current user) as read
    updated = thread.messages.filter(
        read_at__isnull=True
    ).exclude(
        sender=request.user
    ).update(read_at=timezone.now())
    
    return Response({
        'status': 'success',
        'messages_marked_read': updated
    })