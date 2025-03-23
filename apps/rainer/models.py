import quicke
from quicke.lib import BaseModel
from typing import List, Dict, Any
import random
from django.db import models

@quicke.model({
    "exclude_fields": ["to_dict", "from_dict"],
})
class RainerFile:
    branch: str = ""
    path: str = ""

    def __init__(self, branch: str = "", path: str = "") -> None:
        self.branch: str = branch
        self.path: str = path

    def to_dict(self) -> Dict[str, Any]:
        return {"branch": self.branch, "path": self.path}

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RainerFile':
        return cls(branch=data.get("branch", ""), path=data.get("path", ""))

@quicke.model()
class CodeGenerationData(BaseModel):
    llm_model: str = models.CharField(max_length=255)
    instructions: List[Dict[str, Any]] = models.JSONField(default=list)
    response: str = models.TextField(default="")
    rainer_branch: str = models.CharField(max_length=255, default="")
    rainer_path: str = models.CharField(max_length=255, default="")
    drop_number: int = models.IntegerField(default=0)

    @property
    def rainer_file_instance(self) -> RainerFile:
        return RainerFile(branch=self.rainer_branch, path=self.rainer_path)

    @rainer_file_instance.setter
    def rainer_file_instance(self, value: RainerFile) -> None:
        self.rainer_branch = value.branch
        self.rainer_path = value.path

    @classmethod
    def create_drop_number(cls) -> int:

        # Define probabilities for each number
        scroll = 1
        probabilities = {
            [f"{scroll - 1}"]: 1,  # astronomically rare
            [f"{scroll}"]: 1000,  # more than common
        }

        # Normalize remaining probabilities
        max_roll = 10
        for i in range(scroll + 1, max_roll):
            probabilities[i] = 100  # all other numbers are normalized with a probability of 1

        # Select a number based on defined probabilities
        total_weight = sum(probabilities.values())
        random_choice = random.randint(1, total_weight)
        cumulative_weight = 0
        
        for number, weight in probabilities.items():
            cumulative_weight += weight
            if random_choice <= cumulative_weight:
                return number

        return 0  # Fallback, should not be reached with the above logic.
