import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FaFile, FaFolder, FaFolderOpen } from "react-icons/fa6";
import { ProjectTree } from "@/apps/rainer/types";

export function RainerFileTree({
  tree,
  onSelect,
  searchQuery,
  basePath = "",
}: {
  tree: ProjectTree;
  onSelect: (path: string) => void;
  searchQuery?: string;
  basePath?: string;
}) {
  const [openDirectories, setOpenDirectories] = useState<Set<string>>(new Set());
  const [noResults, setNoResults] = useState<boolean>(false);

  useEffect(() => {
    const newOpenDirectories = new Set<string>();
    const results: string[] = [];

    const searchInTree = (node: ProjectTree, path: string) => {
      for (const key in node) {
        const currentPath = `${path}/${key}`;
        if (key.toLowerCase().includes((searchQuery || '').toLowerCase()) || typeof node[key] === "object") {
          results.push(currentPath);
          newOpenDirectories.add(path); // Add parent directory to open if child matches
        }
        if (typeof node[key] === "object") {
          searchInTree(node[key] as ProjectTree, currentPath);
        }
      }
    };

    if (searchQuery) {
      searchInTree(tree, basePath);
      setNoResults(results.length === 0);
    } else {
      setNoResults(false);
    }

    setOpenDirectories(newOpenDirectories);
  }, [searchQuery, tree, basePath]);

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
    <div className="w-full space-y-1 px-2">
      {noResults && (
        <div className="text-red-500">No results found for "{searchQuery}"</div>
      )}
      {Object.entries(tree)
        .filter(([name]) => name !== "__path__")
        .sort(([aKey, aValue], [bKey, bValue]) => {
          const aIsDir = typeof aValue === "object";
          const bIsDir = typeof bValue === "object";
          if (aIsDir === bIsDir) return aKey.localeCompare(bKey);
          return aIsDir ? -1 : 1;
        })
        .map(([name, value]) => {
          const itemPath = basePath ? `${basePath}/${name}` : name;
          const isDirectory = typeof value === "object";
          const isOpen = openDirectories.has(itemPath);
          const Icon = isDirectory ? (isOpen ? FaFolderOpen : FaFolder) : FaFile;

          const highlightedName = searchQuery ? (
            <span>
              {name.split(new RegExp(`(${searchQuery})`, "gi")).map((part, index) =>
                part.toLowerCase() === searchQuery.toLowerCase() ? (
                  <span key={index} className="bg-purple-500 rounded-xs">{part}</span>
                ) : (
                  part
                )
              )}
            </span>
          ) : name;

          return (
            <div key={itemPath} className={cn("select-none")}>
              <div
                className={cn(
                  "flex items-center pl-2 space-x-2 py-1 text-sm cursor-pointer select-none hover:bg-foreground/5 rounded-sm",
                )}
                onClick={() => (isDirectory ? toggleDirectory(itemPath) : onSelect(itemPath))}
              >
                <Icon className="text-muted-foreground" />
                {highlightedName}
              </div>
              {isDirectory && isOpen && (
                <div className="ml-3.5 border-l">
                  <RainerFileTree tree={value as ProjectTree} onSelect={onSelect} basePath={itemPath} searchQuery={searchQuery} />
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
