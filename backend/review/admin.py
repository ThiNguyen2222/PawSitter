from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Avg
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'rating_stars',
        'sitter_link',
        'owner_link',
        'booking_link',
        'created_display',
        'comment_preview'
    )
    
    list_filter = (
        'rating',
        'created_at',
        ('sitter', admin.RelatedOnlyFieldListFilter),
        ('owner', admin.RelatedOnlyFieldListFilter)
    )
    
    search_fields = (
        'sitter__display_name',
        'sitter__user__username',
        'owner__name',
        'owner__user__username',
        'comment',
        'booking__id'
    )
    
    readonly_fields = (
        'created_at',
        'booking_details',
        'sitter_rating_impact'
    )
    
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Review Details', {
            'fields': ('booking', 'owner', 'sitter')
        }),
        ('Rating & Comment', {
            'fields': ('rating', 'comment')
        }),
        ('Booking Information', {
            'fields': ('booking_details',),
            'classes': ('collapse',)
        }),
        ('Impact', {
            'fields': ('sitter_rating_impact',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['recalculate_sitter_ratings']

    def rating_stars(self, obj):
        """Display rating as stars with color"""
        stars = '⭐' * obj.rating
        colors = {
            5: '#28a745',  # green
            4: '#5cb85c',  # light green
            3: '#ffc107',  # yellow
            2: '#fd7e14',  # orange
            1: '#dc3545'   # red
        }
        color = colors.get(obj.rating, '#6c757d')
        return format_html(
            '<span style="color: {}; font-size: 16px;">{}</span> <strong style="color: {};">{}/5</strong>',
            color, stars, color, obj.rating
        )
    rating_stars.short_description = "Rating"
    rating_stars.admin_order_field = "rating"

    def sitter_link(self, obj):
        url = reverse("admin:profiles_sitterprofile_change", args=[obj.sitter.id])
        avg = obj.sitter.reviews.aggregate(avg=Avg('rating'))['avg'] or 0
        avg_rounded = round(avg, 1)
        return format_html(
            '<a href="{}">{}</a><br><small style="color: #6c757d;">Avg: {} ⭐</small>',
            url, obj.sitter.display_name, avg_rounded
        )
    sitter_link.short_description = "Sitter"
    sitter_link.admin_order_field = "sitter__display_name"

    def owner_link(self, obj):
        url = reverse("admin:profiles_ownerprofile_change", args=[obj.owner.id])
        review_count = obj.owner.reviews.count()
        return format_html(
            '<a href="{}">{}</a><br><small style="color: #6c757d;">{} reviews</small>',
            url, obj.owner.name, review_count
        )
    owner_link.short_description = "Owner"
    owner_link.admin_order_field = "owner__name"

    def booking_link(self, obj):
        url = reverse("admin:booking_booking_change", args=[obj.booking.id])
        return format_html(
            '<a href="{}">Booking #{}</a><br><small style="color: #6c757d;">{}</small>',
            url, obj.booking.id, obj.booking.get_service_type_display()
        )
    booking_link.short_description = "Booking"
    booking_link.admin_order_field = "booking__id"

    def created_display(self, obj):
        return obj.created_at.strftime('%b %d, %Y %I:%M %p')
    created_display.short_description = "Created"
    created_display.admin_order_field = "created_at"

    def comment_preview(self, obj):
        if obj.comment:
            preview = obj.comment[:60]
            if len(obj.comment) > 60:
                preview += "..."
            return format_html('<span style="color: #495057;">{}</span>', preview)
        return format_html('<span style="color: #adb5bd; font-style: italic;">No comment</span>')
    comment_preview.short_description = "Comment"

    def booking_details(self, obj):
        """Show detailed booking info in the review detail page"""
        booking = obj.booking
        return format_html(
            '<div style="padding: 10px; background: #f8f9fa; border-radius: 4px;">'
            '<p><strong>Service:</strong> {}</p>'
            '<p><strong>Start:</strong> {}</p>'
            '<p><strong>End:</strong> {}</p>'
            '<p><strong>Price:</strong> ${}</p>'
            '<p><strong>Status:</strong> {}</p>'
            '</div>',
            booking.get_service_type_display(),
            booking.start_ts.strftime('%b %d, %Y %I:%M %p'),
            booking.end_ts.strftime('%b %d, %Y %I:%M %p'),
            booking.price_quote,
            booking.get_status_display()
        )
    booking_details.short_description = "Booking Details"

    def sitter_rating_impact(self, obj):
        """Show how this review impacts the sitter's average rating"""
        reviews = obj.sitter.reviews.all()
        total_reviews = reviews.count()
        avg_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 0
        
        if total_reviews > 1:
            other_reviews = reviews.exclude(pk=obj.pk)
            avg_without = other_reviews.aggregate(avg=Avg('rating'))['avg'] or 0
            impact = avg_rating - avg_without
            impact_color = '#28a745' if impact >= 0 else '#dc3545'
            impact_sign = '+' if impact >= 0 else ''
        else:
            avg_without = 0
            impact = avg_rating
            impact_color = '#007bff'
            impact_sign = ''
        
        return format_html(
            '<div style="padding: 10px; background: #f8f9fa; border-radius: 4px;">'
            '<p><strong>Total Reviews:</strong> {}</p>'
            '<p><strong>Current Average:</strong> {:.2f} ⭐</p>'
            '<p><strong>Without This Review:</strong> {:.2f} ⭐</p>'
            '<p><strong>Impact:</strong> <span style="color: {}; font-weight: bold;">{}{:.2f}</span></p>'
            '</div>',
            total_reviews,
            avg_rating,
            avg_without,
            impact_color,
            impact_sign,
            impact
        )
    sitter_rating_impact.short_description = "Rating Impact"

    def recalculate_sitter_ratings(self, request, queryset):
        """Recalculate average ratings for all affected sitters"""
        sitters = set(review.sitter for review in queryset)
        updated_count = 0
        
        for sitter in sitters:
            avg = sitter.reviews.aggregate(avg=Avg('rating'))['avg'] or 0.0
            sitter.avg_rating = round(avg, 1)
            sitter.save()
            updated_count += 1
        
        self.message_user(
            request,
            "Recalculated ratings for {} sitter(s).".format(updated_count)
        )
    recalculate_sitter_ratings.short_description = "Recalculate sitter ratings from selected reviews"

    def get_queryset(self, request):
        # Optimize queries
        qs = super().get_queryset(request)
        return qs.select_related(
            'booking',
            'owner',
            'owner__user',
            'sitter',
            'sitter__user'
        ).prefetch_related('sitter__reviews')

    list_per_page = 25

    def save_model(self, request, obj, form, change):
        """After saving, update the sitter's average rating"""
        super().save_model(request, obj, form, change)
        
        avg = obj.sitter.reviews.aggregate(avg=Avg('rating'))['avg'] or 0.0
        obj.sitter.avg_rating = round(avg, 1)
        obj.sitter.save()
        
        avg_display = round(avg, 1)
        self.message_user(
            request,
            "Review saved. {}'s average rating updated to {} ⭐".format(
                obj.sitter.display_name, avg_display
            )
        )

    def delete_model(self, request, obj):
        """After deleting, update the sitter's average rating"""
        sitter = obj.sitter
        super().delete_model(request, obj)
        
        avg = sitter.reviews.aggregate(avg=Avg('rating'))['avg'] or 0.0
        sitter.avg_rating = round(avg, 1)
        sitter.save()
        
        avg_display = round(avg, 1)
        self.message_user(
            request,
            "Review deleted. {}'s average rating updated to {} ⭐".format(
                sitter.display_name, avg_display
            )
        )