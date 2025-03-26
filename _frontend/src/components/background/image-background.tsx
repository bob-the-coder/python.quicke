import React from 'react'

import './image-background.scss'
import {serverUrl} from "@/services/server-url";
import {cn} from "@/lib/utils";

export default function ImageBackground(props: {
    url?: string,
    className?: string,
    onClick?: () => void,
    noOverlay?: boolean
}) {
    const url = props.url;

    return (
        <div key={url} className={cn("absolute inset-0 full", props.className)} onClick={props.onClick}>
            {url && <img src={url} alt=" " className={'w-full h-full object-cover'}/>}
            <div className={props.noOverlay ? '' : 'bg-foreground/5'}/>
        </div>
    )
}
