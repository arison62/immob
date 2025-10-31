from django.core.management.base import BaseCommand, CommandParser
from faker import Faker
from accounts.models import ImmobUser

class Command(BaseCommand):
    help = 'Populate the database with fake data'

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument('count', type=int, nargs='?', default=1)
        return super().add_arguments(parser)
    def handle(self, *args, **kwargs):
        fake = Faker()
        count = kwargs['count']
        for _ in range(count):
            ImmobUser.objects.create_user(
                username=fake.user_name(),
                email=fake.email(),
                password=fake.password(),
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                phone=fake.phone_number(),
                role= fake.random_element(elements=[ImmobUser.UserRole.MANAGER, ImmobUser.UserRole.VIEWER]),
            )