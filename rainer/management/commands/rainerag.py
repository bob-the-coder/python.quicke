from django.core.management.base import BaseCommand

from rainer.instructions import RefactorFile
from rainer.operations import refactor_op


class Command(BaseCommand):
    help = "Sends a message to GPT"

    def handle(self, *args, **options):
        project = input("Specify project: ")
        path = input("Specify file: ")
        instruction = input("What changes?: ")

        refactor_file = RefactorFile(
            project=project,
            path=path,
            content=instruction
        )
        result = refactor_op(refactor_file)
        print(result)
