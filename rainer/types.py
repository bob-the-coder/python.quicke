from typing import Any, Dict


class RainerFile:
    project: str = ""
    path: str = ""

    def __init__(self, branch: str = "", path: str = "") -> None:
        self.project: str = branch
        self.path: str = path

    def __str__(self) -> str:
        return f"RainerFile({self.project}, {self.path})"

    def to_dict(self) -> Dict[str, Any]:
        return {"branch": self.project, "path": self.path}

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RainerFile':
        return cls(branch=data.get("branch", ""), path=data.get("path", ""))