import {useState, useEffect} from "react";
import {cn} from "@/lib/utils";
import {FaFile, FaFolder, FaFolderOpen} from "react-icons/fa6";
import {ProjectTree} from "@/apps/rainer/types";

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

    useEffect(() => {
        if (searchQuery) {
            Object.keys(tree).forEach((key) => {
                if (
                    key.includes(searchQuery) ||
                    (typeof tree[key] === "object" &&
                        Object.keys(tree[key] as ProjectTree).some((sub) => sub.includes(searchQuery)))
                ) {
                    setOpenDirectories((prev) => new Set(prev).add(key));
                }
            });
        }
    }, [searchQuery, tree]);

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
            {Object.entries(tree)
                .filter(([name]) => name !== "__path__") // Ignore __path__
                .sort(([aKey, aValue], [bKey, bValue]) => {
                    const aIsDir = typeof aValue === "object";
                    const bIsDir = typeof bValue === "object";
                    if (aIsDir === bIsDir) return aKey.localeCompare(bKey); // Sort alphabetically if same type
                    return aIsDir ? -1 : 1; // Directories first, then files
                })
                .map(([name, value]) => {
                    const itemPath = basePath ? `${basePath}/${name}` : name;
                    const isDirectory = typeof value === "object";
                    const isOpen = openDirectories.has(itemPath);
                    const Icon = isDirectory ? (isOpen ? FaFolderOpen : FaFolder) : FaFile;

                    return (
                        <div key={name} className={cn("select-none", !isDirectory && "first:border-t")}>
                            <div
                                className={cn(
                                    "flex items-center pl-2 space-x-2 py-1 text-sm cursor-pointer select-none hover:bg-foreground/5 rounded-sm",
                                )}
                                onClick={() => (isDirectory ? toggleDirectory(itemPath) : onSelect(itemPath))}
                            >
                                <Icon className="text-muted-foreground"/>
                                <span>{name}</span>
                            </div>
                            {isDirectory && isOpen && (
                                <div className="ml-3.5 border-l">
                                    <RainerFileTree tree={value as ProjectTree} onSelect={onSelect}
                                                    basePath={itemPath}/>
                                </div>
                            )}
                        </div>
                    );
                })}
        </div>
    );
}
