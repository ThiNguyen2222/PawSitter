from django.urls import path
from .views import (
    ThreadListCreateView, 
    ThreadMessagesListCreateView,
    mark_thread_as_read  # endpoint to mark all messages in a thread as read
)

urlpatterns = [
    # List all threads for the authenticated user or create a new thread
    # GET  /api/messaging/threads/
    # POST /api/messaging/threads/
    path("threads/", ThreadListCreateView.as_view(), name="thread-list-create"),

    # List messages in a specific thread or send a message to the thread
    # GET  /api/messaging/threads/<id>/messages/
    # POST /api/messaging/threads/<id>/messages/
    path("threads/<int:pk>/messages/", ThreadMessagesListCreateView.as_view(), name="thread-messages"),
    
    # Mark all unread messages in a thread as read for the current user
    # POST /api/messaging/threads/<id>/mark-read/
    path("threads/<int:pk>/mark-read/", mark_thread_as_read, name="thread-mark-read"),
]
