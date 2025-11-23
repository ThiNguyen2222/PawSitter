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


# List all threads for the authenticated user or create a new thread
class ThreadListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageThreadSerializer
    permission_classes = [IsAuthenticated]

    # Get threads for the current user
    def get_queryset(self):
        u = self.request.user
        
        # Prefetch only the last message to avoid N+1 queries
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

    # Ensure requester is one of the participants when creating a thread
    def perform_create(self, serializer):
        user = self.request.user
        user_a = serializer.validated_data.get("user_a")
        user_b = serializer.validated_data.get("user_b")
        if user not in (user_a, user_b):
            raise PermissionDenied("You must be a participant of the thread you create.")
        serializer.save()


# List messages in a thread or send a message to the thread
class ThreadMessagesListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, IsThreadParticipant]

    # Retrieve the thread and check object-level permissions
    def get_thread(self):
        thread = get_object_or_404(MessageThread, pk=self.kwargs["pk"])
        for perm in self.permission_classes:
            if hasattr(perm, "has_object_permission"):
                if not perm().has_object_permission(self.request, self, thread):
                    self.permission_denied(self.request, message="Not a thread participant.")
        return thread

    # Return messages for the thread
    def get_queryset(self):
        thread = self.get_thread()
        return Message.objects.filter(thread=thread).select_related("sender")

    # Assign sender and thread when creating a new message
    def perform_create(self, serializer):
        thread = self.get_thread()
        serializer.save(thread=thread, sender=self.request.user)


# Mark all unread messages in a thread as read for the current user
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_thread_as_read(request, pk):
    thread = get_object_or_404(MessageThread, pk=pk)
    
    # Check that the user is a participant
    if request.user not in [thread.user_a, thread.user_b]:
        raise PermissionDenied("You are not a participant in this thread.")
    
    # Update unread messages not sent by the current user
    updated = thread.messages.filter(
        read_at__isnull=True
    ).exclude(
        sender=request.user
    ).update(read_at=timezone.now())
    
    return Response({
        'status': 'success',
        'messages_marked_read': updated
    })
