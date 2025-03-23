import { Button } from "@/components/ui/button";
import { RainerFile } from "@/apps/rainer/models";
import { cn } from "@/lib/utils";

export function RainerFileTree({
  file,
  tree,
  onSelect,
  searchQuery,
}: {
  file: RainerFile;
  tree: Record<string, string>;
  onSelect: (path: string) => void;
  searchQuery?: string; // Optional search query parameter
}) {
  const groups = groupByDir(tree);
  const { path = "" } = file || "";

  // Create a regex from the searchQuery if provided, or use null
  let regex: RegExp | null = null;
  if (searchQuery) {
    try {
      regex = new RegExp(searchQuery, 'i'); // Validate and create regex
    } catch {
      regex = null; // If regex is invalid, fallback to substring search
    }
  }

  return (
    <div className="space-y-4 pr-2 ml-4">
      {Object.entries(groups).map(([dir, files]) => {
        // Filter files based on search regex if regex is defined
        const filteredFiles = regex
          ? files.filter(file => regex.test(file))
          : files.filter(file => file.includes(searchQuery || "")); // Fallback to substring search

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
