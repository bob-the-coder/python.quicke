import React from "react";
import {FaCheck} from "react-icons/fa6";
import {ButtonProps} from "@/components/ui/button";
import ButtonVariant from "@/components/Button/Button";
import {cn} from "@/lib/utils";

export default function RadioButton(props: ButtonProps & {
    isChecked?: boolean
}) {
    const {isChecked, ...baseProps} = props;
    return (
        <ButtonVariant.Outline {...baseProps} className={cn('relative w-full gap-4', props.className)}>            
            {baseProps.children}
            <FaCheck className={isChecked ? 'opacity-100' : 'opacity-10'} size={12}/>
        </ButtonVariant.Outline>
    )
} 