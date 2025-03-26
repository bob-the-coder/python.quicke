import React from 'react';

import './screen-background.scss'

export function BackdropIcon(props: {
    children: JSX.Element,
    className?: string
}) {
    let className = 'screen-backdrop-icon';
    if (props.className) className += ` ${props.className}`

    return (
        <div className={className}>
            {props.children}
        </div>
    )
}