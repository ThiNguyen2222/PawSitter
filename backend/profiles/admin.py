from django.contrib import admin
from .models import Tag, Specialty, SitterProfile, OwnerProfile, Pet

@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name",)

# Optional — register other models for convenience
admin.site.register(SitterProfile)
admin.site.register(OwnerProfile)
admin.site.register(Pet)
