import os
from django.core.management.base import BaseCommand


MODEL_MAPPING = {
    # Evaluation: ("evaluations_assertionevaluation", {
    #     "__unique__": "name",
    #     "name": 1,
    #     "target": lambda row: EvaluationTarget.objects.get(name=row[1].split(":")[3].replace("./data/text/", "")),
    #     "assertion": lambda row: Assertion.objects.get(name=row[1].split(":")[2]),
    #     "raw_result": 11
    # })
}


class Command(BaseCommand):
    help = "Imports data from CSV files into the Django database."

    def add_arguments(self, parser):
        parser.add_argument(
            "models",
            nargs="*",
            type=str,
            help="List of models to import (e.g., 'Assertion' 'Conversation'). If omitted, imports all.",
        )

    def handle(self, *args, **options):
        selected_models = options["models"]

        for model, (filename, mapping) in MODEL_MAPPING.items():
            if selected_models and model.__name__ not in selected_models:
                continue  # Skip models not explicitly requested

            file_path = get_import_csv_path(f"{filename}.csv")

            if not os.path.exists(file_path):
                self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
                continue

            try:
                import_csv(file_path, model, mapping)
                self.stdout.write(self.style.SUCCESS(f"Successfully imported {filename}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error importing {filename}: {e}"))

import csv
import os
from django.conf import settings


def get_import_csv_path(filename):
    """
    Resolves the path to an import file located in the 'imports' folder.

    :param filename: Name of the CSV file (without path).
    :return: Absolute file path.
    """
    return os.path.join(settings.BASE_DIR, "imports", filename)


def import_csv(file_path, model_class, mapping, batch_size=100):
    """
    Imports data from a CSV file into a given Django model.

    :param file_path: Path to the CSV file.
    :param model_class: The Django model class to import data into.
    :param mapping: A dictionary where:
        - Keys are model field names.
        - Values are either:
            1. Column index (int) -> Extracts data directly from that column.
            2. Function -> Receives `row` (list) and returns a processed value.
        - Special key `__unique__` can be set to a field name to check for existing records.
    :param batch_size: Number of records to create in a single bulk operation.
    :return: Number of records imported or updated.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"CSV file '{file_path}' not found.")

    unique_field = mapping.pop("__unique__", None)  # Get the unique field if provided
    instances_to_create = []
    instances_to_update = []
    total_processed = 0

    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)

        for row in reader:
            if len(row) < max(
                [v for v in mapping.values() if isinstance(v, int)] + [0]
            ):
                continue  # Skip malformed rows

            data = {}
            for field, value in mapping.items():
                if callable(value):
                    data[field] = value(row)  # Call function with the row
                elif isinstance(value, int):
                    data[field] = row[value].strip() if row[value] else None

            # If a unique field is specified, check for existing records
            if unique_field and unique_field in data:
                existing_instance = model_class.objects.filter(**{unique_field: data[unique_field]}).first()
                if existing_instance:
                    for field, value in data.items():
                        setattr(existing_instance, field, value)  # Update existing record
                    instances_to_update.append(existing_instance)
                    total_processed += 1
                    continue

            # Otherwise, create a new instance
            try:
                instances_to_create.append(model_class(**data))
                total_processed += 1
            except Exception as e:
                print(f"Error creating instance: {e} (Data: {data})")

            # Bulk insert in batches
            if len(instances_to_create) >= batch_size:
                model_class.objects.bulk_create(instances_to_create)
                instances_to_create = []

            if len(instances_to_update) >= batch_size:
                model_class.objects.bulk_update(instances_to_update, list(mapping.keys()))
                instances_to_update = []

    # Insert remaining records
    if instances_to_create:
        model_class.objects.bulk_create(instances_to_create)
    if instances_to_update:
        model_class.objects.bulk_update(instances_to_update, list(mapping.keys()))

    return total_processed
