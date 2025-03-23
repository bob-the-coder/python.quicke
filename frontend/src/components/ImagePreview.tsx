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

export function ImagePreview(props: {
    image_url: string,
    title?: string,
    description?: string,
    children: ReactNode
}) {
    const {image_url, title, description} = props;

    return (
        <Dialog key={image_url}>
            <DialogTrigger asChild={true}>
                <div className={'relative w-full h-full'}>
                    {props.children}
                    <div
                        className="opacity-0 cursor-pointer group-hover:opacity-100 transition z-2 absolute top-0 w-full h-full bg-background/50 flex-center">
                        View image
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className={'max-w-[640px] flex-shrink-0'}>
                {title && (
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            {description || 'No description'}
                        </DialogDescription>
                    </DialogHeader>
                )}
                <img className={'relative'} src={image_url} alt={''}/>

                <DialogFooter>
                    <DialogTrigger asChild={true}>
                        <Button>Close</Button>
                    </DialogTrigger>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}