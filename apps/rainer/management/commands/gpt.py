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

        assistant = get_gpt_assistant()

        from ... import instructions

        rainer_init = RainerFile("backend", "rainer/__init__.py")
        assistant.add_message(instructions.build_file_ref_def(rainer_init))
        assistant.add_message("What can you tell me about the rainer __init__ file?")

        assistant.run()

        response = assistant.get_last_message()

        print(response)
