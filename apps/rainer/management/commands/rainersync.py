from django.core.management.base import BaseCommand

from apps.rainer import RainerFile
from apps.rainer.gpt.gpt_assistant import get_gpt_assistant


class Command(BaseCommand):
    help = "Synchronizes project files from the specified branch"

    def add_arguments(self, parser):
        parser.add_argument(
            "--branches", type=str,
            help="Which branches to sync [backend, frontend]",
            default="backend, frontend",  # default value if not provided
            required=False
        )

    def handle(self, *args, **options):
        branches = options.get("branches", "backend, frontend")

        assistant = get_gpt_assistant()

        from ... import instructions, trees

        for branch in branches.split(","):
            branch = branch.strip()
            backend = trees.get(branch, [])
            if len(backend) == 0:
                self.stdout.write(f"No files found in branch {branch}")
                return

            for file in backend:
                rainer_file = RainerFile(branch, file)

                assistant.add_message(instructions.build_file_ref_def(rainer_file))
                self.stdout.write("Added file: {}".format(rainer_file))
