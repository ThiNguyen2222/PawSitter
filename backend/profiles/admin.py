from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import OwnerProfile, SitterProfile, Pet, Tag, Specialty


# -----------------------------
# Tag & Specialty Admin
# -----------------------------
@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "sitter_count")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("name",)

    def sitter_count(self, obj):
        count = obj.sitters.count()
        if count > 0:
            url = reverse("admin:profiles_sitterprofile_changelist") + f"?tags__id__exact={obj.id}"
            return format_html('<a href="{}">{} sitters</a>', url, count)
        return "0 sitters"
    sitter_count.short_description = "Used by"


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "sitter_count")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("name",)

    def sitter_count(self, obj):
        count = obj.sitters.count()
        if count > 0:
            url = reverse("admin:profiles_sitterprofile_changelist") + f"?specialties__id__exact={obj.id}"
            return format_html('<a href="{}">{} sitters</a>', url, count)
        return "0 sitters"
    sitter_count.short_description = "Used by"


# -----------------------------
# Pet Inline for OwnerProfile
# -----------------------------
class PetInline(admin.TabularInline):
    model = Pet
    extra = 0
    fields = ("name", "species", "breed", "age", "profile_picture_preview", "notes")
    readonly_fields = ("profile_picture_preview",)

    def profile_picture_preview(self, obj):
        if obj.profile_picture:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />', obj.profile_picture.url)
        return "-"
    profile_picture_preview.short_description = "Picture"


# -----------------------------
# OwnerProfile Admin
# -----------------------------
@admin.register(OwnerProfile)
class OwnerProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "user_link", "phone", "default_location", "pet_count", "profile_picture_thumb")
    list_filter = ("user__is_verified",)
    search_fields = ("name", "phone", "user__username", "user__email")
    ordering = ("name",)
    inlines = [PetInline]

    fieldsets = (
        ("User Association", {
            "fields": ("user",)
        }),
        ("Profile Information", {
            "fields": ("name", "phone", "default_location", "notes")
        }),
        ("Images", {
            "fields": ("profile_picture", "profile_picture_preview", "banner_picture", "banner_picture_preview")
        }),
    )

    readonly_fields = ("profile_picture_preview", "banner_picture_preview")

    def user_link(self, obj):
        url = reverse("admin:accounts_user_change", args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = "User"

    def pet_count(self, obj):
        count = obj.pets.count()
        if count > 0:
            return format_html('<strong>{}</strong> pets', count)
        return "0 pets"
    pet_count.short_description = "Pets"

    def profile_picture_thumb(self, obj):
        if obj.profile_picture:
            return format_html('<img src="{}" width="40" height="40" style="object-fit: cover; border-radius: 50%;" />', obj.profile_picture.url)
        return "-"
    profile_picture_thumb.short_description = "Picture"

    def profile_picture_preview(self, obj):
        if obj.profile_picture:
            return format_html('<img src="{}" width="200" style="border-radius: 8px;" />', obj.profile_picture.url)
        return "No profile picture uploaded"
    profile_picture_preview.short_description = "Profile Picture Preview"

    def banner_picture_preview(self, obj):
        if obj.banner_picture:
            return format_html('<img src="{}" width="400" style="border-radius: 8px;" />', obj.banner_picture.url)
        return "No banner picture uploaded"
    banner_picture_preview.short_description = "Banner Picture Preview"


# -----------------------------
# Pet Admin
# -----------------------------
@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ("name", "species", "breed", "age", "owner_link", "profile_picture_thumb")
    list_filter = ("species",)
    search_fields = ("name", "breed", "owner__name", "owner__user__username")
    ordering = ("owner__name", "name")

    fieldsets = (
        ("Owner", {
            "fields": ("owner",)
        }),
        ("Pet Information", {
            "fields": ("name", "species", "breed", "age", "notes")
        }),
        ("Image", {
            "fields": ("profile_picture", "profile_picture_preview")
        }),
    )

    readonly_fields = ("profile_picture_preview",)

    def owner_link(self, obj):
        url = reverse("admin:profiles_ownerprofile_change", args=[obj.owner.id])
        return format_html('<a href="{}">{}</a>', url, obj.owner.name)
    owner_link.short_description = "Owner"

    def profile_picture_thumb(self, obj):
        if obj.profile_picture:
            return format_html('<img src="{}" width="40" height="40" style="object-fit: cover; border-radius: 50%;" />', obj.profile_picture.url)
        return "-"
    profile_picture_thumb.short_description = "Picture"

    def profile_picture_preview(self, obj):
        if obj.profile_picture:
            return format_html('<img src="{}" width="200" style="border-radius: 8px;" />', obj.profile_picture.url)
        return "No profile picture uploaded"
    profile_picture_preview.short_description = "Profile Picture Preview"


# -----------------------------
# SitterProfile Admin
# -----------------------------
@admin.register(SitterProfile)
class SitterProfileAdmin(admin.ModelAdmin):
    list_display = ("display_name", "user_link", "rate_hourly", "avg_rating", "verification_status", "home_zip", "profile_picture_thumb")
    list_filter = ("verification_status", "user__is_verified", "tags", "specialties")
    search_fields = ("display_name", "user__username", "user__email", "home_zip")
    ordering = ("-avg_rating", "display_name")
    filter_horizontal = ("tags", "specialties")

    fieldsets = (
        ("User Association", {
            "fields": ("user",)
        }),
        ("Profile Information", {
            "fields": ("display_name", "bio")
        }),
        ("Service Details", {
            "fields": ("rate_hourly", "service_radius_km", "home_zip")
        }),
        ("Rating & Verification", {
            "fields": ("avg_rating", "verification_status")
        }),
        ("Tags & Specialties", {
            "fields": ("tags", "specialties")
        }),
        ("Images", {
            "fields": ("profile_picture", "profile_picture_preview", "banner_picture", "banner_picture_preview")
        }),
    )

    readonly_fields = ("avg_rating", "profile_picture_preview", "banner_picture_preview")

    def user_link(self, obj):
        url = reverse("admin:accounts_user_change", args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = "User"

    def profile_picture_thumb(self, obj):
        if obj.profile_picture:
            return format_html('<img src="{}" width="40" height="40" style="object-fit: cover; border-radius: 50%;" />', obj.profile_picture.url)
        return "-"
    profile_picture_thumb.short_description = "Picture"

    def profile_picture_preview(self, obj):
        if obj.profile_picture:
            return format_html('<img src="{}" width="200" style="border-radius: 8px;" />', obj.profile_picture.url)
        return "No profile picture uploaded"
    profile_picture_preview.short_description = "Profile Picture Preview"

    def banner_picture_preview(self, obj):
        if obj.banner_picture:
            return format_html('<img src="{}" width="400" style="border-radius: 8px;" />', obj.banner_picture.url)
        return "No banner picture uploaded"
    banner_picture_preview.short_description = "Banner Picture Preview"

    actions = ["mark_verified", "mark_pending"]

    def mark_verified(self, request, queryset):
        updated = queryset.update(verification_status="VERIFIED")
        self.message_user(request, f"{updated} sitter(s) marked as verified.")
    mark_verified.short_description = "Mark selected sitters as VERIFIED"

    def mark_pending(self, request, queryset):
        updated = queryset.update(verification_status="PENDING")
        self.message_user(request, f"{updated} sitter(s) marked as pending.")
    mark_pending.short_description = "Mark selected sitters as PENDING"