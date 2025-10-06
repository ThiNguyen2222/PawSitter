from django.contrib import admin
from .models import MessageThread, Message

@admin.register(MessageThread)
class MessageThreadAdmin(admin.ModelAdmin):
    list_display = ("id", "booking", "user_a", "user_b", "created_at")
    search_fields = ("user_a__email", "user_b__email")

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "thread", "sender", "created_at")
    search_fields = ("sender__email", "body")
