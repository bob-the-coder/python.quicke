import json

from django.core.management import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **options):
        from rainer import trees

        print(json.dumps(trees, indent=4))