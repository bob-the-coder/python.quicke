import { Button } from "@/components/ui/button";

export function RainerFileTree({
  tree,
  onSelect,
}: {
  branch: "backend" | "frontend";
  tree: Record<string, string>;
  onSelect: (path: string) => void;
}) {
  const groups = groupByDir(tree);

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([dir, files]) => (
        <div key={dir}>
          <div className="font-semibold text-sm mb-1">{dir || "./"}</div>
          <div className="pl-2 space-y-1">
            {files.map((file) => (
              <Button
                key={file}
                variant="ghost"
                className="w-full justify-start font-mono text-xs"
                onClick={() => onSelect(`${dir ? dir + "/" : ""}${file}`)}
              >
                {file}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByDir(tree: Record<string, string>): Record<string, string[]> {
  const groups: Record<string, string[]> = {};

  for (const fullPath of Object.keys(tree)) {
    const parts = fullPath.split("/");
    const file = parts.pop()!;
    const dir = parts.join("/");

    if (!groups[dir]) groups[dir] = [];
    groups[dir].push(file);
  }

  return groups;
}
