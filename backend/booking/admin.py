@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    # Columns displayed in the list view
    list_display = (
        'id',
        'owner_link',
        'sitter_link',
        'service_type_display',
        'formatted_start',
        'formatted_end',
        'duration',
        'price_quote',
        'status_badge',
        'time_status'
    )
    
    # Filters in the sidebar
    list_filter = (
        'status',
        'service_type',
        'created_at',
        'start_ts',
        ('owner', admin.RelatedOnlyFieldListFilter),
        ('sitter', admin.RelatedOnlyFieldListFilter)
    )
    
    # Searchable fields
    search_fields = (
        'owner__name',
        'owner__user__username',
        'sitter__display_name',
        'sitter__user__username',
        'id'
    )
    
    # Default ordering
    ordering = ['-created_at']
    date_hierarchy = 'start_ts'  # Adds a date drill-down navigation

    # Fieldsets for the edit page
    fieldsets = (
        ('Booking Details', {
            'fields': ('owner', 'sitter', 'service_type', 'status')
        }),
        ('Schedule', {
            'fields': ('start_ts', 'end_ts', 'duration_display')
        }),
        ('Pricing', {
            'fields': ('price_quote', 'hourly_rate_display')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    # Fields that are read-only in the admin
    readonly_fields = ('created_at', 'updated_at', 'duration_display', 'hourly_rate_display')
    
    # Custom actions
    actions = ['mark_confirmed', 'mark_completed', 'mark_canceled']

    # ---------- List Display Methods ----------
    
    # Owner column with clickable link to OwnerProfile admin
    def owner_link(self, obj):
        url = reverse("admin:profiles_ownerprofile_change", args=[obj.owner.id])
        return format_html('<a href="{}">{}</a>', url, obj.owner.name)
    owner_link.short_description = "Owner"
    owner_link.admin_order_field = "owner__name"

    # Sitter column with clickable link to SitterProfile admin
    def sitter_link(self, obj):
        url = reverse("admin:profiles_sitterprofile_change", args=[obj.sitter.id])
        return format_html('<a href="{}">{}</a>', url, obj.sitter.display_name)
    sitter_link.short_description = "Sitter"
    sitter_link.admin_order_field = "sitter__display_name"

    # Display service type with an emoji icon
    def service_type_display(self, obj):
        icons = {
            'house_sitting': '🏠',
            'pet_boarding': '🏨',
            'in_home_visit': '🚪',
            'pet_grooming': '✂️',
            'pet_walking': '🚶'
        }
        icon = icons.get(obj.service_type, '📋')
        return format_html('{} {}', icon, obj.get_service_type_display())
    service_type_display.short_description = "Service"
    service_type_display.admin_order_field = "service_type"

    # Formatted start time
    def formatted_start(self, obj):
        return obj.start_ts.strftime('%b %d, %Y %I:%M %p')
    formatted_start.short_description = "Start"
    formatted_start.admin_order_field = "start_ts"

    # Formatted end time
    def formatted_end(self, obj):
        return obj.end_ts.strftime('%b %d, %Y %I:%M %p')
    formatted_end.short_description = "End"
    formatted_end.admin_order_field = "end_ts"

    # Duration in human-readable format
    def duration(self, obj):
        delta = obj.end_ts - obj.start_ts
        hours = delta.total_seconds() / 3600
        if hours < 1:
            minutes = delta.total_seconds() / 60
            return f"{int(minutes)} min"
        elif hours < 24:
            return f"{hours:.1f} hrs"
        else:
            days = hours / 24
            return f"{days:.1f} days"
    duration.short_description = "Duration"

    # Detailed duration display for edit page
    def duration_display(self, obj):
        if obj.pk:
            delta = obj.end_ts - obj.start_ts
            hours = delta.total_seconds() / 3600
            days = hours / 24
            if days >= 1:
                return f"{hours:.2f} hours ({days:.2f} days)"
            return f"{hours:.2f} hours"
        return "-"
    duration_display.short_description = "Duration"

    # Show effective hourly rate
    def hourly_rate_display(self, obj):
        if obj.pk:
            delta = obj.end_ts - obj.start_ts
            hours = Decimal(str(delta.total_seconds() / 3600))
            if hours > 0:
                rate = obj.price_quote / hours
                return f"${rate:.2f}/hr"
        return "-"
    hourly_rate_display.short_description = "Effective Hourly Rate"

    # Display status with colored badge
    def status_badge(self, obj):
        colors = {
            'requested': '#ffc107',   # yellow
            'confirmed': '#007bff',   # blue
            'completed': '#28a745',   # green
            'canceled': '#dc3545'     # red
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold; text-transform: uppercase;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Status"
    status_badge.admin_order_field = "status"

    # Show if booking is past, active, or upcoming
    def time_status(self, obj):
        now = timezone.now()
        if obj.end_ts < now:
            return format_html('<span style="color: #6c757d;">✓ Past</span>')
        elif obj.start_ts <= now <= obj.end_ts:
            return format_html('<span style="color: #ffc107; font-weight: bold;">● Active</span>')
        else:
            days_until = (obj.start_ts.date() - now.date()).days
            if days_until == 0:
                return format_html('<span style="color: #007bff; font-weight: bold;">→ Today</span>')
            elif days_until == 1:
                return format_html('<span style="color: #28a745;">→ Tomorrow</span>')
            else:
                return format_html('<span style="color: #28a745;">→ In {} days</span>', days_until)
    time_status.short_description = "Time"
    time_status.admin_order_field = "start_ts"

    # ---------- Admin Actions ----------
    
    # Mark selected bookings as confirmed
    def mark_confirmed(self, request, queryset):
        updated = queryset.filter(status='requested').update(status='confirmed')
        self.message_user(request, f"{updated} booking(s) marked as confirmed.")
    mark_confirmed.short_description = "Mark selected bookings as CONFIRMED"

    # Mark selected bookings as completed
    def mark_completed(self, request, queryset):
        updated = queryset.filter(status='confirmed').update(status='completed')
        self.message_user(request, f"{updated} booking(s) marked as completed.")
    mark_completed.short_description = "Mark selected bookings as COMPLETED"

    # Mark selected bookings as canceled
    def mark_canceled(self, request, queryset):
        updated = queryset.exclude(status__in=['completed', 'canceled']).update(status='canceled')
        self.message_user(request, f"{updated} booking(s) marked as canceled.")
    mark_canceled.short_description = "Mark selected bookings as CANCELED"

    # Optimize queryset for performance (reduce DB queries)
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('owner', 'owner__user', 'sitter', 'sitter__user')

    # Pagination
    list_per_page = 25
