import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

export default function DateTimePicker({ initialDate, initialTime = "08:40 PM", onChange, variant = 'full' }) {
    const [dateTimeState, setDateTimeState] = useState({
        date: initialDate || new Date(2026, 3, 29), // Apr 29, 2026
        time: initialTime
    });

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (event.target.closest('.picker-modal-content')) return;
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

    if (variant === 'inline-text') {
        return (
            <div className="relative inline-block" ref={containerRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 text-[#f97766] hover:brightness-110 transition-all border-b-2 border-dotted border-[#f97766]/40 hover:border-[#f97766] px-1 font-bold italic focus:outline-none"
                    style={{ fontFamily: 'cursive' }}
                >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                    <span>{dateTimeState.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {dateTimeState.time}</span>
                </button>

                {isOpen && createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
                        <div className="picker-modal-content relative z-50 w-full max-w-min mx-auto animate-in zoom-in-95 duration-200">
                            <DateTimePickerSinglePanel
                                dateTimeState={dateTimeState}
                                setDateTimeState={setDateTimeState}
                                onClose={() => {
                                    setIsOpen(false);
                                    if (onChange) onChange(dateTimeState);
                                }}
                            />
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        );
    }

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
                {/* Reset — color matches page palette */}
                <button
                    onClick={() => {
                        const today = new Date();
                        const reset = { date: today, time: "12:00 PM" };
                        setDateTimeState(reset);
                        if (onChange) onChange(reset);
                    }}
                    className="w-12 h-12 flex shrink-0 items-center justify-center rounded-[0.8rem] border border-[var(--border-subtle)] hover:bg-[var(--bg-raised)] text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 transition-all cursor-pointer"
                    aria-label="Reset"
                >
                    <XIcon />
                </button>
            </div>

            {isOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
                    <div className="picker-modal-content relative z-50 w-full max-w-min mx-auto animate-in zoom-in-95 duration-200">
                        <DateTimePickerSinglePanel
                            dateTimeState={dateTimeState}
                            setDateTimeState={setDateTimeState}
                            onClose={() => {
                                setIsOpen(false);
                                if (onChange) onChange(dateTimeState);
                            }}
                        />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

function DateTimePickerSinglePanel({ dateTimeState, setDateTimeState, onClose }) {
    const [viewDate, setViewDate] = useState(new Date(dateTimeState.date));
    const [mobileTab, setMobileTab] = useState('date');

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
                        ? 'bg-[#f97766] text-[#1A0B16] shadow-[0_0_15px_rgba(249,119,102,0.4)] scale-110'
                        : currentDay
                            ? 'border border-[#f97766] text-[#f97766] hover:bg-[#f97766]/20'
                            : 'text-[#DC8379] hover:bg-white/5 hover:text-[#f97766]'
                        }`}
                >
                    {d}
                </button>
            );
        }

        return cells;
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 bg-[var(--bg-raised)]/90 p-5 sm:p-8 rounded-[2rem] border border-[var(--border-subtle)] shadow-2xl backdrop-blur-md relative w-[20rem] sm:w-auto mx-auto">

            {/* Mobile Tabs */}
            <div className="sm:hidden flex bg-black/20 p-1 rounded-xl mb-1">
                <button
                    onClick={() => setMobileTab('date')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mobileTab === 'date' ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] shadow-sm' : 'text-muted hover:text-primary'}`}
                >Date</button>
                <button
                    onClick={() => setMobileTab('time')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mobileTab === 'time' ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] shadow-sm' : 'text-muted hover:text-primary'}`}
                >Time</button>
            </div>

            {/* Calendar Side */}
            <div className={`flex-col gap-6 w-full sm:w-[17rem] pt-2 ${mobileTab === 'date' ? 'flex' : 'hidden sm:flex'}`}>

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
            <div className="hidden sm:block w-px h-auto bg-[var(--border-subtle)] opacity-40 my-2 rounded-full"></div>

            {/* TimePicker Side */}
            <div className={`flex-col justify-between w-full sm:w-auto ${mobileTab === 'time' ? 'flex' : 'hidden sm:flex'}`}>
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

                {/* Bottom Bar: Done Button & Date Pill */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 w-full sm:pl-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-3.5 w-full sm:w-auto rounded-xl border border-[var(--border-subtle)] text-white font-bold bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                        Done
                    </button>
                    <div className="hidden sm:block bg-[var(--color-primary)] text-[var(--bg-primary)] px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_4px_15px_rgba(249,119,102,0.4)] border-2 border-[var(--bg-raised)] text-center">
                        {dateTimeState.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {dateTimeState.time}
                    </div>
                </div>

                {/* Mobile Date Pill */}
                <div className="sm:hidden mt-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-4 py-2 rounded-xl text-sm font-bold text-center border border-[var(--color-primary)]/20">
                    {dateTimeState.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {dateTimeState.time}
                </div>
            </div>
        </div>
    );
}
