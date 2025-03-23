"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {ReactNode} from "react";
import DateObject from "@/types/DateObject";

export function DatePicker(props: {
    value: Date | DateObject,
    startDate?: Date | DateObject,
    onChange?: (date: Date | null) => void,
    nullable?: boolean,
    children: ReactNode,
    label?: string
}) {
    const {startDate, nullable, value, onChange, label} = props;
    
    // Convert value to Date object if it's DateObject
    const dateValue = value instanceof Date ? value : 
                     (value && typeof value === 'object' && 'toDate' in value) ? value.toDate() : 
                     new Date();

    // Convert startDate to Date object if it's DateObject
    const startDateValue = startDate instanceof Date ? startDate :
                         (startDate && typeof startDate === 'object' && 'toDate' in startDate) ? startDate.toDate() : 
                         undefined;
    
    const handleSelect = (date?: Date) => {
        if (!onChange) return;
        if (!date) {
            if (nullable) onChange(null);
            return;
        }
        onChange(date);
    }
    
    const startTime = startDateValue?.getTime();
    const matchers: ((date: Date) => boolean)[] = [];
    if (startTime) {
        matchers.push(date => date.getTime() < startTime);
    } 

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="flex flex-col gap-1 w-full shrink cursor-pointer">
                    {label && <label className="text-sm font-medium leading-none color-alternate">{label}</label>}
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md flex items-center justify-between">
                        <span>{dateValue.toLocaleDateString()}</span>
                        <span>📅</span>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto color-foreground p-0 z-[1000]">
                <Calendar
                    disabled={matchers}
                    mode="single"
                    selected={dateValue}
                    onSelect={handleSelect}
                    
                />
            </PopoverContent>
        </Popover>
    )
}
