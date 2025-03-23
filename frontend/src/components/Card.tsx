import React, {ReactNode} from "react";
import {cn} from "@/lib/utils";

export function Card(props: {
    className?: string;
    children: ReactNode | ReactNode[],
    thumbnailUrl?: string,
    onClick?: () => void,
}) {
    return (
        <div className={cn('relative w-full flex-col cursor-pointer group', props.className)} // 'group' class here
             onClick={props.onClick}>
            {props?.hasOwnProperty('thumbnailUrl') && (
                <CardThumbnail url={props.thumbnailUrl}/>
            )}
            {props.children}
        </div>
    )
}

export function CardThumbnail(props: {
    url?: string
}) {
    return (
        <div
            className={'relative w-full rounded-xl bg-foreground/5 group-hover:bg-foreground/10 overflow-hidden transition'} // 'group-hover' used here
            style={{height: 120}}>
            <img key={props.url} src={props.url} alt=" " className={'full object-cover'}/>
            <div className="absolute inset-0 flex full bg-background/50 z-[1]"/>
        </div>
    )
}
