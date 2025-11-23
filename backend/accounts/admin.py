from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    # Fields to display in the user list
    list_display = ("username", "email", "role", "is_verified", "is_active", "is_staff")
    
    # Filters available in the admin sidebar
    list_filter  = ("role", "is_verified", "is_staff", "is_superuser", "is_active", "groups")
    
    # Fields to search by in admin
    search_fields = ("username", "email", "first_name", "last_name")
    
    # Default ordering of users
    ordering = ("username",)

    # Organize fields in user detail/edit view
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name", "email")}),
        (_("PawSitter"), {"fields": ("role", "is_verified")}),  # custom fields
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )

    # Fields shown when adding a new user in admin
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "password1", "password2", "role", "is_verified"),
        }),
    )
