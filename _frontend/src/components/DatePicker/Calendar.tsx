import React, { useState } from 'react';
import { startOfMonth, endOfMonth, differenceInDays, sub, add, format, setDate, getYear, getMonth, getDate } from 'date-fns';
import Cell from './Cell';
import './Calendar.scss';

interface CalendarProps {
    value?: Date;
    onChange?: (value: Date) => void;
}

const Weekdays: Array<string> = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam',];

const Calendar: React.FC<CalendarProps> = ({ value = new Date(), onChange }) => {
    const currentDay = new Date();
    const month = getMonth(value);
    const prevMonthValue = getMonth(sub(value, {months: 1}));
    const nextMonthValue = getMonth(add(value, {months: 1}));
	const endDate = endOfMonth(sub(value, {months: 1}));
    const prevMounthEndDateNumber = endDate.getDate();
    const year = getYear(value);

    const startDate = startOfMonth(value);
    const startMonthDay = startDate.getDay();
	let initialPrevValue = prevMounthEndDateNumber - startMonthDay ;
    let currentMonthCount = 0 - getDate(startDate);
    let lastDay = differenceInDays(endDate, startDate) + 1;
    let empty = 0;
    let newMonth = 0;

    const daysMatrix = new Array(6).fill([]).map(() => {
        return new Array(7).fill(null).map(() => {
            if (empty <= startMonthDay) {
                initialPrevValue++;
                if (month === 0) {
                    return(new Date(year-1, prevMonthValue, initialPrevValue))
                } else {
                    return(new Date(year, prevMonthValue, initialPrevValue))
                }
            }
            if (currentMonthCount < lastDay) {
                currentMonthCount++;
                return(new Date(year, month, currentMonthCount))
            } else {
                newMonth++;
                return(new Date(year, nextMonthValue, newMonth))
            }
        })
    })

    const prevMonth = () => onChange && onChange(sub(value, {months: 1}));
    const nextMonth = () => onChange && onChange(add(value, {months: 1}));
    const prevYear = () => onChange && onChange(sub(value, {years: 1}));
    const nextYear = () => onChange && onChange(add(value, {years: 1}));

    const handleClickDate = (day: Date) => {
        onChange && onChange(day);
    }

    return (
        <div className='calendar_container text-black'>
            <div className='datapicker_container'>
                <span>{format(value, 'LLLL yyyy')}</span>
                <button onClick={prevYear}>{'<<'}</button>
                <button onClick={prevMonth}>{'<'}</button>
                <button onClick={nextMonth}>{'>'}</button>
                <button onClick={nextYear}>{'>>'}</button>
            </div>
            
            <div className='calendar'>
                <div className='calendar-header'>
                    {Weekdays.map(day => (
                        <Cell key={day} className='week-day'>{day}</Cell>
                    ))}
                </div>
                <div className='calendar-body'>
                    {/* {Array.from({ length: prefixDays }).map((_, index) => {
                        return <Cell key={index} className='prev-month-day'></Cell>;
                    })}
                    {Array.from({ length: numDays }).map((_, index) => {
                        const date = index + 1;
                        return <Cell onClick={() => handleClickDate(date)} key={date} className={`day ${value.getDate() === date ? 'selected' : ''} ${currentDay.getDate() === date && currentDay.getMonth() === value.getMonth() ? 'current_day' : ''}`}>{date}</Cell>;
                    })}
                    {Array.from({ length: sufixDays }).map((_, index) => {
                        return <Cell key={index} className='next-month-day'></Cell>;
                    })} */}
                    {daysMatrix.map((row, i) => (
                        row.map((day, i) => (
                            <Cell onClick={() => handleClickDate(day)} key={i} className={`day ${value.getDate() === day?.getDate() && value.getMonth() === day.getMonth() ? 'selected' : ''} ${currentDay.getDate() === day?.getDate() && currentDay.getMonth() === day.getMonth() ? 'current_day' : ''}`}>{day?.getDate()}</Cell>
                        ))
                    ))}
                </div>
                
            </div>
        </div>
    )
}

export default Calendar