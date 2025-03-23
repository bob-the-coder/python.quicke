import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {filteredFilesBySearch} from "@/apps/rainer/ui/RainerFileSearch";

export function RainerFileTree({
  path = "",
  tree,
  onSelect,
  searchQuery,
}: {
  path: string;
  tree: Record<string, string>;
  onSelect: (path: string) => void;
  searchQuery?: string; // Optional search query parameter
}) {
  const groups = groupByDir(tree);

  return (
    <div className="w-full space-y-4 pr-2 ml-4">
      {Object.entries(groups).map(([dir, files]) => {
        // Use filteredFilesBySearch to filter files
        const filteredFiles = filteredFilesBySearch(files, searchQuery);

        return (
          filteredFiles.length > 0 && (
            <div key={dir}>
              <div className="font-semibold text-sm mb-1">{dir || "./"}</div>
              <div className="pl-2 space-y-1">
                {filteredFiles.map(file => {
                  const itemPath = `${dir ? dir + "/" : ""}${file}`;
                  const isActive = itemPath === path;

                  return (
                    <Button
                      key={file}
                      variant="ghost"
                      className={cn(
                        "w-full pr-12 justify-start font-geist-mono overflow-hidden text-ellipsis",
                        isActive ? 'border text-foreground font-bold' : 'text-xs',
                      )}
                      onClick={() => onSelect(itemPath)}
                    >
                      {file}
                    </Button>
                  );
                })}
              </div>
            </div>
          )
        );
      })}
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
