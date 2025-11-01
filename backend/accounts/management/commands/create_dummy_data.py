# accounts/management/commands/create_dummy_data.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from profiles.models import OwnerProfile, SitterProfile, Pet, Tag, Specialty
from booking.models import Booking
from availability.models import AvailabilitySlot
from review.models import Review
from datetime import datetime, timedelta
from decimal import Decimal
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates dummy users and related data for testing'

    def add_arguments(self, parser):
        parser.add_argument('--owners', type=int, default=5, help='Number of owners to create')
        parser.add_argument('--sitters', type=int, default=5, help='Number of sitters to create')

    def handle(self, *args, **options):
        from django.conf import settings
        if not settings.DEBUG:
            self.stdout.write(
                self.style.ERROR('This command can only be run in development mode (DEBUG=True)')
            )
            return

        num_owners = options['owners']
        num_sitters = options['sitters']

        tags = self.create_tags()
        specialties = self.create_specialties()

        self.stdout.write('Creating owners...')
        for i in range(num_owners):
            self.create_owner(i)

        self.stdout.write('Creating sitters...')
        for i in range(num_sitters):
            self.create_sitter(i, tags, specialties)

        self.stdout.write(self.style.SUCCESS(f'Successfully created {num_owners} owners and {num_sitters} sitters'))

    def create_tags(self):
        tag_names = ['Experienced', 'Pet CPR Certified', 'Dog Trainer', 'Cat Specialist', 
                     'Flexible Schedule', 'Large Dogs OK', 'Puppies Welcome', 'Senior Pets']
        tags = []
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name)
            tags.append(tag)
        self.stdout.write(f'Created {len(tags)} tags')
        return tags

    def create_specialties(self):
        specialty_names = ['Dogs', 'Cats', 'Birds', 'Reptiles', 'Small Mammals', 
                          'Exotic Pets', 'Farm Animals', 'Fish/Aquatics']
        specialties = []
        for name in specialty_names:
            specialty, _ = Specialty.objects.get_or_create(name=name)
            specialties.append(specialty)
        self.stdout.write(f'Created {len(specialties)} specialties')
        return specialties

    def create_owner(self, index):
        username = f'owner{index+1}'
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': f'{username}@example.com',
                'role': 'OWNER',
                'is_verified': True,
            }
        )
        if created:
            user.set_password('password123')
            user.save()

        owner_names = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Wilson', 
                       'David Brown', 'Jessica Garcia', 'Chris Martinez', 'Amanda Lee']
        
        profile, _ = OwnerProfile.objects.get_or_create(
            user=user,
            defaults={
                'name': owner_names[index % len(owner_names)],
                'phone': f'+1-555-{1000+index:04d}',
                'default_location': f'{12345+index} Main St, City, State',
                'notes': f'Regular customer, prefers morning appointments'
            }
        )

        self.create_pets(profile, index)

    def create_pets(self, owner_profile, owner_index):
        pet_data = [
            {'name': 'Buddy', 'species': 'Dog', 'breed': 'Golden Retriever', 'age': 3},
            {'name': 'Whiskers', 'species': 'Cat', 'breed': 'Persian', 'age': 2},
            {'name': 'Max', 'species': 'Dog', 'breed': 'German Shepherd', 'age': 5},
            {'name': 'Luna', 'species': 'Cat', 'breed': 'Siamese', 'age': 1},
            {'name': 'Charlie', 'species': 'Dog', 'breed': 'Beagle', 'age': 4},
            {'name': 'Bella', 'species': 'Dog', 'breed': 'Poodle', 'age': 2},
            {'name': 'Oliver', 'species': 'Cat', 'breed': 'Maine Coon', 'age': 3},
            {'name': 'Daisy', 'species': 'Dog', 'breed': 'Labrador', 'age': 6},
        ]

        num_pets = random.randint(1, 3)
        for i in range(num_pets):
            pet_info = pet_data[(owner_index + i) % len(pet_data)]
            Pet.objects.get_or_create(
                owner=owner_profile,
                name=f"{pet_info['name']}",
                defaults={
                    'species': pet_info['species'],
                    'breed': pet_info['breed'],
                    'age': pet_info['age'],
                    'notes': f'Friendly {pet_info["species"].lower()}, loves treats and playtime'
                }
            )

    def create_sitter(self, index, tags, specialties):
        username = f'sitter{index+1}'
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': f'{username}@example.com',
                'role': 'SITTER',
                'is_verified': True,
            }
        )
        if created:
            user.set_password('password123')
            user.save()

        sitter_names = ['Alex Thompson', 'Jamie Rodriguez', 'Taylor Chen', 'Jordan Kim',
                       'Casey Anderson', 'Riley Martinez', 'Morgan Davis', 'Avery Wilson']
        
        bios = [
            'Experienced pet sitter with a passion for animal care. I treat every pet like my own!',
            'Former veterinary assistant with 5+ years of pet sitting experience.',
            'Dog trainer and pet lover. Specialized in behavioral training and senior pet care.',
            'Grew up on a farm, comfortable with all types of animals from cats to chickens!',
            'Professional pet sitter offering personalized care for your furry friends.',
            'Certified in pet first aid and CPR. Your pets are in safe hands!',
            'Part-time vet student who loves spending time with animals of all kinds.',
            'Animal behaviorist with expertise in anxious and special needs pets.',
        ]
        
        profile, created = SitterProfile.objects.get_or_create(
            user=user,
            defaults={
                'display_name': sitter_names[index % len(sitter_names)],
                'bio': bios[index % len(bios)],
                'rate_hourly': Decimal(f'{random.randint(15, 45)}.00'),
                'service_radius_km': random.choice([5, 10, 15, 20]),
                'home_zip': f'{90000 + index:05d}',
                'avg_rating': round(random.uniform(4.0, 5.0), 1),
                'verification_status': random.choice(['VERIFIED', 'PENDING', 'VERIFIED', 'VERIFIED'])
            }
        )

        if created:
            profile.tags.set(random.sample(tags, random.randint(2, 4)))
            profile.specialties.set(random.sample(specialties, random.randint(1, 3)))

        self.create_availability(profile)

    def create_availability(self, sitter_profile):
        """Create availability slots for the next 2 weeks"""
        from django.utils import timezone
        start_date = timezone.now()
        
        for day in range(14):
            slot_date = start_date + timedelta(days=day)
            
            if random.random() < 0.2:
                continue
            
            for slot in range(random.randint(2, 3)):
                start_hour = random.choice([8, 10, 14, 16, 18])
                start_time = slot_date.replace(hour=start_hour, minute=0, second=0, microsecond=0)
                end_time = start_time + timedelta(hours=random.choice([2, 3, 4]))
                
                AvailabilitySlot.objects.get_or_create(
                    sitter=sitter_profile,
                    start_ts=start_time,
                    end_ts=end_time,
                    defaults={
                        'status': random.choice(['open', 'open', 'open', 'booked', 'blocked'])
                    }
                )