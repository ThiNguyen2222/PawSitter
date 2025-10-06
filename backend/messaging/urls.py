from django.urls import path
from .views import ThreadListCreateView, ThreadMessagesListCreateView

urlpatterns = [
    # GET /api/messaging/threads  | POST /api/messaging/threads
    path("threads/", ThreadListCreateView.as_view(), name="thread-list-create"),

    # GET /api/messaging/threads/<id>/messages  | POST /api/messaging/threads/<id>/messages
    path("threads/<int:pk>/messages/", ThreadMessagesListCreateView.as_view(), name="thread-messages"),
]

"""
with nested router: just cleaner, auto-generated nested routes
    router = DefaultRouter()
    router.register(r"threads", ThreadViewSet, basename="thread")

    threads_router = NestedDefaultRouter(router, r"threads", lookup="thread")
    threads_router.register(r"messages", MessageViewSet, basename="thread-messages")

    urlpatterns = router.urls + threads_router.urls
"""