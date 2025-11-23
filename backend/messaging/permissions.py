from rest_framework.permissions import BasePermission

# Custom permission: only allow participants of a thread to access it
class IsThreadParticipant(BasePermission):

    # Check if the request user is allowed to access the object
    def has_object_permission(self, request, view, obj):
        user = request.user  # current authenticated user

        # Determine the thread object: obj is thread if it has user_a, else it's a message
        thread = obj if hasattr(obj, "user_a") else obj.thread

        # Allow access only if user is one of the participants
        return user == thread.user_a or user == thread.user_b
