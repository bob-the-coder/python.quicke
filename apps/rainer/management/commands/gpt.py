from django.core.management.base import BaseCommand

from apps.rainer import RainerFile
from apps.rainer.gpt.gpt_assistant import get_gpt_assistant


class Command(BaseCommand):
    help = "Sends a message to GPT"

    def add_arguments(self, parser):
        parser.add_argument("message", type=str, help="Message to send to the GPT")

    def handle(self, *args, **options):
        message = options["message"]

        if not message.strip():
            print("Message cannot be empty")
            return

        get_gpt_assistant()
        return
        from ... import instructions

        rainer_init = RainerFile("backend", "rainer/__init__.py")
        instruction = instructions.build_file_ref_def(rainer_init)

        response = get_gpt_assistant().update_file_definition(rainer_init, instruction)

        print(response)
