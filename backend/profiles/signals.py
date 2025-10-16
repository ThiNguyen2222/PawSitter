from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg

from .models import Review, SitterProfile

@receiver([post_save, post_delete], sender=Review)
def update_sitter_avg_rating(sender, instance, **kwargs):
    """
    Update the sitter's avg_rating whenever a review is created, updated, or deleted.
    """
    sitter = instance.sitter
    avg = sitter.reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    sitter.avg_rating = round(avg, 2)
    sitter.save(update_fields=['avg_rating'])
