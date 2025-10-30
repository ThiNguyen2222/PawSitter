from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta
from decimal import Decimal
from booking.models import Booking
from profiles.models import SitterProfile, OwnerProfile
from availability.models import AvailabilitySlot

User = get_user_model()


class BookingModelTests(TestCase):
    """Test Booking model"""
    
    def setUp(self):
        # Create sitter
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
        
        # Create owner
        self.owner_user = User.objects.create_user(
            username='testowner',
            password='testpass123',
            role='OWNER'
        )
        self.owner_profile = OwnerProfile.objects.create(
            user=self.owner_user,
            name='Test Owner',
            phone='1234567890'
        )
        
        self.start_time = timezone.now() + timedelta(days=1)
        self.end_time = self.start_time + timedelta(hours=8)
    
    def test_create_booking(self):
        """Test creating a booking"""
        booking = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='requested'
        )
        self.assertEqual(booking.owner, self.owner_profile)
        self.assertEqual(booking.sitter, self.sitter_profile)
        self.assertEqual(booking.status, 'requested')
        self.assertEqual(booking.price_quote, Decimal('100.00'))
    
    def test_booking_string_representation(self):
        """Test booking __str__ method"""
        booking = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='requested'
        )
        expected = f"Booking #{booking.id} | {self.owner_profile} → {self.sitter_profile} (requested) [pet_walking]"
        self.assertEqual(str(booking), expected)
    
    def test_booking_ordering(self):
        """Test bookings are ordered by -created_at"""
        booking1 = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='requested'
        )
        booking2 = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='house_sitting',
            start_ts=self.start_time + timedelta(days=2),
            end_ts=self.end_time + timedelta(days=2),
            price_quote=Decimal('200.00'),
            status='requested'
        )
        bookings = Booking.objects.all()
        self.assertEqual(bookings[0], booking2)
        self.assertEqual(bookings[1], booking1)


class BookingAPITests(TestCase):
    """Test Booking API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create sitter
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
        
        # Create owner
        self.owner_user = User.objects.create_user(
            username='testowner',
            password='testpass123',
            role='OWNER'
        )
        self.owner_profile = OwnerProfile.objects.create(
            user=self.owner_user,
            name='Test Owner',
            phone='1234567890'
        )
        
        self.start_time = timezone.now() + timedelta(days=1)
        self.end_time = self.start_time + timedelta(hours=8)
        
        # Create availability slot for sitter
        self.availability_slot = AvailabilitySlot.objects.create(
            sitter=self.sitter_profile,
            start_ts=self.start_time - timedelta(hours=1),
            end_ts=self.end_time + timedelta(hours=1),
            status='open'
        )
    
    def test_owner_can_create_booking(self):
        """Test that owners can create bookings"""
        self.client.force_authenticate(user=self.owner_user)
        
        data = {
            'sitter': self.sitter_profile.id,
            'service_type': 'pet_walking',
            'start_ts': self.start_time.isoformat(),
            'end_ts': self.end_time.isoformat(),
            'price_quote': '100.00',
            'status': 'requested'
        }
        
        response = self.client.post('/api/bookings/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)
        
        booking = Booking.objects.first()
        self.assertEqual(booking.owner, self.owner_profile)
        self.assertEqual(booking.sitter, self.sitter_profile)
    
    def test_sitter_cannot_create_booking(self):
        """Test that sitters cannot create bookings"""
        self.client.force_authenticate(user=self.sitter_user)
        
        data = {
            'sitter': self.sitter_profile.id,
            'service_type': 'pet_walking',
            'start_ts': self.start_time.isoformat(),
            'end_ts': self.end_time.isoformat(),
            'price_quote': '100.00',
            'status': 'requested'
        }
        
        response = self.client.post('/api/bookings/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_owner_can_only_see_own_bookings(self):
        """Test that owners only see their own bookings"""
        # Create another owner
        other_owner_user = User.objects.create_user(
            username='otherowner',
            password='testpass123',
            role='OWNER'
        )
        other_owner_profile = OwnerProfile.objects.create(
            user=other_owner_user,
            name='Other Owner',
            phone='0987654321'
        )
        
        # Create bookings for both owners
        Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='requested'
        )
        Booking.objects.create(
            owner=other_owner_profile,
            sitter=self.sitter_profile,
            service_type='house_sitting',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('200.00'),
            status='requested'
        )
        
        self.client.force_authenticate(user=self.owner_user)
        
        response = self.client.get('/api/bookings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['owner_id'], self.owner_profile.id)
    
    def test_sitter_can_only_see_own_bookings(self):
        """Test that sitters only see bookings assigned to them"""
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
        
        # Create bookings for both sitters
        Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='requested'
        )
        Booking.objects.create(
            owner=self.owner_profile,
            sitter=other_sitter_profile,
            service_type='house_sitting',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('200.00'),
            status='requested'
        )
        
        self.client.force_authenticate(user=self.sitter_user)
        
        response = self.client.get('/api/bookings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['sitter_id'], self.sitter_profile.id)
    
    def test_validate_end_time_after_start_time(self):
        """Test that end time must be after start time"""
        self.client.force_authenticate(user=self.owner_user)
        
        data = {
            'sitter': self.sitter_profile.id,
            'service_type': 'pet_walking',
            'start_ts': self.end_time.isoformat(),
            'end_ts': self.start_time.isoformat(),
            'price_quote': '100.00',
            'status': 'requested'
        }
        
        response = self.client.post('/api/bookings/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_validate_sitter_availability(self):
        """Test that booking requires available sitter"""
        self.client.force_authenticate(user=self.owner_user)
        
        # Try to book time without availability
        unavailable_start = self.end_time + timedelta(days=1)
        unavailable_end = unavailable_start + timedelta(hours=4)
        
        data = {
            'sitter': self.sitter_profile.id,
            'service_type': 'pet_walking',
            'start_ts': unavailable_start.isoformat(),
            'end_ts': unavailable_end.isoformat(),
            'price_quote': '100.00',
            'status': 'requested'
        }
        
        response = self.client.post('/api/bookings/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_validate_no_overlapping_bookings(self):
        """Test that overlapping bookings are not allowed"""
        self.client.force_authenticate(user=self.owner_user)
        
        # Create first booking
        data1 = {
            'sitter': self.sitter_profile.id,
            'service_type': 'pet_walking',
            'start_ts': self.start_time.isoformat(),
            'end_ts': self.end_time.isoformat(),
            'price_quote': '100.00',
            'status': 'confirmed'
        }
        response1 = self.client.post('/api/bookings/', data1, format='json')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Try to create overlapping booking
        data2 = {
            'sitter': self.sitter_profile.id,
            'service_type': 'house_sitting',
            'start_ts': (self.start_time + timedelta(hours=2)).isoformat(),
            'end_ts': (self.end_time + timedelta(hours=2)).isoformat(),
            'price_quote': '150.00',
            'status': 'requested'
        }
        response2 = self.client.post('/api/bookings/', data2, format='json')
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_sitter_can_confirm_booking(self):
        """Test that sitter can confirm a booking"""
        booking = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='requested'
        )
        
        self.client.force_authenticate(user=self.sitter_user)
        
        data = {'status': 'confirmed'}
        response = self.client.patch(f'/api/bookings/{booking.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'confirmed')
    
    def test_sitter_can_complete_booking(self):
        """Test that sitter can mark booking as completed"""
        booking = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='confirmed'
        )
        
        self.client.force_authenticate(user=self.sitter_user)
        
        data = {'status': 'completed'}
        response = self.client.patch(f'/api/bookings/{booking.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'completed')
    
    def test_sitter_can_cancel_booking(self):
        """Test that sitter can cancel a booking"""
        booking = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='requested'
        )
        
        self.client.force_authenticate(user=self.sitter_user)
        
        data = {'status': 'canceled'}
        response = self.client.patch(f'/api/bookings/{booking.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'canceled')
    
    def test_owner_can_only_cancel_booking(self):
        """Test that owner can only cancel bookings"""
        booking = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='requested'
        )
        
        self.client.force_authenticate(user=self.owner_user)
        
        # Try to confirm (should fail)
        data = {'status': 'confirmed'}
        response = self.client.patch(f'/api/bookings/{booking.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Try to cancel (should succeed)
        data = {'status': 'canceled'}
        response = self.client.patch(f'/api/bookings/{booking.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'canceled')
    
    def test_owner_cannot_update_other_owners_booking(self):
        """Test that owner cannot update another owner's booking"""
        other_owner_user = User.objects.create_user(
            username='otherowner',
            password='testpass123',
            role='OWNER'
        )
        other_owner_profile = OwnerProfile.objects.create(
            user=other_owner_user,
            name='Other Owner',
            phone='0987654321'
        )
        
        booking = Booking.objects.create(
            owner=other_owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='requested'
        )
        
        self.client.force_authenticate(user=self.owner_user)
        
        data = {'status': 'canceled'}
        response = self.client.patch(f'/api/bookings/{booking.id}/', data, format='json')
        # Should get 404 because queryset filters to own bookings only
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class BookingSignalTests(TestCase):
    """Test booking signals that update availability"""
    
    def setUp(self):
        # Create sitter
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
        
        # Create owner
        self.owner_user = User.objects.create_user(
            username='testowner',
            password='testpass123',
            role='OWNER'
        )
        self.owner_profile = OwnerProfile.objects.create(
            user=self.owner_user,
            name='Test Owner',
            phone='1234567890'
        )
        
        self.start_time = timezone.now() + timedelta(days=1)
        self.end_time = self.start_time + timedelta(hours=8)
        
        # Create availability slot
        self.availability_slot = AvailabilitySlot.objects.create(
            sitter=self.sitter_profile,
            start_ts=self.start_time - timedelta(hours=1),
            end_ts=self.end_time + timedelta(hours=1),
            status='open'
        )
    
    def test_availability_marked_booked_when_confirmed(self):
        """Test that availability is marked as booked when booking is confirmed"""
        booking = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='confirmed'
        )
        
        self.availability_slot.refresh_from_db()
        self.assertEqual(self.availability_slot.status, 'booked')
    
    def test_availability_freed_when_booking_canceled(self):
        """Test that availability is freed when booking is canceled"""
        booking = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='confirmed'
        )
        
        # Verify it's booked
        self.availability_slot.refresh_from_db()
        self.assertEqual(self.availability_slot.status, 'booked')
        
        # Cancel booking
        booking.status = 'canceled'
        booking.save()
        
        # Verify it's freed
        self.availability_slot.refresh_from_db()
        self.assertEqual(self.availability_slot.status, 'open')
    
    def test_availability_freed_when_booking_completed(self):
        """Test that availability is freed when booking is completed"""
        booking = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='confirmed'
        )
        
        # Verify it's booked
        self.availability_slot.refresh_from_db()
        self.assertEqual(self.availability_slot.status, 'booked')
        
        # Complete booking
        booking.status = 'completed'
        booking.save()
        
        # Verify it's freed
        self.availability_slot.refresh_from_db()
        self.assertEqual(self.availability_slot.status, 'open')
    
    def test_availability_freed_when_booking_deleted(self):
        """Test that availability is freed when confirmed booking is deleted"""
        booking = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='confirmed'
        )
        
        # Verify it's booked
        self.availability_slot.refresh_from_db()
        self.assertEqual(self.availability_slot.status, 'booked')
        
        # Delete booking
        booking.delete()
        
        # Verify it's freed
        self.availability_slot.refresh_from_db()
        self.assertEqual(self.availability_slot.status, 'open')