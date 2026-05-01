import { useState, useRef, useEffect } from 'react';
import TimePicker from './TimePicker';

const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const XIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const ChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);

const ChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function DateTimePicker({ initialDate, initialTime = "08:40 PM", onChange }) {
    const [dateTimeState, setDateTimeState] = useState({
        date: initialDate || new Date(2026, 3, 29), // Apr 29, 2026
        time: initialTime
    });

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatDateObj = (dateObj) => {
        if (!dateObj) return "Select Date";
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];
        const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dateObj.getMonth()];
        return `${dayName}, ${monthName} ${dateObj.getDate()}`;
    };

    return (
        <div className="relative inline-block w-full sm:w-auto" ref={containerRef}>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-4 px-6 py-4 w-full sm:w-[26rem] rounded-[1.5rem] sm:rounded-full border transition-all cursor-pointer ${isOpen
                            ? 'bg-[var(--bg-raised)] border-primary text-primary shadow-[0_0_15px_rgba(249,119,102,0.15)]'
                            : 'bg-transparent border-[var(--border-subtle)] hover:bg-[var(--bg-raised)] hover:border-primary/50 text-primary'
                        }`}
                >
                    <ClockIcon />
                    <div className="text-left flex flex-col">
                        <span className="font-bold text-[15px] leading-tight tracking-wide">{formatDateObj(dateTimeState.date)}</span>
                        <span className="text-muted text-xs font-semibold">{dateTimeState.time}</span>
                    </div>
                </button>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => {
                            const today = new Date();
                            setDateTimeState({ date: today, time: "12:00 PM" });
                            if (onChange) onChange({ date: today, time: "12:00 PM" });
                        }}
                        className="w-12 h-12 flex shrink-0 items-center justify-center rounded-[0.8rem] border border-[var(--border-subtle)] hover:bg-[var(--bg-raised)] text-white hover:border-white/40 transition-all cursor-pointer"
                        aria-label="Clear"
                    >
                        <XIcon />
                    </button>

                    <button
                        onClick={() => {
                            setIsOpen(false);
                            if (onChange) onChange(dateTimeState);
                        }}
                        className="px-6 py-3 w-full sm:w-auto flex items-center justify-center rounded-[0.8rem] border border-[var(--border-subtle)] hover:bg-[var(--bg-raised)] text-white font-bold hover:border-white/40 transition-all cursor-pointer"
                    >
                        Set
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="relative z-50 w-full max-w-min mx-auto animate-in zoom-in-95 duration-200" ref={(el) => {
                        // Handle click outside on the modal wrapper
                        if (el) {
                            const handler = (e) => {
                                if (e.target === el.parentElement) setIsOpen(false);
                            };
                            el.parentElement.addEventListener('mousedown', handler);
                            return () => el.parentElement.removeEventListener('mousedown', handler);
                        }
                    }}>
                    <DateTimePickerSinglePanel
                        dateTimeState={dateTimeState}
                        setDateTimeState={setDateTimeState}
                        onClose={() => {
                            setIsOpen(false);
                            if (onChange) onChange(dateTimeState);
                        }}
                    />
                    </div>
                </div>
            )}
        </div>
    );
}

function DateTimePickerSinglePanel({ dateTimeState, setDateTimeState, onClose }) {
    const [viewDate, setViewDate] = useState(new Date(dateTimeState.date));

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const handleDateClick = (day) => {
        const newDate = new Date(year, month, day);
        setDateTimeState(prev => ({ ...prev, date: newDate }));
    };

    const handleTimeChange = (newTime) => {
        setDateTimeState(prev => ({ ...prev, time: newTime }));
    };

    const renderCalendarGrid = () => {
        const cells = [];

        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        }

        const today = new Date();
        const isToday = (d) => today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

        const isSelected = (d) => {
            return dateTimeState.date.getDate() === d &&
                dateTimeState.date.getMonth() === month &&
                dateTimeState.date.getFullYear() === year;
        };

        for (let d = 1; d <= daysInMonth; d++) {
            const selected = isSelected(d);
            const currentDay = isToday(d) || (d === 25 && month === 3 && year === 2026);

            cells.push(
                <button
                    key={d}
                    onClick={() => handleDateClick(d)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-[15px] font-bold transition-all cursor-pointer ${selected
                            ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] shadow-[0_0_15px_rgba(249,119,102,0.4)] scale-110'
                            : currentDay
                                ? 'border border-primary text-primary hover:bg-[var(--color-primary)]/20'
                                : 'text-primary/90 hover:bg-[var(--bg-raised)] hover:text-primary'
                        }`}
                >
                    {d}
                </button>
            );
        }

        return cells;
    };

    return (
        <div className="flex flex-col sm:flex-row gap-8 bg-[var(--bg-raised)]/90 p-6 sm:p-8 rounded-[2rem] border border-[var(--border-subtle)] shadow-2xl backdrop-blur-md">

            {/* Calendar Side */}
            <div className="flex flex-col gap-6 w-[17rem] pt-2">

                {/* Calendar Header */}
                <div className="flex items-center justify-between px-1">
                    <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl border border-[var(--border-subtle)] text-muted hover:text-primary hover:bg-[var(--bg-primary)] transition-all cursor-pointer">
                        <ChevronLeft />
                    </button>
                    <div className="text-primary font-bold text-[1.1rem] tracking-wide">
                        {MONTHS[month]} {year}
                    </div>
                    <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl border border-[var(--border-subtle)] text-muted hover:text-primary hover:bg-[var(--bg-primary)] transition-all cursor-pointer">
                        <ChevronRight />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="flex flex-col gap-4">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 gap-y-2 gap-x-1 justify-items-center">
                        {DAYS.map(day => (
                            <div key={day} className="text-muted text-xs font-bold w-8 text-center">{day}</div>
                        ))}
                    </div>
                    {/* Dates */}
                    <div className="grid grid-cols-7 gap-y-2 gap-x-1 justify-items-center">
                        {renderCalendarGrid()}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px sm:w-px sm:h-auto bg-[var(--border-subtle)] opacity-40 my-4 sm:my-2 rounded-full"></div>

            {/* TimePicker Side */}
            <div className="flex flex-col justify-between">
                <div className="flex flex-col gap-5">
                    <span className="text-muted font-bold text-xs tracking-widest uppercase pl-2">
                        Time
                    </span>
                    <TimePicker
                        initialTime={dateTimeState.time}
                        onChange={handleTimeChange}
                        hideHelperText={true}
                        inline={true}
                    />
                </div>

                {/* Done Button */}
                <div className="mt-6 flex items-start pl-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-3.5 w-full sm:w-auto rounded-xl border border-[var(--border-subtle)] text-white font-bold bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                        Done
                    </button>
                </div>
            </div>

        </div>
    );
}
