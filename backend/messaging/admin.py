from django.contrib import admin
from django.utils.html import format_html
from .models import MessageThread, Message

@admin.register(MessageThread)
class MessageThreadAdmin(admin.ModelAdmin):
    list_display = ("id", "booking", "user_a", "user_b", "created_at", "message_count")
    list_filter = ("created_at",) 
    search_fields = ("user_a__email", "user_b__email", "booking__id")
    readonly_fields = ("created_at",) 
    
    def message_count(self, obj):
        """Show number of messages in thread"""
        count = obj.messages.count()
        return format_html('<strong>{}</strong>', count)
    message_count.short_description = "Messages"

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "thread", "sender", "body_preview", "created_at", "is_read")
    list_filter = ("created_at", "read_at") 
    search_fields = ("sender__email", "body")
    readonly_fields = ("created_at", "thread", "sender")  
    
    def body_preview(self, obj):
        """Show first 50 characters of message"""
        return obj.body[:50] + "..." if len(obj.body) > 50 else obj.body
    body_preview.short_description = "Message Preview"
    
    def is_read(self, obj):
        """Show read status with colored icon"""
        if obj.read_at:
            return format_html('<span style="color: green;">✓ Read</span>')
        return format_html('<span style="color: orange;">⊙ Unread</span>')
    is_read.short_description = "Status"