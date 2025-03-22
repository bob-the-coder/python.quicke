from django.core.management import BaseCommand


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("branch", type=str, help="backend or frontend")
        parser.add_argument("file", type=str, help="Relative file path e.g. <app_name>/models.py")

    def handle(self, *args, **options):
        file_name = options["file"]
        branch = options["branch"]

        if not file_name.strip():
            print("File name cannot be empty")
            return

        from apps.rainer import get_file_contents

        print(get_file_contents(branch, file_name))