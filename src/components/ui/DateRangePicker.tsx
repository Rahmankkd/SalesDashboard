import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onChange: (range: { start: string; end: string }) => void;
    label?: string;
    className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange, label, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date(startDate || new Date()));
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const clickedDateStr = formatDate(clickedDate);

        // Logic:
        // 1. If start & end exist, reset and make this the new start.
        // 2. If only start exists:
        //    - If clicked < start, make clicked the new start and old start the end.
        //    - If clicked > start, make clicked the end.
        // 3. If nothing exists, make this start.

        if (startDate && endDate) {
            onChange({ start: clickedDateStr, end: '' });
        } else if (startDate && !endDate) {
            if (clickedDateStr < startDate) {
                onChange({ start: clickedDateStr, end: startDate });
            } else {
                onChange({ start: startDate, end: clickedDateStr });
            }
            setIsOpen(false);
        } else {
            onChange({ start: clickedDateStr, end: '' });
        }
    };

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = formatDate(date);

            let isSelected = false;
            let isRange = false;
            let isStart = dateStr === startDate;
            let isEnd = dateStr === endDate;

            if (startDate && endDate) {
                if (dateStr >= startDate && dateStr <= endDate) isRange = true;
            }

            let bgClass = "hover:bg-blue-50 text-slate-700";
            if (isStart || isEnd) bgClass = "bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700";
            else if (isRange) bgClass = "bg-blue-100 text-blue-800 rounded-none";

            // Rounded corners for range edges visual polish
            if (isRange && !isStart && !isEnd) {
                // Middle of range
            }
            if (isStart && endDate) bgClass += " rounded-r-none";
            if (isEnd && startDate) bgClass += " rounded-l-none";

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`h-8 w-8 text-xs flex items-center justify-center transition-all ${bgClass} ${(!isStart && !isEnd && !isRange) ? 'rounded-full' : ''}`}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    // Format display range
    const displayRange = () => {
        if (!startDate) return "Select Dates";
        const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '...';
        return `${start} - ${end}`;
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Calendar size={14} /> {label}</label>}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold shadow-sm hover:border-blue-300 transition-all flex justify-between items-center text-slate-700 min-h-[46px]"
            >
                <span>{displayRange()}</span>
                <Calendar size={16} className="text-slate-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 w-72">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeft size={16} /></button>
                        <span className="font-bold text-slate-700 text-sm">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronRight size={16} /></button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className="h-8 w-8 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {renderCalendar()}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center uppercase tracking-widest">
                        {startDate && !endDate ? "Select End Date" : "Select Start Date"}
                    </div>
                </div>
            )}
        </div>
    );
};
