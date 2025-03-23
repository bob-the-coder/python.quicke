// app/rainer-dashboard.tsx

"use client";

import {useState, useEffect} from "react";
import {useRainer} from "@/apps/rainer/hooks";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import {Badge} from "@/components/ui/badge";
import {RainerFilePicker} from "@/apps/rainer/ui/RainerFilePicker";
import {FormRainerFileUpdate} from "@/apps/rainer/ui/FormRainerFileUpdate";
import {RiSparkling2Fill} from "react-icons/ri";
import {RainerFileTree} from "@/apps/rainer/ui/RainerFileTree";
import {useLocation, useNavigate} from "react-router-dom";

export default function RainerDashboard() {
    const {search} = useLocation();
    const navigate = useNavigate();
    const ts = new Date().getTime();

    const queryParams = new URLSearchParams(search);
    const initialBranch = (queryParams.get("b") as "backend" | "frontend") || "backend";
    const initialPath = queryParams.get("p") || null;

    const [selectedBranch, setSelectedBranch] = useState<"backend" | "frontend">(initialBranch);
    const [selectedPath, setSelectedPath] = useState<string | null>(initialPath);
    const {getTree} = useRainer();

    const fileQuery = useFileHook({branch: selectedBranch, path: selectedPath});

    const handleSelectFile = (path: string) => {
        setSelectedPath(path);
        navigate({search: `?b=${selectedBranch}&p=${path}`}, {replace: true});
    };

    useEffect(() => {
        if (selectedBranch !== initialBranch || selectedPath !== initialPath) {
            navigate({search: `?b=${selectedBranch}&p=${selectedPath}`}, {replace: true});
        }
    }, [selectedBranch, selectedPath, navigate, initialBranch, initialPath]);

    return (
        <div className="grid grid-cols-[300px_1fr] h-screen">
            <aside className="border-r border-muted p-4 overflow-y-auto">
                <Tabs
                    value={selectedBranch}
                    onValueChange={(v) => {
                        setSelectedBranch(v as "backend" | "frontend");
                        setSelectedPath(null);
                        navigate({search: `?b=${v}&p=`}, {replace: true});
                    }}
                >
                    <TabsList className="grid grid-cols-2 mb-4 w-full">
                        <TabsTrigger value="backend">Backend</TabsTrigger>
                        <TabsTrigger value="frontend">Frontend</TabsTrigger>
                    </TabsList>
                    <TabsContent value="backend">
                        <ScrollArea className="h-full pr-2 space-y-6">
                            <div className="flex flex-col gap-4">
                                <RainerFilePicker
                                    branch="backend"
                                    value={selectedPath ? {branch: "backend", path: selectedPath} : undefined}
                                    onChange={(val) => handleSelectFile(val.path)}
                                />
                                <RainerFileTree
                                    branch="backend"
                                    tree={getTree?.backend || {}}
                                    onSelect={handleSelectFile}
                                />
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="frontend">
                        <ScrollArea className="h-full pr-2 space-y-6">
                            <div className="flex flex-col gap-4">
                                <RainerFilePicker
                                    branch="frontend"
                                    value={selectedPath ? {branch: "frontend", path: selectedPath} : undefined}
                                    onChange={(val) => handleSelectFile(val.path)}
                                />
                                <RainerFileTree
                                    branch="frontend"
                                    tree={getTree?.frontend || {}}
                                    onSelect={handleSelectFile}
                                />
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </aside>
            <main className="h-full">
                {selectedPath ? (
                    <div className="h-full flex flex-col">
                        <h1 className="typo-h1 p-4 px-6 border-b flex items-center gap-4">
                            <Badge className="text-xl">{selectedBranch}</Badge>
                            {selectedPath}
                        </h1>
                        <textarea
                            className="p-6 max-h-full h-full w-full resize-none rounded-none border-0 font-mono"
                            value={fileQuery.data || ""}
                            onChange={(e) => fileQuery.set(e.target.value)}
                        />
                        <div className="px-6 py-4 border-t flex justify-between gap-4">
                            <div className="flex gap-4">
                                <FormRainerFileUpdate key={ts} branch={selectedBranch} path={selectedPath}>
                                    <Button variant="outline">
                                        Refactor <RiSparkling2Fill/>
                                    </Button>
                                </FormRainerFileUpdate>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-muted-foreground text-center mt-40 text-sm">
                        Select a file to view/edit
                    </div>
                )}
            </main>
        </div>
    );
}

function useFileHook({branch, path}: { branch: string; path: string | null }) {
    const {getFile} = useRainer();
    const query = getFile({branch, path: path ?? ""});
    const [localValue, setLocalValue] = useState("");

    useEffect(() => {
        if (query.data !== undefined) setLocalValue(query.data);
    }, [query.data]);

    return {
        data: localValue,
        set: setLocalValue,
    };
}
