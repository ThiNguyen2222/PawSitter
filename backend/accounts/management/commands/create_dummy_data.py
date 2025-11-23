# accounts/management/commands/create_dummy_data.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from profiles.models import OwnerProfile, SitterProfile, Pet, Tag, Specialty
from booking.models import Booking
from availability.models import AvailabilitySlot
from review.models import Review
from datetime import timedelta
from decimal import Decimal
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates dummy users and related data for testing'

    def add_arguments(self, parser):
        # Number of owners and sitters to create
        parser.add_argument('--owners', type=int, default=5, help='Number of owners to create')
        parser.add_argument('--sitters', type=int, default=5, help='Number of sitters to create')

    def handle(self, *args, **options):
        from django.conf import settings
        # Only allow in DEBUG mode
        if not settings.DEBUG:
            self.stdout.write(self.style.ERROR('This command can only be run in development mode (DEBUG=True)'))
            return

        num_owners = options['owners']
        num_sitters = options['sitters']

        # Create tags and specialties first
        tags = self.create_tags()
        specialties = self.create_specialties()

        # Create owners
        self.stdout.write('Creating owners...')
        owners = [self.create_owner(i) for i in range(num_owners)]

        # Create sitters
        self.stdout.write('Creating sitters...')
        sitters = [self.create_sitter(i, tags, specialties) for i in range(num_sitters)]

        # Create bookings and reviews
        self.stdout.write('Creating bookings and reviews...')
        self.create_bookings_and_reviews(owners, sitters)

        self.stdout.write(self.style.SUCCESS(
            f'Successfully created {num_owners} owners and {num_sitters} sitters with reviews'
        ))

    def create_tags(self):
        # Create tags if they don't exist
        tag_names = ['Experienced', 'Pet CPR Certified', 'Dog Trainer', 'Cat Specialist',
                     'Flexible Schedule', 'Large Dogs OK', 'Puppies Welcome', 'Senior Pets']
        tags = []
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name)
            tags.append(tag)
        self.stdout.write(f'Created {len(tags)} tags')
        return tags

    def create_specialties(self):
        # Create specialties if they don't exist
        specialty_names = ['Dogs', 'Cats', 'Birds', 'Reptiles', 'Small Mammals',
                          'Exotic Pets', 'Farm Animals', 'Fish/Aquatics']
        specialties = []
        for name in specialty_names:
            specialty, _ = Specialty.objects.get_or_create(name=name)
            specialties.append(specialty)
        self.stdout.write(f'Created {len(specialties)} specialties')
        return specialties

    def create_owner(self, index):
        # Create a user and OwnerProfile
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

        # Assign random name and info
        owner_names = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Wilson',
                       'David Brown', 'Jessica Garcia', 'Chris Martinez', 'Amanda Lee']
        profile, _ = OwnerProfile.objects.get_or_create(
            user=user,
            defaults={
                'name': owner_names[index % len(owner_names)],
                'phone': f'+1-555-{1000+index:04d}',
                'default_location': f'{12345+index} Main St, City, State',
                'notes': 'Regular customer, prefers morning appointments'
            }
        )

        # Create pets for owner
        self.create_pets(profile, index)
        return profile

    def create_pets(self, owner_profile, owner_index):
        # Create 1-3 pets for each owner
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
                name=pet_info['name'],
                defaults={
                    'species': pet_info['species'],
                    'breed': pet_info['breed'],
                    'age': pet_info['age'],
                    'notes': f'Friendly {pet_info["species"].lower()}, loves treats and playtime'
                }
            )

    def create_sitter(self, index, tags, specialties):
        # Create a user and SitterProfile
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

        # Assign random display name, bio, rate, etc.
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

        # Assign random tags and specialties
        if created:
            profile.tags.set(random.sample(tags, random.randint(2, 4)))
            profile.specialties.set(random.sample(specialties, random.randint(1, 3)))

        # Create availability slots
        self.create_availability(profile)
        return profile

    def create_availability(self, sitter_profile):
        # Create availability slots for the next 2 weeks
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
                    defaults={'status': random.choice(['open', 'open', 'open', 'booked', 'blocked'])}
                )

    def create_bookings_and_reviews(self, owners, sitters):
        # Create completed bookings and reviews for each sitter
        review_comments = {
            5: [
                "Excellent service! My pet was very happy and well-cared for.",
                "Very professional and caring. Would definitely book again!",
                "Amazing with my cat! Very attentive and sent regular updates.",
            ],
            4: [
                "Great experience, my dog loved spending time with them.",
                "Reliable and trustworthy sitter. Highly recommended!",
            ],
            3: ["Satisfactory service. Everything went smoothly."],
            2: ["Service was below expectations. Communication could be better."],
            1: ["Very unprofessional. Would not recommend."]
        }
        reviews_created = 0

        for sitter in sitters:
            num_reviews = random.randint(3, 8)
            for _ in range(num_reviews):
                owner = random.choice(owners)
                pets = list(owner.pets.all())
                if not pets:
                    continue

                # Random past booking time
                days_ago = random.randint(7, 90)
                start_ts = timezone.now() - timedelta(days=days_ago, hours=random.randint(8, 16))
                end_ts = start_ts + timedelta(hours=random.choice([2, 3, 4]))
                hours = Decimal((end_ts - start_ts).total_seconds() / 3600)
                price_quote = sitter.rate_hourly * hours
                service_type = random.choice(['house_sitting', 'pet_boarding', 'in_home_visit', 'pet_grooming', 'pet_walking'])

                booking = Booking.objects.create(
                    owner=owner,
                    sitter=sitter,
                    service_type=service_type,
                    start_ts=start_ts,
                    end_ts=end_ts,
                    price_quote=price_quote,
                    status='completed'
                )

                # Random rating and comment
                rating = random.choices([5, 4, 3, 2, 1], weights=[50, 30, 10, 5, 5], k=1)[0]
                comment = random.choice(review_comments[rating]) if random.random() > 0.2 else ""

                try:
                    Review.objects.create(
                        booking=booking,
                        owner=owner,
                        sitter=sitter,
                        rating=rating,
                        comment=comment
                    )
                    reviews_created += 1
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Could not create review: {e}'))

        self.stdout.write(f'Created {reviews_created} reviews')
