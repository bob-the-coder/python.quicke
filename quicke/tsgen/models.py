from typing import Type, Dict, Union, List, Tuple

from django.db import models

from quicke.tsgen.codegen import generate_ts_imports
from quicke.lib import ensure_file, parse_ts_import, BaseModel

Routes = Dict[str, Union[Type[BaseModel], "Routes", Tuple[Type[BaseModel], List[str]]]]

class quickeModels:
    ts_imports: List[Dict[str, Union[str, List[str], None]]] = []

    def __init__(self, ts_models: List[Type[BaseModel]] = None, options: Dict = dict):
        self.ts_models = ts_models or []
        self.base_path = options.get("base_path", "")
        self.ts_imports = []

    def generate_typescript(self, output_path: str):
        output_path = ensure_file(output_path)

        ts_code = self._generate_typescript_code()
        with open(output_path, "w", encoding="utf-8") as ts_file:
            ts_file.write(ts_code)

        print(f"✅ TypeScript models saved to {output_path}")
        return output_path


    def _get_ts_imports(self, field: models.Field) -> None:
        ts_field = getattr(field, "ts_field", None)
        if not ts_field:
            return

        imports = list(ts_field.get("imports", []))

        for ts_import in imports:
            if not ts_import:
                continue

            parse_ts_import(self.base_path, self.ts_imports, ts_import)


    def _generate_typescript_code(self) -> str:
        models_ts = "".join([
            self._generate_typescript_model(model)
            for model in self.ts_models
        ])

        ts_imports = generate_ts_imports(self.ts_imports).strip()

        return f"{ts_imports}\n\n" + models_ts

    def _generate_typescript_model(self, model: Type[BaseModel]) -> str:
        ts_fields = []

        for field in model._meta.get_fields():
            name = field.name
            self._get_ts_imports(field)

            ts_field = getattr(field, "ts_field", None)
            if ts_field and (ts_type := ts_field.get("type", "")):
                ts_fields.append(f"{name}: {ts_type};")
                continue

            if isinstance(field, models.ForeignKey):
                related_model = field.related_model.__name__
                ts_fields.append(f"{name}?: {related_model};")
            elif isinstance(field, models.ManyToManyField):
                related_model = field.related_model.__name__
                ts_fields.append(f"{name}: {related_model}[] = [];")
            elif isinstance(field, models.ForeignObjectRel):
                related_model = field.related_model.__name__
                ts_fields.append(f"{name}?: {related_model}[];")
            elif isinstance(field, (models.CharField, models.TextField)):
                ts_fields.append(f"{name}: string = '';")
            elif isinstance(field, (models.IntegerField, models.FloatField, models.DecimalField)):
                ts_fields.append(f"{name}: number = 0;")
            elif isinstance(field, models.BooleanField):
                ts_fields.append(f"{name}: boolean = false;")
            elif isinstance(field, models.DateTimeField):
                ts_fields.append(f"{name}: Date = new Date();")
            elif isinstance(field, models.UUIDField):
                ts_fields.append(f"{name}: string = ''; // UUID")
            else:
                ts_fields.append(f"{name}: any;")


        return f"""
export class {model.__name__} {{
\t{"\n\t".join(ts_fields)}
}}"""
