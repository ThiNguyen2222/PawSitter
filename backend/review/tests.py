from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta
from decimal import Decimal
from review.models import Review
from booking.models import Booking
from profiles.models import SitterProfile, OwnerProfile
from availability.models import AvailabilitySlot

User = get_user_model()


class ReviewModelTests(TestCase):
    """Test Review model"""
    
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
        
        # Create completed booking
        self.start_time = timezone.now() - timedelta(days=2)
        self.end_time = self.start_time + timedelta(hours=8)
        
        self.booking = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='completed'
        )
    
    def test_create_review(self):
        """Test creating a review"""
        review = Review.objects.create(
            booking=self.booking,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=5,
            comment='Great sitter!'
        )
        self.assertEqual(review.owner, self.owner_profile)
        self.assertEqual(review.sitter, self.sitter_profile)
        self.assertEqual(review.rating, 5)
    
    def test_review_updates_sitter_avg_rating(self):
        """Test that creating a review updates sitter's avg_rating"""
        initial_rating = self.sitter_profile.avg_rating
        
        Review.objects.create(
            booking=self.booking,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=5,
            comment='Excellent!'
        )
        
        self.sitter_profile.refresh_from_db()
        self.assertEqual(self.sitter_profile.avg_rating, 5.0)
    
    def test_multiple_reviews_calculate_average(self):
        """Test that multiple reviews correctly calculate average rating"""
        # Create second booking
        booking2 = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='house_sitting',
            start_ts=self.start_time + timedelta(days=7),
            end_ts=self.end_time + timedelta(days=7),
            price_quote=Decimal('200.00'),
            status='completed'
        )
        
        # Create two reviews
        Review.objects.create(
            booking=self.booking,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=5,
            comment='Great!'
        )
        
        Review.objects.create(
            booking=booking2,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=3,
            comment='Good'
        )
        
        self.sitter_profile.refresh_from_db()
        self.assertEqual(self.sitter_profile.avg_rating, 4.0)  # (5+3)/2 = 4.0
    
    def test_delete_review_updates_avg_rating(self):
        """Test that deleting a review updates sitter's avg_rating"""
        review = Review.objects.create(
            booking=self.booking,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=5,
            comment='Great!'
        )
        
        self.sitter_profile.refresh_from_db()
        self.assertEqual(self.sitter_profile.avg_rating, 5.0)
        
        # Delete review
        review.delete()
        
        self.sitter_profile.refresh_from_db()
        self.assertEqual(self.sitter_profile.avg_rating, 0.0)
    
    def test_review_string_representation(self):
        """Test review __str__ method"""
        review = Review.objects.create(
            booking=self.booking,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=4,
            comment='Good service'
        )
        expected = f"Review {review.id} | {self.owner_profile} → {self.sitter_profile} (4)"
        self.assertEqual(str(review), expected)


class ReviewAPITests(TestCase):
    """Test Review API endpoints"""
    
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
        
        # Create completed booking
        self.start_time = timezone.now() - timedelta(days=2)
        self.end_time = self.start_time + timedelta(hours=8)
        
        self.booking = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='completed'
        )
    
    def test_owner_can_create_review(self):
        """Test that owners can create reviews"""
        self.client.force_authenticate(user=self.owner_user)
        
        data = {
            'booking': self.booking.id,
            'rating': 5,
            'comment': 'Excellent service!'
        }
        
        response = self.client.post('/api/reviews/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)
        
        review = Review.objects.first()
        self.assertEqual(review.owner, self.owner_profile)
        self.assertEqual(review.sitter, self.sitter_profile)
        self.assertEqual(review.rating, 5)
    
    def test_sitter_cannot_create_review(self):
        """Test that sitters cannot create reviews"""
        self.client.force_authenticate(user=self.sitter_user)
        
        data = {
            'booking': self.booking.id,
            'rating': 5,
            'comment': 'Great owner!'
        }
        
        response = self.client.post('/api/reviews/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Review.objects.count(), 0)
    
    def test_cannot_review_non_completed_booking(self):
        """Test that reviews can only be created for completed bookings"""
        # Create non-completed booking
        booking2 = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='house_sitting',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('200.00'),
            status='confirmed'  # Not completed
        )
        
        self.client.force_authenticate(user=self.owner_user)
        
        data = {
            'booking': booking2.id,
            'rating': 5,
            'comment': 'Great!'
        }
        
        response = self.client.post('/api/reviews/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('completed', str(response.data).lower())
    
    def test_cannot_review_other_owners_booking(self):
        """Test that owners cannot review bookings that don't belong to them"""
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
        
        self.client.force_authenticate(user=other_owner_user)
        
        data = {
            'booking': self.booking.id,  # Belongs to different owner
            'rating': 5,
            'comment': 'Great!'
        }
        
        response = self.client.post('/api/reviews/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('belong', str(response.data).lower())
    
    def test_cannot_create_duplicate_review(self):
        """Test that duplicate reviews for same booking are not allowed"""
        self.client.force_authenticate(user=self.owner_user)
        
        data = {
            'booking': self.booking.id,
            'rating': 5,
            'comment': 'Great!'
        }
        
        # Create first review
        response1 = self.client.post('/api/reviews/', data, format='json')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Try to create duplicate
        response2 = self.client.post('/api/reviews/', data, format='json')
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already exists', str(response2.data).lower())
    
    def test_rating_must_be_between_1_and_5(self):
        """Test that rating validation works"""
        self.client.force_authenticate(user=self.owner_user)
        
        # Test rating too low
        data = {
            'booking': self.booking.id,
            'rating': 0,
            'comment': 'Bad'
        }
        response = self.client.post('/api/reviews/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test rating too high
        data['rating'] = 6
        response = self.client.post('/api/reviews/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_owner_can_see_own_reviews(self):
        """Test that owners can see their own reviews"""
        Review.objects.create(
            booking=self.booking,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=5,
            comment='Great!'
        )
        
        self.client.force_authenticate(user=self.owner_user)
        
        response = self.client.get('/api/reviews/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['rating'], 5)
    
    def test_sitter_can_see_reviews_about_them(self):
        """Test that sitters can see reviews about themselves"""
        Review.objects.create(
            booking=self.booking,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=5,
            comment='Great!'
        )
        
        self.client.force_authenticate(user=self.sitter_user)
        
        response = self.client.get('/api/reviews/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['rating'], 5)
    
    def test_can_filter_reviews_by_sitter(self):
        """Test filtering reviews by sitter_id"""
        Review.objects.create(
            booking=self.booking,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=5,
            comment='Great!'
        )
        
        self.client.force_authenticate(user=self.owner_user)
        
        response = self.client.get(f'/api/reviews/?sitter={self.sitter_profile.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_owner_can_update_own_review(self):
        """Test that owner can update their own review"""
        review = Review.objects.create(
            booking=self.booking,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=4,
            comment='Good'
        )
        
        self.client.force_authenticate(user=self.owner_user)
        
        data = {
            'booking': self.booking.id,
            'rating': 5,
            'comment': 'Actually excellent!'
        }
        
        response = self.client.put(f'/api/reviews/{review.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        review.refresh_from_db()
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.comment, 'Actually excellent!')
    
    def test_owner_cannot_update_other_owners_review(self):
        """Test that owners cannot update reviews by other owners"""
        # Create another owner and their review
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
        
        # Create booking for other owner
        booking2 = Booking.objects.create(
            owner=other_owner_profile,
            sitter=self.sitter_profile,
            service_type='house_sitting',
            start_ts=self.start_time + timedelta(days=7),
            end_ts=self.end_time + timedelta(days=7),
            price_quote=Decimal('200.00'),
            status='completed'
        )
        
        review = Review.objects.create(
            booking=booking2,
            owner=other_owner_profile,
            sitter=self.sitter_profile,
            rating=3,
            comment='OK'
        )
        
        # Try to update as first owner
        self.client.force_authenticate(user=self.owner_user)
        
        data = {
            'booking': booking2.id,
            'rating': 1,
            'comment': 'Hacked!'
        }
        
        response = self.client.put(f'/api/reviews/{review.id}/', data, format='json')
        # Should get 404 because queryset filters to own reviews
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_owner_can_delete_own_review(self):
        """Test that owner can delete their own review"""
        review = Review.objects.create(
            booking=self.booking,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=5,
            comment='Great!'
        )
        
        self.client.force_authenticate(user=self.owner_user)
        
        response = self.client.delete(f'/api/reviews/{review.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Review.objects.count(), 0)
    
    def test_sitter_cannot_delete_review(self):
        """Test that sitters cannot delete reviews about them"""
        review = Review.objects.create(
            booking=self.booking,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=2,
            comment='Not great'
        )
        
        self.client.force_authenticate(user=self.sitter_user)
        
        response = self.client.delete(f'/api/reviews/{review.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Review.objects.count(), 1)
    
    def test_unauthenticated_cannot_create_review(self):
        """Test that unauthenticated users cannot create reviews"""
        data = {
            'booking': self.booking.id,
            'rating': 5,
            'comment': 'Great!'
        }
        
        response = self.client.post('/api/reviews/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ReviewSignalTests(TestCase):
    """Test that signals properly update sitter avg_rating"""
    
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
        
        # Create completed booking
        self.start_time = timezone.now() - timedelta(days=2)
        self.end_time = self.start_time + timedelta(hours=8)
        
        self.booking = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='pet_walking',
            start_ts=self.start_time,
            end_ts=self.end_time,
            price_quote=Decimal('100.00'),
            status='completed'
        )
    
    def test_signal_updates_avg_rating_on_create(self):
        """Test that creating a review triggers signal to update avg_rating"""
        self.assertEqual(self.sitter_profile.avg_rating, 0.0)
        
        Review.objects.create(
            booking=self.booking,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=4,
            comment='Good'
        )
        
        self.sitter_profile.refresh_from_db()
        self.assertEqual(self.sitter_profile.avg_rating, 4.0)
    
    def test_signal_updates_avg_rating_on_delete(self):
        """Test that deleting a review triggers signal to update avg_rating"""
        review = Review.objects.create(
            booking=self.booking,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=5,
            comment='Excellent'
        )
        
        self.sitter_profile.refresh_from_db()
        self.assertEqual(self.sitter_profile.avg_rating, 5.0)
        
        review.delete()
        
        self.sitter_profile.refresh_from_db()
        self.assertEqual(self.sitter_profile.avg_rating, 0.0)
    
    def test_signal_calculates_correct_average(self):
        """Test that signal calculates correct average with multiple reviews"""
        # Create second booking
        booking2 = Booking.objects.create(
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            service_type='house_sitting',
            start_ts=self.start_time + timedelta(days=7),
            end_ts=self.end_time + timedelta(days=7),
            price_quote=Decimal('200.00'),
            status='completed'
        )
        
        Review.objects.create(
            booking=self.booking,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=5,
            comment='Great'
        )
        
        Review.objects.create(
            booking=booking2,
            owner=self.owner_profile,
            sitter=self.sitter_profile,
            rating=3,
            comment='OK'
        )
        
        self.sitter_profile.refresh_from_db()
        self.assertEqual(self.sitter_profile.avg_rating, 4.0)  # (5+3)/2 = 4.0