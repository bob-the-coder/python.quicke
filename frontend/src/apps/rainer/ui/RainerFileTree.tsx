import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { filteredFilesBySearch } from "@/apps/rainer/ui/RainerFileSearch";
import { FaFile, FaFolder, FaFolderOpen } from "react-icons/fa6";

export function RainerFileTree({
  path = "",
  tree,
  onSelect,
  searchQuery,
}: {
  path: string;
  tree: Record<string, string>;
  onSelect: (path: string) => void;
  searchQuery?: string;
}) {
  const groups = groupByDir(tree);
  const [openDirectories, setOpenDirectories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (searchQuery) {
      Object.keys(groups).forEach((dir) => {
        const files = groups[dir];
        if (dir.includes(searchQuery) || files.some(file => file.includes(searchQuery))) {
          setOpenDirectories((prev) => new Set(prev).add(dir));
        }
      });
    }
  }, [searchQuery, groups]);

  const toggleDirectory = (dir: string) => {
    setOpenDirectories((prev) => {
      const updated = new Set(prev);
      if (updated.has(dir)) {
        updated.delete(dir);
      } else {
        updated.add(dir);
      }
      return updated;
    });
  };

  return (
    <div className="w-full space-y-4 px-2">
      {Object.entries(groups).map(([dir, files]) => {
        const filteredFiles = filteredFilesBySearch(files, searchQuery);
        const isOpen = openDirectories.has(dir);
        const Icon = isOpen ? FaFolderOpen : FaFolder;

        return (
          filteredFiles.length > 0 && (
            <div key={dir}>
              <div
                className="font-semibold text-sm pl-2 rounded-sm mb-1 flex items-center select-none cursor-pointer hover:bg-foreground/5 py-1"
                onClick={() => toggleDirectory(dir)}
              >
                <Icon
                  className={cn(
                    "mr-2",
                    isOpen ? "text-foreground" : "text-muted-foreground"
                  )}
                />
                {dir || "./"}
              </div>
              {isOpen && (
                <div className="pl-2 space-y-1">
                  {filteredFiles.map((file) => {
                    const itemPath = `${dir ? dir + "/" : ""}${file}`;
                    const isActive = itemPath === path;

                    return (
                      <Button
                        key={file}
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full pl-3 pr-12 py-1 justify-start font-geist-mono overflow-hidden",
                          "select-none text-ellipsis flex items-center",
                          isActive ? "font-bold" : "text-xs"
                        )}
                        onClick={() => onSelect(itemPath)}
                      >
                        <FaFile />
                        {file}
                      </Button>
                    );
                  })}
                </div>
              )}
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
