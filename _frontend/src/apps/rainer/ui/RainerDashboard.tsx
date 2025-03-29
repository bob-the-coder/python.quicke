
"use client";

import {useState, useEffect} from "react";
import {useRainer, useRainerProject} from "@/apps/rainer/hooks";
import {FormRainerFileUpdate} from "@/apps/rainer/ui/FormRainerFileUpdate";
import {RainerFileTree} from "@/apps/rainer/ui/RainerFileTree";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {ScrollbarCustom} from "@/components/ScrollbarCustom";
import {CopyToClipboard} from "@/components/CopyToClipboard";
import {CreateFileModal} from "@/apps/rainer/ui/CreateFileModal";
import {BiSearch} from "react-icons/bi";
import RainerFileDrops from "@/apps/rainer/ui/RainerFileDrops"; 
import TextInput from "@/components/TextInput/TextInput";
import {FaFile, FaMinus, FaPlus} from "react-icons/fa6"; 
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {cn} from "@/lib/utils";

export default function RainerDashboard() {

    const {project, setProject} = useRainerProject(); 
    const {getTree} = useRainer(); 
    const projects = Object.keys(getTree || {});

    const {search} = useLocation();
    const navigate = useNavigate(); 
    const ts = new Date().getTime(); 

    const queryParams = new URLSearchParams(search);
    const initialProject = (queryParams.get("b")) || projects[0];
    const initialPath = queryParams.get("p") || ""; 

    const [selectedPath, setSelectedPath] = useState<string>(initialPath);
    const [searchQuery, setSearchQuery] = useState<string>(''); 

    const fileQuery = useFileHook({project: project, path: selectedPath}); 

    const handleSelectFile = (path: string) => {
        setSelectedPath(path); 
        navigate({search: `?b=${project}&p=${path}`}, {replace: true}); 
    };

    useEffect(() => {
        if (project !== initialProject || selectedPath !== initialPath) {
            navigate({search: `?b=${project}&p=${selectedPath}`}, {replace: true});
        }
    }, [project, selectedPath, navigate, initialProject, initialPath]);

    useEffect(() => {
        if (!getTree) return;
        if (project) return;
        setProject(projects[0]);
    }, [getTree, project, projects]);

    const changeProject = (project: string) => {
        setProject(project);
        setSelectedPath(""); 
        setSearchQuery(''); 
        navigate({search: `?b=${project}&p=`}, {replace: true});
    }

    if (!getTree) return "No projects"

    return (
        <div className="grid grid-cols-[300px_1fr] h-screen">
            <div className="border-r border-muted h-full flex flex-col">
                <div className="w-full flex items-center justify-between p-4 border-b">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="border rounded px-4">{project}</DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {projects.map((proj) => (
                                <DropdownMenuItem key={proj} onClick={() => changeProject(proj)}>
                                    {proj}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex gap-2">
                        <Button>Tasks</Button>
                        <Button>Settings</Button>
                    </div>
                </div>

                <div className="flex w-full items-center gap-3 p-2 border-b">
                    <TextInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search files..."
                        className="w-full ml-0.5 -ml2"
                        inputProps={{className: "border-none"}}
                        icon={<BiSearch className={'flex-shrink-0 text-lg'}/>}
                    />
                    <CreateFileModal/> 
                </div>

                <div className="w-full h-full p-2">
                    <ScrollbarCustom noScrollX={true}>
                        <div className="flex-1 pt-2"/>
                        <RainerFileTree
                            tree={getTree[project] || {}} 
                            onSelect={handleSelectFile} 
                            searchQuery={searchQuery} 
                        />
                        <div className="flex-1 pt-80"/>
                    </ScrollbarCustom>
                </div>
            </div>

            <main className="h-full flex">
                {selectedPath ? (
                    <div className="h-full flex w-full">
                        <div className="flex-1 flex flex-col">
                            <h1 className="typo-h1 p-4 px-6 border-b flex items-center gap-4 relative font-geist-mono">
                                <FaFile/>
                                {selectedPath}
                                <div className="absolute right-0">
                                    <RainerFileDrops file={{
                                        project: project,
                                        path: selectedPath
                                    }}/> 
                                </div>
                            </h1>
                            <div className="h-full w-full p-2">
                                <ScrollbarCustom>
                                    {isPublicImage(selectedPath) ? <ImageView project={project} path={selectedPath}/> :
                                        <TextView text={fileQuery.data}/>}
                                </ScrollbarCustom>
                            </div>
                        </div>
                        <div className="w-1/4 border-l border-muted">
                            <FormRainerFileUpdate key={ts} project={project}
                                                  path={selectedPath}/> 
                        </div>
                    </div>
                ) : (
                    <div className="text-muted-foreground text-sm flex-center w-full">
                        Select a file to view/edit 📂
                    </div>
                )}
            </main>
        </div>
    );
}

function isPublicImage(file: string) {
    return (file.match(/\.(jpe?g|png|webp|tiff?|gif)$/g)?.length || 0) > 0;
}

const zoomLevels = [
    50,
    75,
    100,
    125,
    150,
    175,
    200,
];

function ImageView({project, path}: { project: string; path: string }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const zoom = parseInt(searchParams.get("i_zoom") || "2", 10);

    const updateZoom = (level: number) => {
        setSearchParams(q => {
            q.set("i_zoom", level.toString(10))
            return q;
        }, {replace: true});
    }

    const decreaseZoom = () => {
        if (zoom > 0) updateZoom(zoom - 1);
    };

    const increaseZoom = () => {
        if (zoom < zoomLevels.length - 1) updateZoom(zoom + 1);
    };

    const url = `${import.meta.env.VITE_QUICKE_API_ROOT}/rainer/file?project=${project}&path=${path}`

    return (
        <div className="w-full p-4 relative flex flex-col">
            <div className="w-fit h-fit relative">
                <img src={url} alt={url} className={cn('w-fit h-auto opacity-0')}/>
                <div className={"absolute top-0 left-0"} style={{width: `${zoomLevels[zoom]}%`}}>
                    <img src={url} alt={url} className={cn('w-full h-auto rounded-lg overflow-hidden')}/>
                </div>
            </div>
            <div className="fixed flex flex-col items-center gap-2 -m-2 self-end">
                <Button size={'icon'} className={'shadow-xl shadow-black'} onClick={increaseZoom}
                        disabled={zoom === zoomLevels.length - 1}><FaPlus/></Button>
                <Button size={'icon'} className={'shadow-xl shadow-black'} onClick={decreaseZoom}
                        disabled={zoom === 0}><FaMinus/></Button>
                <span className="text-xs text-muted-foreground font-geist-mono">{zoomLevels[zoom]}%</span>
            </div>
        </div>
    );
}

function TextView({text}: { text: string }) {
    return (
        <div className="relative w-full flex flex-col">
            {!!text && (
                <CopyToClipboard className={"self-end -mb-10 sticky z-2 top-4 right-4"}
                                 text={text}/>
            )
            }
            <p className="p-4 w-full whitespace-pre font-geist-mono text-sm text-muted-foreground">
                {text} 
            </p>
        </div>
    )
}

function useFileHook({
                         project, path
                     }: {
    project: string;
    path: string | null
}) {
    const {getFile} = useRainer(); 
    const query = getFile({project, path: path ?? ""}); 
    const [localValue, setLocalValue] = useState(""); 

    useEffect(() => {
        if (query.data !== undefined) setLocalValue(query.data);
    }, [query.data]);

    return {
        data: localValue, 
        set: setLocalValue, 
    };
}
