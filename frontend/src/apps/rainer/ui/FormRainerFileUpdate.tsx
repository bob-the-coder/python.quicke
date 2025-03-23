// components/FormRainerFileUpdate.tsx

"use client";

import {ReactNode, useState} from "react";
import {useRainer} from "@/apps/rainer/hooks";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Label} from "@/components/ui/label";
import {RiSparkling2Fill} from "react-icons/ri";

type Props = {
    branch: "backend" | "frontend";
    path: string;
    children: ReactNode;
};

export function FormRainerFileUpdate({branch, path, children}: Props) {
    const { updateFile} = useRainer();

    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [localText, setLocalText] = useState("");

    const handleSave = async () => {
        setPending(true);
        updateFile({branch, path, content: localText});
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-[600px] space-y-4" align="start">
                <div className="flex flex-col gap-2 pb-3">
                    <b className="font-bold text-foreground">REFACTOR</b>
                    <div className="flex items-center gap-2">
                        <Badge className="text-sm" variant={'outline'}>{branch}</Badge>
                        <span className="text-sm font-mono">{path}</span>
                    </div>
                </div>
                <div className="grid gap-1">
                    <Label htmlFor="update-textarea" className="text-xs">Instructions</Label>
                    <textarea
                        id="update-textarea"
                        className="h-64 p-4 font-mono text-sm border rounded-md"
                        placeholder={"Write your custom instruction here"}
                        value={localText}
                        onChange={(e) => setLocalText(e.target.value)}
                    />
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={pending}>
                        Refactor <RiSparkling2Fill />
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
