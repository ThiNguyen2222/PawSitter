from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import AvailabilitySlot


@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    # Fields to display in the list view
    list_display = (
        'id', 
        'sitter_link', 
        'formatted_start', 
        'formatted_end', 
        'duration', 
        'status_badge',
        'is_past'
    )
    
    # Filters available in the list view
    list_filter = (
        'status', 
        'start_ts',
        ('sitter', admin.RelatedOnlyFieldListFilter)
    )
    
    # Searchable fields
    search_fields = (
        'sitter__display_name', 
        'sitter__user__username',
        'sitter__user__email'
    )
    
    # Default ordering and date hierarchy
    ordering = ['-start_ts']
    date_hierarchy = 'start_ts'
    
    # Fieldsets for the detail/edit view
    fieldsets = (
        ('Sitter', {'fields': ('sitter',)}),
        ('Time Slot', {'fields': ('start_ts', 'end_ts', 'duration_display')}),
        ('Status', {'fields': ('status',)}),
    )
    
    # Read-only fields
    readonly_fields = ('duration_display',)
    
    # Admin actions
    actions = ['mark_open', 'mark_blocked', 'mark_booked']

    # Link to sitter profile in admin
    def sitter_link(self, obj):
        url = reverse("admin:profiles_sitterprofile_change", args=[obj.sitter.id])
        return format_html('<a href="{}">{}</a>', url, obj.sitter.display_name)
    sitter_link.short_description = "Sitter"
    sitter_link.admin_order_field = "sitter__display_name"

    # Format start timestamp
    def formatted_start(self, obj):
        return obj.start_ts.strftime('%b %d, %Y %I:%M %p')
    formatted_start.short_description = "Start"
    formatted_start.admin_order_field = "start_ts"

    # Format end timestamp
    def formatted_end(self, obj):
        return obj.end_ts.strftime('%b %d, %Y %I:%M %p')
    formatted_end.short_description = "End"
    formatted_end.admin_order_field = "end_ts"

    # Display duration in human-readable form
    def duration(self, obj):
        delta = obj.end_ts - obj.start_ts
        hours = delta.total_seconds() / 3600
        if hours < 1:
            minutes = delta.total_seconds() / 60
            return f"{int(minutes)} min"
        return f"{hours:.1f} hrs"
    duration.short_description = "Duration"

    # Read-only duration display
    def duration_display(self, obj):
        if obj.pk:
            delta = obj.end_ts - obj.start_ts
            hours = delta.total_seconds() / 3600
            return f"{hours:.2f} hours"
        return "-"
    duration_display.short_description = "Duration"

    # Display colored status badges
    def status_badge(self, obj):
        colors = {
            'open': '#28a745',      # green
            'booked': '#007bff',    # blue
            'blocked': '#dc3545'    # red
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Status"
    status_badge.admin_order_field = "status"

    # Display whether the slot is past, current, or future
    def is_past(self, obj):
        now = timezone.now()
        if obj.end_ts < now:
            return format_html('<span style="color: #6c757d;">✓ Past</span>')
        elif obj.start_ts <= now <= obj.end_ts:
            return format_html('<span style="color: #ffc107; font-weight: bold;">● Now</span>')
        else:
            return format_html('<span style="color: #28a745;">→ Future</span>')
    is_past.short_description = "Time"
    is_past.admin_order_field = "start_ts"

    # Admin actions to mark slots as open/blocked/booked
    def mark_open(self, request, queryset):
        updated = queryset.update(status='open')
        self.message_user(request, f"{updated} slot(s) marked as open.")
    mark_open.short_description = "Mark selected slots as OPEN"

    def mark_blocked(self, request, queryset):
        updated = queryset.update(status='blocked')
        self.message_user(request, f"{updated} slot(s) marked as blocked.")
    mark_blocked.short_description = "Mark selected slots as BLOCKED"

    def mark_booked(self, request, queryset):
        updated = queryset.update(status='booked')
        self.message_user(request, f"{updated} slot(s) marked as booked.")
    mark_booked.short_description = "Mark selected slots as BOOKED"

    # Optimize queryset to avoid extra DB queries
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('sitter', 'sitter__user')
