from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta
from availability.models import AvailabilitySlot
from profiles.models import SitterProfile

User = get_user_model()


class AvailabilitySlotModelTests(TestCase):
    """Test AvailabilitySlot model"""
    
    def setUp(self):
        self.sitter_user = User.objects.create_user(
            username='testsitter',
            password='testpass123',
            role='SITTER'
        )
        self.sitter_profile = SitterProfile.objects.create(
            user=self.sitter_user,
            display_name='Test Sitter',
            rate_hourly=25.00,
            home_zip='12345'
        )
        self.start_time = timezone.now() + timedelta(days=1)
        self.end_time = self.start_time + timedelta(hours=8)
    
    def test_create_availability_slot(self):
        """Test creating an availability slot"""
        slot = AvailabilitySlot.objects.create(
            sitter=self.sitter_profile,
            start_ts=self.start_time,
            end_ts=self.end_time,
            status='open'
        )
        self.assertEqual(slot.sitter, self.sitter_profile)
        self.assertEqual(slot.status, 'open')
        self.assertEqual(str(slot), f"{self.sitter_profile} | {self.start_time} → {self.end_time} (open)")
    
    def test_availability_slot_ordering(self):
        """Test that slots are ordered by start_ts"""
        slot1 = AvailabilitySlot.objects.create(
            sitter=self.sitter_profile,
            start_ts=self.start_time + timedelta(days=2),
            end_ts=self.end_time + timedelta(days=2),
            status='open'
        )
        slot2 = AvailabilitySlot.objects.create(
            sitter=self.sitter_profile,
            start_ts=self.start_time,
            end_ts=self.end_time,
            status='open'
        )
        slots = AvailabilitySlot.objects.all()
        self.assertEqual(slots[0], slot2)
        self.assertEqual(slots[1], slot1)


class AvailabilitySlotAPITests(TestCase):
    """Test AvailabilitySlot API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create sitter user and profile
        self.sitter_user = User.objects.create_user(
            username='testsitter',
            password='testpass123',
            role='SITTER'
        )
        self.sitter_profile = SitterProfile.objects.create(
            user=self.sitter_user,
            display_name='Test Sitter',
            rate_hourly=25.00,
            home_zip='12345'
        )
        
        # Create owner user (should not be able to create availability)
        self.owner_user = User.objects.create_user(
            username='testowner',
            password='testpass123',
            role='OWNER'
        )
        
        self.start_time = timezone.now() + timedelta(days=1)
        self.end_time = self.start_time + timedelta(hours=8)
    
    def test_sitter_can_create_availability(self):
        """Test that sitters can create availability slots"""
        self.client.force_authenticate(user=self.sitter_user)
        
        data = {
            'start_ts': self.start_time.isoformat(),
            'end_ts': self.end_time.isoformat(),
            'status': 'open'
        }
        
        response = self.client.post('/api/availability/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AvailabilitySlot.objects.count(), 1)
        
        slot = AvailabilitySlot.objects.first()
        self.assertEqual(slot.sitter, self.sitter_profile)
        self.assertEqual(slot.status, 'open')
    
    def test_owner_cannot_create_availability(self):
        """Test that owners cannot create availability slots"""
        self.client.force_authenticate(user=self.owner_user)
        
        data = {
            'start_ts': self.start_time.isoformat(),
            'end_ts': self.end_time.isoformat(),
            'status': 'open'
        }
        
        response = self.client.post('/api/availability/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(AvailabilitySlot.objects.count(), 0)
    
    def test_unauthenticated_cannot_create_availability(self):
        """Test that unauthenticated users cannot create availability"""
        data = {
            'start_ts': self.start_time.isoformat(),
            'end_ts': self.end_time.isoformat(),
            'status': 'open'
        }
        
        response = self.client.post('/api/availability/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_sitter_can_only_see_own_availability(self):
        """Test that sitters only see their own availability slots"""
        # Create another sitter
        other_sitter_user = User.objects.create_user(
            username='othersitter',
            password='testpass123',
            role='SITTER'
        )
        other_sitter_profile = SitterProfile.objects.create(
            user=other_sitter_user,
            display_name='Other Sitter',
            rate_hourly=30.00,
            home_zip='54321'
        )
        
        # Create slots for both sitters
        AvailabilitySlot.objects.create(
            sitter=self.sitter_profile,
            start_ts=self.start_time,
            end_ts=self.end_time,
            status='open'
        )
        AvailabilitySlot.objects.create(
            sitter=other_sitter_profile,
            start_ts=self.start_time,
            end_ts=self.end_time,
            status='open'
        )
        
        # Authenticate as first sitter
        self.client.force_authenticate(user=self.sitter_user)
        
        response = self.client.get('/api/availability/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['sitter_id'], self.sitter_profile.id)
    
    def test_validate_end_time_after_start_time(self):
        """Test that end time must be after start time"""
        self.client.force_authenticate(user=self.sitter_user)
        
        data = {
            'start_ts': self.end_time.isoformat(),
            'end_ts': self.start_time.isoformat(),
            'status': 'open'
        }
        
        response = self.client.post('/api/availability/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_validate_no_overlapping_slots(self):
        """Test that overlapping slots are not allowed"""
        self.client.force_authenticate(user=self.sitter_user)
        
        # Create first slot
        data1 = {
            'start_ts': self.start_time.isoformat(),
            'end_ts': self.end_time.isoformat(),
            'status': 'open'
        }
        response1 = self.client.post('/api/availability/', data1, format='json')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Try to create overlapping slot
        data2 = {
            'start_ts': (self.start_time + timedelta(hours=2)).isoformat(),
            'end_ts': (self.end_time + timedelta(hours=2)).isoformat(),
            'status': 'open'
        }
        response2 = self.client.post('/api/availability/', data2, format='json')
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_sitter_can_update_own_slot(self):
        """Test that sitter can update their own availability slot"""
        slot = AvailabilitySlot.objects.create(
            sitter=self.sitter_profile,
            start_ts=self.start_time,
            end_ts=self.end_time,
            status='open'
        )
        
        self.client.force_authenticate(user=self.sitter_user)
        
        new_end_time = self.end_time + timedelta(hours=2)
        data = {
            'start_ts': self.start_time.isoformat(),
            'end_ts': new_end_time.isoformat(),
            'status': 'open'
        }
        
        response = self.client.put(f'/api/availability/{slot.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        slot.refresh_from_db()
        self.assertEqual(slot.end_ts.replace(microsecond=0), new_end_time.replace(microsecond=0))
    
    def test_sitter_cannot_update_other_sitters_slot(self):
        """Test that sitter cannot update another sitter's slot"""
        other_sitter_user = User.objects.create_user(
            username='othersitter',
            password='testpass123',
            role='SITTER'
        )
        other_sitter_profile = SitterProfile.objects.create(
            user=other_sitter_user,
            display_name='Other Sitter',
            rate_hourly=30.00,
            home_zip='54321'
        )
        
        slot = AvailabilitySlot.objects.create(
            sitter=other_sitter_profile,
            start_ts=self.start_time,
            end_ts=self.end_time,
            status='open'
        )
        
        self.client.force_authenticate(user=self.sitter_user)
        
        data = {
            'start_ts': self.start_time.isoformat(),
            'end_ts': (self.end_time + timedelta(hours=2)).isoformat(),
            'status': 'open'
        }
        
        response = self.client.put(f'/api/availability/{slot.id}/', data, format='json')
        # Should get 404 because queryset filters to own slots only
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_sitter_can_delete_own_slot(self):
        """Test that sitter can delete their own slot"""
        slot = AvailabilitySlot.objects.create(
            sitter=self.sitter_profile,
            start_ts=self.start_time,
            end_ts=self.end_time,
            status='open'
        )
        
        self.client.force_authenticate(user=self.sitter_user)
        
        response = self.client.delete(f'/api/availability/{slot.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(AvailabilitySlot.objects.count(), 0)
    
    def test_owner_sees_no_availability(self):
        """Test that owners get empty queryset"""
        AvailabilitySlot.objects.create(
            sitter=self.sitter_profile,
            start_ts=self.start_time,
            end_ts=self.end_time,
            status='open'
        )
        
        self.client.force_authenticate(user=self.owner_user)
        
        response = self.client.get('/api/availability/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)