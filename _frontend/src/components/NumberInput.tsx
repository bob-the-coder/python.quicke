import  {ForwardedRef, forwardRef, HTMLAttributes, ReactNode, useCallback, useMemo} from 'react'
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {LuMinus, LuPlus} from "react-icons/lu";
import {Button} from "@/components/ui/button";

const isSafe = (v?: number) => v !== undefined && Number.isSafeInteger(v);

let __instance = Number.MIN_SAFE_INTEGER;
const NumberInput = forwardRef((
    props: Omit<HTMLAttributes<HTMLInputElement>, 'onChange'> & {
        value: number;
        label?: ReactNode,
        incrementBy?: number,
        minValue?: number,
        maxValue?: number,
        loop?: boolean,
        vertical?: boolean,
        onChange?: (value: number) => void,
    },
    ref: ForwardedRef<HTMLInputElement>
) => {
    const {
        value,
        onChange,
        label,
        minValue,
        maxValue,
    } = props;
    const id = props.id || `number_input_${__instance++}`;

    const incrementBy = useMemo(() => {
        const i = props.incrementBy;
        return isSafe(i) && i ? Math.abs(+i!) : 1
    }, [props.incrementBy]);

    const handleChange = useCallback((newValue: number) => {
        if (incrementBy !== 1) newValue = Math.ceil(newValue / incrementBy) * incrementBy;

        if (!onChange) return;
        onChange(newValue);
    }, [onChange, incrementBy]);

    let min = undefined! as number;
    let max = undefined! as number;
    if (isSafe(minValue) && isSafe(maxValue)) {
        [min, max] = minValue! > maxValue!
            ? [maxValue!, minValue!]
            : [minValue!, maxValue!];
    }

    let next = value + incrementBy;
    let prev = value - incrementBy;
    const {loop} = props;
    if (isSafe(max) && next > max) {
        next = (loop && isSafe(min))
            ? min
            : max;
    }

    if (isSafe(min) && prev < min) {
        prev = (loop && isSafe(max))
            ? max
            : min;
    }

    return (
        <div className={`w-full flex flex-col gap-1`}>
            {label && (
                <Label htmlFor={id}>
                    {label}
                </Label>
            )}
            <div className="flex">
                <Button variant={'outline'} size={'icon'} className={'flex-shrink-0 rounded-r-none'}
                                         onClick={() => handleChange(prev)}>
                    <LuMinus/>
                </Button>
                <Input id={id} ref={ref}
                       type={'numeric'}
                       className={'rounded-none text-center'}
                       value={value}
                       onChange={e => handleChange(+e.target.value)}/>
                <Button variant={'outline'} size={'icon'} className={'text-xs flex-shrink-0 rounded-l-none'}
                                         onClick={() => handleChange(next)}>
                    <LuPlus/>
                </Button>
            </div>
        </div>
    )
})


export default NumberInput