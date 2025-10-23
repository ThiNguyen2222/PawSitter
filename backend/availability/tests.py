from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta

from accounts.models import User
from profiles.models import SitterProfile
from availability.models import AvailabilitySlot

class AvailabilitySlotTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="sitter1", password="pass", role="SITTER")
        self.sitter = SitterProfile.objects.create(
            user=self.user,
            display_name="Sitter 1",
            rate_hourly=20,
            home_zip="12345"
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.start = timezone.now() + timedelta(days=1)
        self.end = self.start + timedelta(hours=2)

    def test_create_availability_slot(self):
        response = self.client.post("/api/availability/", {
            "sitter": self.sitter.id,
            "start_ts": self.start.isoformat(),
            "end_ts": self.end.isoformat(),
            "status": "open"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AvailabilitySlot.objects.count(), 1)

    def test_overlapping_slot_validation(self):
        AvailabilitySlot.objects.create(
            sitter=self.sitter,
            start_ts=self.start,
            end_ts=self.end
        )
        response = self.client.post("/api/availability/", {
            "sitter": self.sitter.id,
            "start_ts": (self.start + timedelta(minutes=30)).isoformat(),
            "end_ts": (self.end + timedelta(hours=1)).isoformat(),
            "status": "open"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("overlaps", str(response.data))
