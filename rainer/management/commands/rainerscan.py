import json

from django.core.management import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **options):
        from rainer import project_trees

        print(json.dumps(project_trees, indent=4))