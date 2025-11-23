from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import User
from .serializers import RegisterSerializer, ChangePasswordSerializer


class RegisterView(generics.CreateAPIView):
    # API endpoint for user registration
    # Allows anyone to create a new account (OWNER or SITTER)
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    # API endpoint for user login
    # Authenticates user and returns an auth token
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Authenticate user with username and password
    user = authenticate(username=username, password=password)
    
    if user is not None:
        # Create or get existing token for the user
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
            }
        })
    
    # Invalid credentials
    return Response({'error': 'Invalid credentials'}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    # API endpoint for changing user password
    # Requires authentication and validates current password
    serializer = ChangePasswordSerializer(
        data=request.data,
        context={'request': request}  # Pass request for access to request.user
    )
    
    if serializer.is_valid():
        # Save the new password (hashed automatically)
        serializer.save()
        return Response({
            'message': 'Password changed successfully'
        }, status=200)
    
    # Return validation errors if any
    return Response(serializer.errors, status=400)
