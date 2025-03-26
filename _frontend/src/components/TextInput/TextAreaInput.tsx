import {ForwardedRef, forwardRef, useCallback} from 'react'
import './TextInput.scss';
import {IoMdCloseCircle} from "react-icons/io";
import {Signal} from "@/hooks/useSignal";
import {cn} from "@/lib/utils.ts";
import {Label} from "@/components/ui/label.tsx";

type TValueCallback<T> = (value: T) => any;

export type TTextAreaProps<T> = {
    className?: string,
    valueSignal?: Signal<T>,
    onChange?: TValueCallback<T>,
    onBlur?: TValueCallback<T>,
    id?: string,
    label?: string
    placeholder?: T | string,
    value?: string | undefined,
    error?: string | undefined,
    blurOnClear?: boolean
}

let __instance = Number.MIN_SAFE_INTEGER;
const TextAreaInput = forwardRef((
    props: TTextAreaProps<string>,
    ref: ForwardedRef<HTMLTextAreaElement>
) => {
    const {
        valueSignal,
        onChange,
        placeholder,
        label,
        className,
        value,
        error,
        blurOnClear
    } = props;
    const id = props.id || `text_input_${__instance++}`;

    const handleChange = useCallback((value: string) => {
        if (valueSignal) {
            valueSignal.value = value;
        }

        if (!onChange) return;
        onChange(value);
    }, [valueSignal, onChange]);


    const handleClear = () => {
        if (blurOnClear && props.onBlur) props.onBlur('');
        handleChange('');
    }

    const labelClass = error ? 'text-color-red' : 'color-alternate';
    const groupClass = error ? 'border-color-red' : '';
    const inputValue = valueSignal?.value || value;

    return (
        <div className={'flex flex-col gap-1 w-full shrink'}>
            {label && (
                <Label htmlFor={id} className={labelClass}>
                    <b>{label}</b>
                </Label>
            )}
            <div className={cn(groupClass, 'relative flex items-center justify-center', className)}>
                <textarea id={id}
                          ref={ref}
                          className={'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'}
                          style={{minHeight: 100}}
                          placeholder={placeholder}
                          value={inputValue}
                          onBlur={e => props.onBlur && props.onBlur(e.target.value)}
                          onChange={e => handleChange(e.target.value)}/>
                {inputValue && (
                    <div className="absolute right-0 p-2 aspect-square flex-center cursor-pointer hover:scale-125">
                        <IoMdCloseCircle size={16} onClick={handleClear}/>
                    </div>
                )}
            </div>
            {error && (
                <b className={'h-fit top-full text-color-red font-sm'}>
                    {error}
                </b>
            )}
        </div>
    )
})

export default TextAreaInput