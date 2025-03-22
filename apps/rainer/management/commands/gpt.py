from django.core.management.base import BaseCommand

from apps.rainer.gpt import get_gpt


class Command(BaseCommand):
    help = "Sends a message to GPT"

    def add_arguments(self, parser):
        parser.add_argument("message", type=str, help="Message to send to the GPT")

    def handle(self, *args, **options):
        message = options["message"]

        if not message.strip():
            print("Message cannot be empty")
            return

        response = get_gpt().send_instructions([message, "Output as JSON {\"response\": \"<response_text>\"}"])

        print(response)
