"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormRainerFileCreate } from "./FormRainerFileCreate";
import {MdOutlineAdd} from "react-icons/md";

export function CreateFileModal() {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);

    return (
        <>
            {/* Simplified Button */}
            <Button onClick={handleOpen} size={'icon'} className={'flex text-lg'}>
                <MdOutlineAdd />
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
