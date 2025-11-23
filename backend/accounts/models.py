from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Define user roles for the system
    ROLE_CHOICES = (
        ("OWNER", "Owner"),
        ("SITTER", "Sitter"),
    )

    role = models.CharField(
        max_length=10, choices=ROLE_CHOICES, default="OWNER"
    )
    # Track if the user has been verified
    is_verified = models.BooleanField(default=True)

    def __str__(self):
        # Return a readable representation of the user
        return f"{self.username} ({self.role})"
