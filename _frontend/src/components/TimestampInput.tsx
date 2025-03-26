import useSignal from "@/hooks/useSignal";
import NumberInput from "./NumberInput";
import {useCallback, useMemo, useRef} from "react";
import {TInputProps} from "./TextInput/TextInput";
import {Time} from "@/types/Time";
import {Label} from "@/components/ui/label";

export default function TimestampInput(props: Omit<TInputProps<string>, 'valueSignal'> & {
    value: string
}) {
    const {value, label} = props;
    const {hour, minute} = useMemo(() => Time.parse(value), [value]);

    const hourSignal = useSignal(hour);
    const minuteSignal = useSignal(minute);
    const lastMinute = useRef(minuteSignal.value);

    const updateTimestamp = useCallback((hh: number, mm: number) => {
        if (props.onChange) props.onChange(new Time().apply({hour: hh, minute: mm}).toString());
    }, [props.onChange, hourSignal.value, minuteSignal.value]);

    const ensureRounding = useCallback((mm: number) => {
        const hh = (mm === 0 && lastMinute.current === 45)
            ? (hourSignal.value + 1) % 24
            : (mm === 45 && lastMinute.current === 0)
                ? (hourSignal.value + 23) % 24
                : hourSignal.value;
        lastMinute.current = mm;
        hourSignal.value = hh;
        updateTimestamp(hh, mm);
    }, [hourSignal, lastMinute]);

    return (
        <div className={'flex-col gap-2'}>
            <Label>{label}</Label>
            <div className={'grid grid-cols-2 gap-4'} >
                <NumberInput vertical={true} valueSignal={hourSignal}
                             minValue={0} maxValue={23} loop={true}
                             onChange={hh => updateTimestamp(hh, minuteSignal.value)}/>
                <NumberInput vertical={true} valueSignal={minuteSignal}
                             minValue={0} maxValue={45} incrementBy={15} loop={true}
                             onChange={ensureRounding}/>
            </div>
        </div>
    )
}