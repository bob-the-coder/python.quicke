import RadioButton from "./RadioButton";
import {TContainerProps} from "./base/FlexContainer";
import React, {MouseEventHandler, useCallback} from "react";
import {Signal} from "@/hooks/useSignal";
import {Overlay} from "@/prefabs/container-prefabs";
import {PrefabIcon} from "@/prefabs/icon-prefabs";

export default function RadioOptions<T>(props: {
    valueSignal: Signal<T> | Signal<T | null>,
    options: T[],
    renderAs: (item: { option: T, isChecked: boolean }, index: number) => React.ReactElement,
    canClear?: boolean
} & TContainerProps ) {
    const {valueSignal, options, canClear, renderAs, ...baseProps} = props;
    const render = renderAs ?? (x => <>{x}</>);

    const clear: MouseEventHandler = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!canClear) return;
        valueSignal.value = null;
    }, [canClear, valueSignal]);

    return (
        <div {...baseProps}>
            {options.map((option, i) => {
                const isChecked = option === valueSignal.value;
                return (
                    <RadioButton key={`radio_option_${i}`}
                                 isChecked={isChecked}
                                 className={'justify-between'}
                                 size={'xl'}
                                 onClick={() => valueSignal.value = option}>
                        {render({option, isChecked}, i)}

                        {canClear && isChecked && (
                            <Overlay
                                className={'w-fit h-full right-0 items-center justify-center px-4 z-2 text-primary'}
                                onClick={clear}>
                                <PrefabIcon.Remove size={16}/>
                            </Overlay>
                        )}
                    </RadioButton>
                );
            })}
        </div>
    )
}