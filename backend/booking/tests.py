from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta

from accounts.models import User
from profiles.models import OwnerProfile, SitterProfile
from availability.models import AvailabilitySlot
from booking.models import Booking


class BookingTests(TestCase):
    def setUp(self):
        self.owner_user = User.objects.create_user(username="owner1", password="pass", role="OWNER")
        self.owner = OwnerProfile.objects.create(
            user=self.owner_user,
            name="Owner 1",
            phone="123"
        )

        self.sitter_user = User.objects.create_user(username="sitter1", password="pass", role="SITTER")
        self.sitter = SitterProfile.objects.create(
            user=self.sitter_user,
            display_name="Sitter 1",
            rate_hourly=20,
            home_zip="12345"
        )

        self.client = APIClient()
        self.start = timezone.now() + timedelta(days=1)
        self.end = self.start + timedelta(hours=2)
        AvailabilitySlot.objects.create(sitter=self.sitter, start_ts=self.start, end_ts=self.end)

    def test_create_booking_success(self):
        self.client.force_authenticate(user=self.owner_user)
        response = self.client.post("/api/booking/bookings/", {
            "sitter": self.sitter.id,
            "service_type": "pet_walking",
            "start_ts": self.start.isoformat(),
            "end_ts": self.end.isoformat(),
            "price_quote": "50.00"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)

    def test_booking_time_validation(self):
        self.client.force_authenticate(user=self.owner_user)
        response = self.client.post("/api/booking/bookings/", {
            "sitter": self.sitter.id,
            "service_type": "pet_walking",
            "start_ts": self.end.isoformat(),
            "end_ts": self.start.isoformat(),
            "price_quote": "50.00"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("End time must be after start time", str(response.data))

    def test_booking_sitter_availability_validation(self):
        self.client.force_authenticate(user=self.owner_user)
        past_start = timezone.now() - timedelta(days=1)
        past_end = past_start + timedelta(hours=2)
        response = self.client.post("/api/booking/bookings/", {
            "sitter": self.sitter.id,
            "service_type": "pet_walking",
            "start_ts": past_start.isoformat(),
            "end_ts": past_end.isoformat(),
            "price_quote": "50.00"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("not available", str(response.data))

    def test_overlapping_booking_validation(self):
        Booking.objects.create(
            owner=self.owner,
            sitter=self.sitter,
            service_type="pet_walking",
            start_ts=self.start,
            end_ts=self.end,
            price_quote=50.00,
            status="confirmed"
        )
        self.client.force_authenticate(user=self.owner_user)
        response = self.client.post("/api/booking/bookings/", {
            "sitter": self.sitter.id,
            "service_type": "pet_walking",
            "start_ts": self.start.isoformat(),
            "end_ts": self.end.isoformat(),
            "price_quote": "50.00"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already has a booking", str(response.data))

    def test_role_based_status_update_sitter(self):
        booking = Booking.objects.create(
            owner=self.owner,
            sitter=self.sitter,
            service_type="pet_walking",
            start_ts=self.start,
            end_ts=self.end,
            price_quote=50.00,
            status="requested"
        )
        self.client.force_authenticate(user=self.sitter_user)
        response = self.client.patch(f"/api/booking/bookings/{booking.id}/", {
            "status": "confirmed"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, "confirmed")

    def test_role_based_status_update_owner(self):
        booking = Booking.objects.create(
            owner=self.owner,
            sitter=self.sitter,
            service_type="pet_walking",
            start_ts=self.start,
            end_ts=self.end,
            price_quote=50.00,
            status="requested"
        )
        self.client.force_authenticate(user=self.owner_user)
        response = self.client.patch(f"/api/booking/bookings/{booking.id}/", {
            "status": "canceled"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, "canceled")
