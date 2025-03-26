from django.core.management.base import BaseCommand

from rainer import RainerFile
from rainer.gpt.gpt_assistant import get_gpt_assistant
from rainer.instructions import OUTPUT_AS_PLAINTEXT


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

        assistant.add_message(message + ("\n" * 2) + OUTPUT_AS_PLAINTEXT)

        assistant.run()

        response = assistant.get_last_message()

        print(response)
