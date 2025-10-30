from django.contrib import admin
from .models import AvailabilitySlot

@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = ['id', 'sitter', 'start_ts', 'end_ts', 'status']  # Removed 'is_recurring'
    list_filter = ['status']
    search_fields = ['sitter__display_name']
    ordering = ['-start_ts']