from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import AvailabilitySlot


@admin.register(AvailabilitySlot)
class AvailabilitySlotAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'sitter_link', 
        'formatted_start', 
        'formatted_end', 
        'duration', 
        'status_badge',
        'is_past'
    )
    list_filter = (
        'status', 
        'start_ts',
        ('sitter', admin.RelatedOnlyFieldListFilter)
    )
    search_fields = (
        'sitter__display_name', 
        'sitter__user__username',
        'sitter__user__email'
    )
    ordering = ['-start_ts']
    date_hierarchy = 'start_ts'
    
    fieldsets = (
        ('Sitter', {
            'fields': ('sitter',)
        }),
        ('Time Slot', {
            'fields': ('start_ts', 'end_ts', 'duration_display')
        }),
        ('Status', {
            'fields': ('status',)
        }),
    )
    
    readonly_fields = ('duration_display',)
    
    actions = ['mark_open', 'mark_blocked', 'mark_booked']

    def sitter_link(self, obj):
        url = reverse("admin:profiles_sitterprofile_change", args=[obj.sitter.id])
        return format_html('<a href="{}">{}</a>', url, obj.sitter.display_name)
    sitter_link.short_description = "Sitter"
    sitter_link.admin_order_field = "sitter__display_name"

    def formatted_start(self, obj):
        return obj.start_ts.strftime('%b %d, %Y %I:%M %p')
    formatted_start.short_description = "Start"
    formatted_start.admin_order_field = "start_ts"

    def formatted_end(self, obj):
        return obj.end_ts.strftime('%b %d, %Y %I:%M %p')
    formatted_end.short_description = "End"
    formatted_end.admin_order_field = "end_ts"

    def duration(self, obj):
        delta = obj.end_ts - obj.start_ts
        hours = delta.total_seconds() / 3600
        if hours < 1:
            minutes = delta.total_seconds() / 60
            return f"{int(minutes)} min"
        return f"{hours:.1f} hrs"
    duration.short_description = "Duration"

    def duration_display(self, obj):
        if obj.pk:
            delta = obj.end_ts - obj.start_ts
            hours = delta.total_seconds() / 3600
            return f"{hours:.2f} hours"
        return "-"
    duration_display.short_description = "Duration"

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

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('sitter', 'sitter__user')