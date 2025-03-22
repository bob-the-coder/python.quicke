import json
import tomli_w as toml
import configparser
from django.core.management.base import BaseCommand
from quicke import APP_REGISTRY


class Command(BaseCommand):
    help = "Print structured dump of a given app's models or endpoints in JSON, TOML, INI, or Markdown"

    def add_arguments(self, parser):
        parser.add_argument("app_name", type=str, help="The name of the Django app to dump data from APP_REGISTRY")
        parser.add_argument("-m", "--models", action="store_true", help="Include models in output")
        parser.add_argument("-e", "--endpoints", action="store_true", help="Include endpoints in output")
        parser.add_argument("--toml", action="store_true", help="Render output as TOML instead of JSON")
        parser.add_argument("--ini", action="store_true", help="Render output as INI instead of JSON")
        parser.add_argument("--md", action="store_true", help="Render output as Markdown instead of JSON")

    def handle(self, *args, **options):
        app_name = options["app_name"]

        if app_name not in APP_REGISTRY:
            self.stderr.write(self.style.ERROR(f"❌ No registered app with name '{app_name}' in APP_REGISTRY"))
            return

        app_data = APP_REGISTRY.get(app_name, {})
        output_data = {}

        if options["models"]:
            output_data["models"] = app_data.get("models", {})
            output_data["model_imports"] = app_data.get("model_imports", {})

        elif options["endpoints"]:
            output_data["endpoints"] = app_data.get("endpoints", {})
            output_data["endpoint_imports"] = app_data.get("endpoint_imports", {})

        else:
            output_data = app_data  # Default: output full app registry entry

        if options["toml"]:
            self.stdout.write(toml.dumps(output_data))

        elif options["ini"]:
            config = configparser.ConfigParser()
            for section, values in output_data.items():
                config[section] = {k: ", ".join(v) if isinstance(v, list) else str(v) for k, v in values.items()}
            with open("output.ini", "w") as f:
                config.write(f)
            self.stdout.write("✅ INI output saved to output.ini")

        elif options["md"]:
            md_output = []
            for section, values in output_data.items():
                md_output.append(f"## {section.capitalize()}")
                if isinstance(values, dict):
                    for key, val in values.items():
                        if isinstance(val, list):
                            md_output.append(f"- **{key}**: {', '.join(val)}")
                        else:
                            md_output.append(f"- **{key}**: {val}")
                md_output.append("")
            self.stdout.write("\n".join(md_output))

        else:
            json_output = json.dumps(output_data, indent=4)
            self.stdout.write(json_output)
