import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ReactNode} from "react";
import { ScrollbarCustom } from "./ScrollbarCustom";
import {CopyToClipboard} from "@/components/CopyToClipboard.tsx";

export function TextPreview(props: {
    fullText: ReactNode,
    copyToClipboard?: string,
    title?: ReactNode,
    description?: ReactNode,
    children: ReactNode,
    className?: string,
}) {
    const {fullText, title, description, copyToClipboard} = props;

    return (
        <Dialog >
            <DialogTrigger asChild={true}>
                {props.children}
            </DialogTrigger>
            <DialogContent className={'w-[640px] flex-shrink-0'}>
                {title && (
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            {description || 'No description'}
                        </DialogDescription>
                    </DialogHeader>
                )}
                <ScrollbarCustom style={{height: 400}}>
                    <p className={props.className}>{fullText}</p>
                </ScrollbarCustom>

                <DialogFooter>
                    <CopyToClipboard text={copyToClipboard || fullText}/>
                    <DialogTrigger asChild={true}>
                        <Button>Close</Button>
                    </DialogTrigger>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}