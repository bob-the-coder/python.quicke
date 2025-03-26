from .settings import RAINER_PROJECTS, EXCLUDED_FILE_EXTENSIONS, EXCLUDED_FILE_NAMES, EXCLUDED_DIRS
from .types import RainerFile
from .fileapi import build_rainer_trees


def ensure_migrations(app_name="rainer") -> None:
    from django.db import connections
    from django.core.management import call_command
    from django.db.migrations.executor import MigrationExecutor

    try:
        connection = connections['default']
        print(f"Making migrations for the app: {app_name}...")
        call_command("makemigrations", app_name)

        executor = MigrationExecutor(connection)
        migration_plan = executor.migration_plan(executor.loader.graph.leaf_nodes(app_name))

        if migration_plan:
            print(f"Unapplied migrations found for {app_name}. Applying migrations...")
            call_command("migrate", app_name)
        else:
            print(f"No unapplied migrations for {app_name}.")
    except Exception as e:
        print(f"Error occurred while checking or applying migrations for {app_name}: {e}")

project_trees = build_rainer_trees()
paths = {project: path for project, path in RAINER_PROJECTS.items()}
