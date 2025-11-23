from django.urls import path
from .views import RegisterView, login_view, change_password_view
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # User registration endpoint
    path("register/", RegisterView.as_view(), name="register"),
    
    # User login endpoint - returns auth token
    path("login/", login_view, name="login"),
    
    # Change password endpoint - requires authentication
    path("change-password/", change_password_view, name="change-password"),
    
    # JWT token refresh endpoint (if you're using JWT)
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
]