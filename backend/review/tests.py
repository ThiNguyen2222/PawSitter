from django.test import TestCase
from django.utils import timezone
from decimal import Decimal
from django.core.exceptions import ValidationError

from accounts.models import User
from profiles.models import OwnerProfile, SitterProfile
from booking.models import Booking
from review.models import Review

class ReviewSerializerTestCase(TestCase):
    def setUp(self):
        # Create users
        self.owner_user = User.objects.create_user(
            username="owner1", password="pass123", role="OWNER"
        )
        self.sitter_user = User.objects.create_user(
            username="sitter1", password="pass123", role="SITTER"
        )

        # Create profiles
        self.owner = OwnerProfile.objects.create(
            user=self.owner_user,
            name="Owner One",
            phone="123456"
        )
        self.sitter = SitterProfile.objects.create(
            user=self.sitter_user,
            display_name="Sitter One",
            rate_hourly=Decimal("20.00"),
            home_zip="12345"
        )

        # Create a completed booking
        self.booking = Booking.objects.create(
            owner=self.owner,
            sitter=self.sitter,
            start_ts=timezone.now(),
            end_ts=timezone.now() + timezone.timedelta(hours=1),
            price_quote=Decimal("25.00"),
            status="completed"
        )

    def test_review_creation_valid(self):
        """Valid review should succeed and update sitter avg_rating"""
        review = Review.objects.create(
            booking=self.booking,
            owner=self.owner,
            sitter=self.sitter,
            rating=5,
            comment="Great sitter!"
        )
        self.sitter.refresh_from_db()
        self.assertEqual(self.sitter.avg_rating, 5.0)
        self.assertEqual(review.rating, 5)

    def test_review_duplicate(self):
        """Cannot create duplicate review for same booking"""
        Review.objects.create(
            booking=self.booking,
            owner=self.owner,
            sitter=self.sitter,
            rating=4
        )
        with self.assertRaises(ValidationError):
            Review.objects.create(
                booking=self.booking,
                owner=self.owner,
                sitter=self.sitter,
                rating=5
            )

    def test_avg_rating_updates_on_update_and_delete(self):
        """Avg rating recalculates on review update and delete"""
        r1 = Review.objects.create(
            booking=self.booking,
            owner=self.owner,
            sitter=self.sitter,
            rating=4
        )

        # Create a second booking for same sitter
        second_booking = Booking.objects.create(
            owner=self.owner,
            sitter=self.sitter,
            start_ts=timezone.now() + timezone.timedelta(days=1),
            end_ts=timezone.now() + timezone.timedelta(days=1, hours=1),
            price_quote=Decimal("30.00"),
            status="completed"
        )

        r2 = Review.objects.create(
            booking=second_booking,
            owner=self.owner,
            sitter=self.sitter,
            rating=2
        )

        self.sitter.refresh_from_db()
        self.assertEqual(self.sitter.avg_rating, 3.0)

        r2.rating = 4
        r2.save()
        self.sitter.refresh_from_db()
        self.assertEqual(self.sitter.avg_rating, 4.0)

        r1.delete()
        self.sitter.refresh_from_db()
        self.assertEqual(self.sitter.avg_rating, 4.0)

    def test_review_invalid_booking_owner(self):
        """Cannot review a booking that does not belong to the owner"""
        another_owner_user = User.objects.create_user(
            username="owner2", password="pass123", role="OWNER"
        )
        another_owner = OwnerProfile.objects.create(
            user=another_owner_user,
            name="Owner Two",
            phone="654321"
        )
        with self.assertRaises(ValidationError):
            Review.objects.create(
                booking=self.booking,
                owner=another_owner,
                sitter=self.sitter,
                rating=5
            )

    def test_review_invalid_booking_status(self):
        """Cannot review a booking that is not completed"""
        pending_booking = Booking.objects.create(
            owner=self.owner,
            sitter=self.sitter,
            start_ts=timezone.now(),
            end_ts=timezone.now() + timezone.timedelta(hours=1),
            price_quote=Decimal("20.00"),
            status="requested"
        )
        with self.assertRaises(ValidationError):
            Review.objects.create(
                booking=pending_booking,
                owner=self.owner,
                sitter=self.sitter,
                rating=5
            )

    def test_review_rating_bounds(self):
        """Rating must be between 1 and 5"""
        with self.assertRaises(ValidationError):
            Review.objects.create(
                booking=self.booking,
                owner=self.owner,
                sitter=self.sitter,
                rating=0 
            )

        with self.assertRaises(ValidationError):
            Review.objects.create(
                booking=self.booking,
                owner=self.owner,
                sitter=self.sitter,
                rating=6
            )
