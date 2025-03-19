import json

from django.core.management.base import BaseCommand

from quicke.tsgen.ts import generate_typescript

class Command(BaseCommand):
    help = "Generate TypeScript models and API endpoints from Django discovery"

    def handle(self, *args, **options):
        from quicke.discovery.apps import quicke_APP_REGISTRY
        # generate_typescript()
        # self.stdout.write(self.style.SUCCESS("✅ TypeScript generation complete!"))
        self.stdout.write(json.dumps(quicke_APP_REGISTRY, indent=4))
