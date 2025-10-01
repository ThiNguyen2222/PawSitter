from django.contrib import admin
from .models import AvailabilitySlot

@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = ('sitter', 'start_ts', 'end_ts', 'status', 'is_recurring')
    list_filter  = ('status', 'is_recurring')
    search_fields = ('sitter__display_name',)
