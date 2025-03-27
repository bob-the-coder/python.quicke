import uuid
from django.core.management.base import BaseCommand

from rainer import RainerFile
from rainer.operations import refactor_op


class Command(BaseCommand):
    help = "Sends a message to GPT"

    def handle(self, *args, **options):
        project = input("Specify project: ")
        path = input("Specify file: ")
        instruction = input("What changes?: ")

        result = refactor_op(RainerFile(project, path), instruction)
        print(result)
