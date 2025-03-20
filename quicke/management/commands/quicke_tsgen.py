import json

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Generate TypeScript models and API endpoints from Django discovery"

    def add_arguments(self, parser):
        parser.add_argument(
            "-no",
            action="store_true",
            help="Only dump the JSON registry without generating TypeScript",
        )
        parser.add_argument(
            "apps",
            nargs="*",
            help="Optional list of app names to filter the output from APP_REGISTRY",
        )

    def handle(self, *args, **options):
        from quicke import APP_REGISTRY
        from quicke.tsgen.ts import generate_typescript

        app_registry = APP_REGISTRY

        if options["apps"]:
            app_registry = {
                "apps": {
                    app: data for app, data in (APP_REGISTRY["apps"] or {}).items() if app in options["apps"]
                }
            }

        self.stdout.write(json.dumps(app_registry, indent=4))

        if not options["no"]:
            generate_typescript()
