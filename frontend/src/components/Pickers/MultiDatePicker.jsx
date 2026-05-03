import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="4" ry="4" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
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

export default function MultiDatePicker({ initialDates = [], onChange, variant = 'full' }) {
    const [selectedDates, setSelectedDates] = useState(
        initialDates.length > 0 ? initialDates : [new Date(2026, 3, 29)]
    );

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

    const formatDatesText = () => {
        if (selectedDates.length === 0) return "Select Dates";
        
        const formattedDates = selectedDates.map(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        if (selectedDates.length === 1) {
            return formattedDates[0];
        }
        
        return `${formattedDates[0]} +${selectedDates.length - 1}`;
    };

    if (variant === 'inline-text') {
        return (
            <div className="relative inline-block" ref={containerRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 text-[#f97766] hover:brightness-110 transition-all border-b-2 border-dotted border-[#f97766]/40 hover:border-[#f97766] px-1 font-bold italic focus:outline-none"
                    style={{ fontFamily: 'cursive' }}
                >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    <span>{formatDatesText()}</span>
                </button>

                {isOpen && createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
                        <div className="picker-modal-content relative z-50 w-full max-w-min mx-auto animate-in zoom-in-95 duration-200">
                        <MultiDatePickerPanel
                            selectedDates={selectedDates}
                            setSelectedDates={setSelectedDates}
                            onClose={() => {
                                setIsOpen(false);
                                if (onChange) onChange(selectedDates);
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
                    <CalendarIcon />
                    <div className="text-left flex flex-col">
                        <span className="font-bold text-[15px] leading-tight tracking-wide">{formatDatesText()}</span>
                        <span className="text-muted text-xs font-semibold">Multiple Dates</span>
                    </div>
                </button>

                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="relative z-50 w-full max-w-min mx-auto animate-in zoom-in-95 duration-200" ref={(el) => {
                            if (el) {
                                const handler = (e) => {
                                    if (e.target === el.parentElement) setIsOpen(false);
                                };
                                el.parentElement.addEventListener('mousedown', handler);
                                return () => el.parentElement.removeEventListener('mousedown', handler);
                            }
                        }}>
                            <MultiDatePickerPanel
                                selectedDates={selectedDates}
                                setSelectedDates={setSelectedDates}
                                onClose={() => {
                                    setIsOpen(false);
                                    if (onChange) onChange(selectedDates);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function MultiDatePickerPanel({ selectedDates, setSelectedDates, onClose }) {
    // Determine initial view month based on the first selected date or today
    const initialViewDate = selectedDates.length > 0 ? selectedDates[0] : new Date();
    const [viewDate, setViewDate] = useState(new Date(initialViewDate));

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const isSameDate = (d1, d2) => {
        return d1.getDate() === d2.getDate() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getFullYear() === d2.getFullYear();
    };

    const handleDateClick = (day) => {
        const clickedDate = new Date(year, month, day);
        
        // Check if date is already selected
        const existingIndex = selectedDates.findIndex(d => isSameDate(d, clickedDate));
        
        if (existingIndex >= 0) {
            // Remove it
            const newDates = [...selectedDates];
            newDates.splice(existingIndex, 1);
            setSelectedDates(newDates);
        } else {
            // Add it and sort the array
            const newDates = [...selectedDates, clickedDate].sort((a, b) => a - b);
            setSelectedDates(newDates);
        }
    };

    const renderCalendarGrid = () => {
        const cells = [];

        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        }

        const today = new Date();
        const isToday = (d) => today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

        const isSelected = (d) => {
            const currentCellDate = new Date(year, month, d);
            return selectedDates.some(selected => isSameDate(selected, currentCellDate));
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
        <div className="flex flex-col gap-6 bg-[var(--bg-raised)]/90 p-6 sm:p-8 rounded-[2rem] border border-[var(--border-subtle)] shadow-2xl backdrop-blur-md relative min-w-[320px]">

            {/* Header Text */}
            <div className="text-center">
                <h3 className="text-2xl text-[#DC8379] font-normal mb-1" style={{ fontFamily: 'cursive' }}>
                    Select Dates
                </h3>
                <p className="text-muted text-xs font-medium opacity-60">Tap to toggle dates</p>
            </div>

            {/* Calendar Div */}
            <div className="flex flex-col gap-6 pt-2 items-center">

                {/* Calendar Header */}
                <div className="flex items-center justify-between px-1 w-[17rem]">
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
                <div className="flex flex-col gap-4 w-[17rem]">
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

            {/* Bottom Bar: Done Button & Selection Pill */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                <button 
                    onClick={onClose}
                    className="px-6 py-3.5 w-full sm:flex-1 rounded-xl border border-[var(--border-subtle)] text-white font-bold bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                    Done
                </button>
                <div className="bg-[var(--color-primary)] text-[var(--bg-primary)] px-4 py-2 rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(249,119,102,0.4)] border-2 border-[var(--bg-raised)] w-full sm:flex-1 text-center">
                    {selectedDates.length} Selected
                </div>
            </div>
        </div>
    );
}
