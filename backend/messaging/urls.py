from django.urls import path
from .views import (
    ThreadListCreateView, 
    ThreadMessagesListCreateView,
    mark_thread_as_read  # NEW
)

urlpatterns = [
    # GET /api/messaging/threads  | POST /api/messaging/threads
    path("threads/", ThreadListCreateView.as_view(), name="thread-list-create"),

    # GET /api/messaging/threads/<id>/messages  | POST /api/messaging/threads/<id>/messages
    path("threads/<int:pk>/messages/", ThreadMessagesListCreateView.as_view(), name="thread-messages"),
    
    # NEW: POST /api/messaging/threads/<id>/mark-read
    path("threads/<int:pk>/mark-read/", mark_thread_as_read, name="thread-mark-read"),
]

"""
with nested router: just cleaner, auto-generated nested routes
    router = DefaultRouter()
    router.register(r"threads", ThreadViewSet, basename="thread")

    threads_router = NestedDefaultRouter(router, r"threads", lookup="thread")
    threads_router.register(r"messages", MessageViewSet, basename="thread-messages")

    urlpatterns = router.urls + threads_router.urls
"""