import React, {ForwardedRef, forwardRef, HTMLAttributes, useCallback} from 'react'
import './TextInput.scss';
import {IoMdCloseCircle} from "react-icons/io";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";

type TValueCallback<T> = (value: T) => void;
type Validator<T> = (value: T) => [isValid: boolean, error?: string]

export type TInputProps<T> = {
    className?: string,
    inputProps?: HTMLAttributes<HTMLInputElement>,
    value: T,
    onChange?: TValueCallback<T>,
    onBlur?: TValueCallback<T>,
    onFocus?: TValueCallback<T>,
    id?: string,
    label?: string
    placeholder?: T | string,
    type?: 'password',
    errorMode?: 'always' | 'auto',
    icon?: React.ReactElement,
    validateOnChange?: boolean,
    validateOnBlur?: boolean,
    validate?: Validator<T>,
    blurOnClear?: boolean
}

let __instance = Number.MIN_SAFE_INTEGER;
const TextInput = forwardRef((
    props: TInputProps<string>,
    ref: ForwardedRef<HTMLInputElement>
) => {
    const {
        value,
        onBlur,
        onChange,
        onFocus,
        placeholder,
        icon,
        label,
        className,
        validate,
        blurOnClear,
        inputProps
    } = props;
    const id = props.id || `text_input_${__instance++}`;
    const inputType = props.type || 'text';


    const handleChange = useCallback((value: string) => {
        if (!onChange) return;
        onChange(value);
    }, [onChange]);

    const handleFocus = useCallback(() => {
        if (!onFocus) return;

        onFocus(value);
    }, [onFocus]);

    const handleBlur = useCallback((override?: string) => {
        const actualValue = typeof override === "string" ? override : value;
        if (!onBlur) return;

        onBlur(actualValue);
    }, [onBlur, validate, value]);

    const handleClear = () => {
        if (blurOnClear) handleBlur('');
        handleChange('');
    }

    const labelClass = 'text-foreground';
    const groupClass = 'text-foreground/80';

    return (
        <div className={'flex flex-col gap-1 w-full shrink'}>
            {label && (
                <Label htmlFor={id} className={labelClass}>
                    {label}
                </Label>
            )}
            <div className={cn(groupClass, 'relative flex items-center justify-center', className)}>
                <div className="absolute left-0 h-full aspect-square flex-center">{icon}</div>
                <Input {...inputProps}
                       id={id}
                       ref={ref}
                       className={cn(icon ? 'pl-8' : '', inputProps?.className)}
                       type={inputType}
                       placeholder={placeholder}
                       value={value}
                       onBlur={() => handleBlur()}
                       onFocus={handleFocus}
                       onChange={e => handleChange(e.target.value)}/>
                {value && (
                    <div className="absolute right-0 p-2 aspect-square flex-center cursor-pointer hover:scale-150"
                         title={'Clear'}>
                        <IoMdCloseCircle size={16} onClick={handleClear}/>
                    </div>
                )}
            </div>
        </div>
    )
})

export default TextInput