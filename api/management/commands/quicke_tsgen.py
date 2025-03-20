import json

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Generate TypeScript models and API endpoints from Django discovery"

    def handle(self, *args, **options):
        from quicke import APP_REGISTRY
        from quicke.tsgen.ts import generate_typescript

        self.stdout.write(json.dumps(APP_REGISTRY, indent=4))
        generate_typescript()
