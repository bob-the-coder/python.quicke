import React, {ForwardedRef, forwardRef} from 'react'

import {ReactUtility} from "@/lib/react.util";
import {Button, ButtonProps} from "@/components/ui/button"
import createPrefab = ReactUtility.createPrefab;
import {cn} from "@/lib/utils";

const ButtonBase = forwardRef((
    props: ButtonProps & {
        icon?: React.ReactNode,
        iconRight?: React.ReactNode,
        iconLeft?: React.ReactNode,
        isLoading?: boolean
    },
    ref: ForwardedRef<HTMLButtonElement>
) => {
    const {iconLeft, iconRight, icon, isLoading, disabled, ...baseProps} = props;
    const disabledClassName = props.disabled ? 'opacity-50' : '';
    return (
        <Button {...baseProps}
                type={props.type || 'button'}
                ref={ref}
                className={cn('flex items-center gap-2 max-w-full overflow-ellipsis cursor-pointer transition', props.className, disabledClassName)}>
            {props.iconLeft && (
                <div className="flex-col w-fit h-fit flex-shrink-0">
                    {props.iconLeft}
                </div>
            )}

            {props.children}

            {props.isLoading
                ? (
                    <div className="flex flex-col w-fit h-fit flex-shrink-0">
                        <PrefabIcon.LoadingSpinner size={props.size === 'sm' ? 14 : 18}/>
                    </div>
                ) : (props.icon || props.iconRight) ? (
                    <div className="flex-col w-fit h-fit flex-shrink-0">{props.icon ?? props.iconRight}</div>
                ) : <></>}
        </Button>
    )
})

const ButtonVariant = {
    Base: ButtonBase,
    Primary: createPrefab(ButtonBase, {
        variant: 'default'
    }),
    Secondary: createPrefab(ButtonBase, {
        variant: 'secondary'
    }),
    Outline: createPrefab(ButtonBase, {
        variant: 'outline'
    }),
    Ghost: createPrefab(ButtonBase, {
        variant: 'ghost'
    }),
    Fancy: createPrefab(ButtonBase, {
        variant: 'fancy'
    }),
    Destructive: createPrefab(ButtonBase, {
        variant: 'destructive'
    }),
}

export default ButtonVariant