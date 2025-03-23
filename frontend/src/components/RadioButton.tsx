import {FaCheck} from "react-icons/fa6";
import {Button, ButtonProps} from "@/components/ui/button";
import {cn} from "@/lib/utils";

export default function RadioButton(props: ButtonProps & {
    isChecked?: boolean
}) {
    const {isChecked, ...baseProps} = props;
    return (
        <Button {...baseProps} variant={'outline'} className={cn('relative w-full gap-4', props.className)}>
            {baseProps.children}
            <FaCheck className={isChecked ? 'opacity-100' : 'opacity-10'} size={12}/>
        </Button>
    )
} 