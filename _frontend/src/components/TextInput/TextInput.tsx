import React, {ForwardedRef, forwardRef, useCallback, useState} from 'react'
import './TextInput.scss';
import {IoMdCloseCircle} from "react-icons/io";
import {Signal} from "@/hooks/useSignal";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";

type TValueCallback<T> = (value: T) => any;
type Validator<T> = (value: T) => [isValid: boolean, error?: string]

export type TInputProps<T> = {
    className?: string,
    value: T,
    errorSignal?: Signal<string>,
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
        errorSignal,
        onBlur,
        onChange,
        onFocus,
        placeholder,
        icon,
        label,
        errorMode,
        className,
        validate,
        blurOnClear
    } = props;
    const id = props.id || `text_input_${__instance++}`;
    const inputType = props.type || 'text';

    const [dirty, setDirty] = useState(false);

    const handleValidate = useCallback((value: string) => {
        if (!errorSignal || typeof validate !== 'function') return;

        errorSignal.value = validate(value)[1] || '';
    }, [validate, errorSignal]);

    const {validateOnChange, validateOnBlur} = props;
    const handleChange = useCallback((value: string) => {
        setDirty(true);

        if (validateOnChange !== false) handleValidate(value);

        if (!onChange) return;
        onChange(value);
    }, [onChange, validateOnChange]);

    const handleFocus = useCallback(() => {
        if (!onFocus) return;

        onFocus(value);
    }, [onFocus]);

    const handleBlur = useCallback((override?: string) => {
        setDirty(true);

        const actualValue = typeof override === "string" ? override : value;
        if (validateOnBlur) handleValidate(actualValue);
        if (!onBlur) return;

        onBlur(actualValue);
    }, [onBlur, validateOnBlur, validate, value]);

    const handleClear = () => {
        if (blurOnClear) handleBlur('');
        handleChange('');
    }

    const showError = errorSignal?.value && (errorMode === 'always' || dirty);

    const labelClass = showError ? 'text-red-700' : 'text-foreground';
    const groupClass = showError ? 'text-red-600' : 'text-foreground/80';

    return (
        <div className={'flex flex-col gap-1 w-full shrink'}>
            {label && (
                <Label htmlFor={id} className={labelClass}>
                    {label}
                </Label>
            )}
            <div className={cn(groupClass, 'relative flex items-center justify-center', className)}>
                <div className="absolute left-0 h-full aspect-square flex-center">{icon}</div>
                <Input id={id}
                       ref={ref}
                       className={cn(icon ? 'pl-8' : '')}
                       type={inputType}
                       placeholder={placeholder}
                       value={value}
                       onBlur={() => handleBlur()}
                       onFocus={handleFocus}
                       onChange={e => handleChange(e.target.value)}/>
                {value && (
                    <div className="absolute right-0 p-2 aspect-square flex-center cursor-pointer hover:scale-150" title={'Clear'}>
                        <IoMdCloseCircle size={16} onClick={handleClear}/>
                    </div>
                )}
            </div>
        </div>
    )
})

export default TextInput