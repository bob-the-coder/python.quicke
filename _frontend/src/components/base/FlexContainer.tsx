import React, {
    ForwardedRef,
    forwardRef,
    HTMLAttributes,
    useCallback,
    useRef
} from 'react'

import {cn} from "@/lib/utils";


export type ContainerRef = ForwardedRef<HTMLDivElement>;

export type TContainerProps = HTMLAttributes<HTMLDivElement> & {
    onSwipe?: (direction: 'left' | 'right') => void
}

const FlexContainer = forwardRef(function (props: TContainerProps, ref: ForwardedRef<HTMLDivElement | undefined>) {
    const {className, onSwipe, ...baseProps} = props;

    const elementRef = ref;
    const swipeData = useRef({touchStartX: 0});

    const handleTouchStart = useCallback((event: React.TouchEvent | React.MouseEvent) => {
        //@ts-ignore
        if (!elementRef?.current || !props.onSwipe) return;

        //@ts-ignore
        if (event.touches?.length === 1) {
            //@ts-ignore
            elementRef.current.dataset.touchStartX = event.touches[0].clientX;
        }
    }, [elementRef, swipeData, props.onSwipe]);

    const handleTouchEnd = useCallback((event: React.TouchEvent | React.MouseEvent) => {
        //@ts-ignore
        if (!elementRef?.current || !props.onSwipe) return;
        //@ts-ignore
        if (event.changedTouches?.length !== 1) return;

        //@ts-ignore
        const touchEndX = event.changedTouches[0].clientX;
        //@ts-ignore
        const touchStartX = elementRef.current.dataset.touchStartX;
        const deltaX = touchEndX - touchStartX;
        const minSwipeDistance = 50;

        if (deltaX > minSwipeDistance) {
            props.onSwipe('right'); // Right swipe
        } else if (deltaX < -minSwipeDistance) {
            props.onSwipe('left'); // Left swipe
        }
    }, [elementRef, swipeData, props.onSwipe]);


    return (
        <div {...baseProps}
             className={cn('flex ', className)}
             ref={elementRef as ForwardedRef<HTMLDivElement>}
             onTouchStart={handleTouchStart}
             onTouchEnd={handleTouchEnd}
             onMouseDown={handleTouchStart}
             onMouseUp={handleTouchEnd}>
            {props.children}
        </div>
    )
});

export const Container = {
    Landscape: forwardRef((props: TContainerProps, ref: ContainerRef) => (
        <FlexContainer
            {...props}
            ref={ref}
        />
    )),
    Portrait: forwardRef((props: TContainerProps, ref: ContainerRef) => (
        <FlexContainer
            {...props}
            ref={ref}
            className={cn('flex-col ', props.className)}
        />
    )),
}

export const HorizontalScroll = forwardRef((props: TContainerProps, ref: ContainerRef) => (
    <div {...props}
         ref={ref}
         className={`relative w-full max-w-full scroll-snap-x overflow-x-auto overflow-y-hidden shrink ${props.className || ''}`}/>
));
