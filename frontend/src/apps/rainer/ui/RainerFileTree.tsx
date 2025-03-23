import { Button } from "@/components/ui/button";
import { RainerFile } from "@/apps/rainer/models";

export function RainerFileTree({
  file,
  tree,
  onSelect,
}: {
  file: RainerFile;
  tree: Record<string, string>;
  onSelect: (path: string) => void;
}) {
  const groups = groupByDir(tree);
  const { path = "" } = file || {};

  return (
    <div className="space-y-4 pr-2">
      {Object.entries(groups).map(([dir, files]) => (
        <div key={dir}>
          <div className="font-semibold text-sm mb-1">{dir || "./"}</div>
          <div className="pl-2 space-y-1">
            {files.map((file) => {
              const itemPath = `${dir ? dir + "/" : ""}${file}`;
              const isActive = itemPath === path;

              return (
                <Button
                  key={file}
                  variant="ghost"
                  className={`w-full justify-start font-geist-mono ${isActive ? 'border text-foreground font-bold' : 'text-xs'}`}
                  onClick={() => onSelect(itemPath)}
                >
                  {file}
                </Button>
              );
            })}
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
