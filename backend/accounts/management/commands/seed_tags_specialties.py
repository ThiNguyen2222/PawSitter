# accounts/management/commands/seed_tags_specialties.py
from django.core.management.base import BaseCommand
from profiles.models import Tag, Specialty

class Command(BaseCommand):
    help = 'Seeds tags and specialties for production use'

    def add_arguments(self, parser):
        # Optional flag to clear existing tags and specialties
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing tags and specialties before seeding'
        )

    def handle(self, *args, **options):
        # Clear existing records if requested
        if options['clear']:
            self.stdout.write('Clearing existing tags and specialties...')
            Tag.objects.all().delete()
            Specialty.objects.all().delete()
            self.stdout.write(self.style.WARNING('Cleared!'))

        # Seed tags
        self.stdout.write('Seeding tags...')
        tags = self.create_tags()
        
        # Seed specialties
        self.stdout.write('Seeding specialties...')
        specialties = self.create_specialties()
        
        # Summary
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(tags)} tags and {len(specialties)} specialties'
            )
        )

    def create_tags(self):
        # Create or get all tags
        tag_names = [
            # Experience & Certifications
            'Experienced',
            'Pet CPR Certified',
            'First Aid Certified',
            'Insured & Bonded',
            'Background Checked',

            # Specializations
            'Dog Trainer',
            'Cat Specialist',
            'Bird Expert',
            'Exotic Pet Handler',

            # Services
            'Flexible Schedule',
            'House Sitting',
            'Overnight Care',
            'Daily Walks',
            'Pet Grooming',
            'Medication Administration',

            # Pet Types
            'Large Dogs OK',
            'Small Dogs Only',
            'Puppies Welcome',
            'Senior Pets',
            'Special Needs',
            'Multi-Pet Household',

            # Additional
            'Pet Transportation',
            'Emergency Available',
            'Yard Available',
            'Indoor Only',
        ]
        
        tags = []
        for name in tag_names:
            tag, created = Tag.objects.get_or_create(name=name)
            if created:
                self.stdout.write(f'  ✓ Created tag: {name}')
            else:
                self.stdout.write(f'  - Tag already exists: {name}')
            tags.append(tag)
        
        return tags

    def create_specialties(self):
        # Create or get all specialties
        specialty_names = [
            # Common Pets
            'Dogs',
            'Cats',
            'Birds',

            # Small Mammals
            'Rabbits',
            'Guinea Pigs',
            'Hamsters',
            'Ferrets',
            'Chinchillas',

            # Reptiles & Amphibians
            'Reptiles',
            'Turtles',
            'Snakes',
            'Lizards',

            # Aquatic
            'Fish',
            'Aquatic Animals',

            # Large/Farm
            'Horses',
            'Farm Animals',
            'Livestock',

            # Exotic
            'Exotic Pets',
            'Pocket Pets',
        ]
        
        specialties = []
        for name in specialty_names:
            specialty, created = Specialty.objects.get_or_create(name=name)
            if created:
                self.stdout.write(f'  ✓ Created specialty: {name}')
            else:
                self.stdout.write(f'  - Specialty already exists: {name}')
            specialties.append(specialty)
        
        return specialties
