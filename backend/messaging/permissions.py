from rest_framework.permissions import BasePermission

class IsThreadParticipant(BasePermission):
    """
    Custom permission: only allow thread participants (user_a or user_b)
    to view or send messages within that thread.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        # obj can be thread or message
        thread = obj if hasattr(obj, "user_a") else obj.thread
        return user == thread.user_a or user == thread.user_b
