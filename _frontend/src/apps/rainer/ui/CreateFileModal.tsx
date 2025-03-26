"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormRainerFileCreate } from "./FormRainerFileCreate";
import { RiAddFill } from "react-icons/ri";

export function CreateFileModal() {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);

    return (
        <>
            {/* Simplified Button */}
            <Button onClick={handleOpen}>
                Add File
                <RiAddFill />
            </Button>

            {/* Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl p-0">
                    <div className="h-[70dvh]">
                        <FormRainerFileCreate />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
