"use client";

import { useState, useEffect } from "react";
import { useRainer } from "@/apps/rainer/hooks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RainerFilePicker } from "@/apps/rainer/ui/RainerFilePicker";
import { FormRainerFileUpdate } from "@/apps/rainer/ui/FormRainerFileUpdate";
import { RainerFileTree } from "@/apps/rainer/ui/RainerFileTree";
import { useLocation, useNavigate } from "react-router-dom";
import { ScrollbarCustom } from "@/components/ScrollbarCustom";
import { CopyToClipboard } from "@/components/CopyToClipboard";
import { CreateFileModal } from "@/apps/rainer/ui/CreateFileModal"; // Import CreateFileModal

export default function RainerDashboard() {
    const { search } = useLocation(); // Get the current query parameters from the URL
    const navigate = useNavigate(); // Hook to programmatically navigate
    const ts = new Date().getTime(); // Timestamp for forced component refresh

    // Extract query parameters for "branch" and "path"
    const queryParams = new URLSearchParams(search);
    const initialBranch = (queryParams.get("b") as "backend" | "frontend") || "backend"; // Default to "backend"
    const initialPath = queryParams.get("p") || null; // Initial path can be null

    // State for the selected branch and file path
    const [selectedBranch, setSelectedBranch] = useState<"backend" | "frontend">(initialBranch);
    const [selectedPath, setSelectedPath] = useState<string | null>(initialPath);
    const { getTree } = useRainer(); // Hook to interact with the Rainer API

    const fileQuery = useFileHook({ branch: selectedBranch, path: selectedPath }); // Hook to fetch file data

    // Function to handle file selection
    const handleSelectFile = (path: string) => {
        setSelectedPath(path); // Update selected path
        navigate({ search: `?b=${selectedBranch}&p=${path}` }, { replace: true }); // Update URL query params
    };

    // Update the URL when branch or path state changes
    useEffect(() => {
        if (selectedBranch !== initialBranch || selectedPath !== initialPath) {
            navigate({ search: `?b=${selectedBranch}&p=${selectedPath}` }, { replace: true });
        }
    }, [selectedBranch, selectedPath, navigate, initialBranch, initialPath]);

    return (
        <div className="grid grid-cols-[300px_1fr] h-screen">
            <aside className="border-r border-muted p-4 overflow-y-auto">
                <Tabs
                    value={selectedBranch} // Controlled component for branch manipulation
                    onValueChange={(v) => {
                        setSelectedBranch(v as "backend" | "frontend");
                        setSelectedPath(null); // Reset file path on branch change
                        navigate({ search: `?b=${v}&p=` }, { replace: true }); // Update URL query params
                    }}
                >
                    <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="backend">Backend</TabsTrigger>
                        <TabsTrigger value="frontend">Frontend</TabsTrigger>
                    </TabsList>

                    <div className="flex gap-2 items-center w-full ">
                        <RainerFilePicker
                            branch={selectedBranch}
                            value={selectedPath ? { branch: selectedBranch, path: selectedPath } : undefined}
                            onChange={(val) => handleSelectFile(val.path)} // Handle file selection
                        />
                        <CreateFileModal branch={selectedBranch} /> {/* Pass selected branch to CreateFileModal */}
                    </div>

                    {/* Backend Content */}
                    <TabsContent value="backend">
                        <ScrollArea className="h-full pr-2 space-y-6">
                            <RainerFileTree
                                file={{ branch: selectedBranch, path: selectedPath || '' }}
                                tree={getTree?.backend || {}} // Use the backend file tree
                                onSelect={handleSelectFile} // Pass file selection handler
                            />
                        </ScrollArea>
                    </TabsContent>

                    {/* Frontend Content */}
                    <TabsContent value="frontend">
                        <ScrollArea className="h-full pr-2 space-y-6">
                            <RainerFileTree
                                file={{ branch: selectedBranch, path: selectedPath || '' }}
                                tree={getTree?.frontend || {}} // Use the frontend file tree
                                onSelect={handleSelectFile} // Pass file selection handler
                            />
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </aside>

            {/* Main content area */}
            <main className="h-full flex">
                {selectedPath ? (
                    <div className="h-full flex w-full">
                        <div className="flex-1 flex flex-col">
                            <h1 className="typo-h1 p-4 px-6 border-b flex items-center gap-4">
                                <Badge className="text-xl">{selectedBranch}</Badge>
                                {selectedPath}
                            </h1>
                            <div className="h-full w-full p-2">
                                <ScrollbarCustom>
                                    <div className="relative w-full flex flex-col">
                                        {!!fileQuery.data && (
                                            <CopyToClipboard className={"self-end -mb-10 sticky z-2 top-4 right-4"} text={fileQuery.data} />
                                        )}
                                        <p className="p-4 w-full whitespace-pre font-geist-mono text-sm text-muted-foreground">
                                            {fileQuery.data} {/* Display the content of the selected file */}
                                        </p>
                                    </div>
                                </ScrollbarCustom>
                            </div>
                        </div>
                        <div className="w-1/4 border-l border-muted">
                            <FormRainerFileUpdate key={ts} branch={selectedBranch} path={selectedPath} /> {/* File edit form */}
                        </div>
                    </div>
                ) : (
                    <div className="text-muted-foreground text-sm flex-center w-full">
                        Select a file to view/edit
                    </div>
                )}
            </main>
        </div>
    );
}

// Custom hook to handle file fetching
function useFileHook({ branch, path }: { branch: string; path: string | null }) {
    const { getFile } = useRainer(); // Hook to interact with the Rainer API
    const query = getFile({ branch, path: path ?? "" }); // Fetch the file data
    const [localValue, setLocalValue] = useState(""); // Local state for file content

    // Effect to update local value when the file data changes
    useEffect(() => {
        if (query.data !== undefined) setLocalValue(query.data);
    }, [query.data]);

    return {
        data: localValue, // Expose local file content
        set: setLocalValue, // Function to update local file content
    };
}
