import random
from typing import List, Dict, Any

from django.db import models

import quicke
from quicke.lib import BaseModel
from rainer import RainerFile


@quicke.model()
class CodeGenerationData(BaseModel):
    llm_model: str = models.CharField(max_length=255)
    instructions: List[Dict[str, str]] = models.JSONField(default=list)
    response: str = models.TextField(default="")
    rainer_project: str = models.CharField(max_length=255, default="")
    rainer_path: str = models.CharField(max_length=255, default="")
    drop_number: int = models.IntegerField(default=0)

    class Meta:
        ordering = ("-created_at", "rainer_project", "rainer_path", "llm_model")

    @property
    def rainer_file_instance(self) -> RainerFile:
        return RainerFile(project=self.rainer_project, path=self.rainer_path)

    @rainer_file_instance.setter
    def rainer_file_instance(self, value: RainerFile) -> None:
        self.rainer_project = value.project
        self.rainer_path = value.path

    @classmethod
    def create_drop_number(cls) -> int:
        scroll = 1

        # Define probabilities for each number
        probabilities = {
            scroll - 1: 1,  # astronomically rare
            scroll: 1000,  # more than common
        }

        # Normalize remaining probabilities
        max_roll = 10
        for i in range(scroll + 1, max_roll + 1):
            probabilities[i] = 100  # all other numbers are normalized with a probability of 100

        # Select a number based on defined probabilities
        total_weight = sum(probabilities.values())
        random_choice = random.randint(1, total_weight)
        cumulative_weight = 0

        for number, weight in probabilities.items():
            cumulative_weight += weight
            if random_choice <= cumulative_weight:
                return number

        return 0  # Fallback, should not be reached



@quicke.model({
    "exclude_fields": ["to_dict", "from_dict"],
})
class RainerFile:
    project: str = ""
    path: str = ""
