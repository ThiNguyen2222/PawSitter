from django.urls import path
from .views import RegisterView, login_view
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", login_view, name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
]