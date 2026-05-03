import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const WheelColumn = ({ items, value, onChange, width = "w-16", align = "center" }) => {
    const scrollRef = useRef(null);
    const itemHeight = 56;
    const isScrolling = useRef(false);
    const scrollTimeout = useRef(null);
    const isDragging = useRef(false);
    const startY = useRef(0);
    const startScrollTop = useRef(0);

    useEffect(() => {
        if (scrollRef.current && !isScrolling.current && !isDragging.current) {
            const index = items.indexOf(value);
            if (index !== -1) {
                scrollRef.current.scrollTop = index * itemHeight;
            }
        }
    }, [value, items]);

    const handleScroll = (e) => {
        if (isDragging.current) return;
        isScrolling.current = true;
        clearTimeout(scrollTimeout.current);
        
        const index = Math.round(e.target.scrollTop / itemHeight);
        if (index >= 0 && index < items.length) {
            if (items[index] !== value) {
                onChange(items[index]);
            }
        }

        scrollTimeout.current = setTimeout(() => {
            isScrolling.current = false;
        }, 150);
    };

    const handleMouseDown = (e) => {
        isDragging.current = true;
        startY.current = e.pageY;
        startScrollTop.current = scrollRef.current.scrollTop;
        scrollRef.current.style.scrollSnapType = 'none';
        scrollRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const delta = startY.current - e.pageY;
        scrollRef.current.scrollTop = startScrollTop.current + delta;
    };

    const handleMouseUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        scrollRef.current.style.scrollSnapType = 'y mandatory';
        scrollRef.current.style.cursor = 'grab';
        
        const index = Math.round(scrollRef.current.scrollTop / itemHeight);
        if (index >= 0 && index < items.length) {
            onChange(items[index]);
            scrollRef.current.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
        }
    };

    return (
        <div 
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`h-[168px] ${width} overflow-y-scroll snap-y snap-mandatory relative text-[2.5rem] font-bold [&::-webkit-scrollbar]:hidden select-none cursor-grab active:cursor-grabbing`}
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
            <div style={{ height: itemHeight }} className="w-full shrink-0" />
            {items.map((item) => (
                <div 
                    key={item} 
                    style={{ height: itemHeight }}
                    className={`w-full flex items-center justify-${align === 'center' ? 'center' : align === 'left' ? 'start' : 'end'} shrink-0 snap-center transition-all duration-200 cursor-pointer tabular-nums ${
                        value === item 
                            ? 'text-[#f97766] scale-110 opacity-100' 
                            : 'text-[#DC8379] opacity-40 hover:opacity-70 scale-90'
                    }`}
                >
                    {item}
                </div>
            ))}
            <div style={{ height: itemHeight }} className="w-full shrink-0" />
        </div>
    );
};

const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

export default function TimePicker({ initialTime = "08:59 AM", onChange, hideHelperText = false, inline = false, variant = 'default' }) {
    const parseTime = (timeStr) => {
        try {
            const [time, p] = timeStr.split(' ');
            const [h, m] = time.split(':');
            return {
                hour: parseInt(h, 10) || 8,
                minute: parseInt(m, 10) || 0,
                period: p || 'AM'
            };
        } catch {
            return { hour: 8, minute: 59, period: 'AM' };
        }
    };

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const periods = ['AM', 'PM'];

    const [time, setTime] = useState(() => parseTime(initialTime));
    const [isOpen, setIsOpen] = useState(false);

    const updateTime = (updates) => {
        setTime(prev => {
            const newTime = { ...prev, ...updates };
            if (onChange) {
                onChange(`${newTime.hour.toString().padStart(2, '0')}:${newTime.minute.toString().padStart(2, '0')} ${newTime.period}`);
            }
            return newTime;
        });
    };

    const pickerContent = (
        <div className="flex flex-col items-center gap-4 w-full sm:w-auto select-none">
            {/* The Main Pill Container */}
            <div className="relative flex items-center justify-center gap-2 sm:gap-4 bg-[var(--bg-accent)]/20 px-6 py-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border-subtle)]/40 shadow-xl shadow-[var(--bg-primary)] backdrop-blur-sm overflow-hidden w-full sm:w-auto">
                
                {/* Selection Highlight Background (Center row) */}
                <div className="absolute top-1/2 left-0 w-full h-[56px] -translate-y-1/2 bg-[var(--bg-raised)] border-y border-primary/20 pointer-events-none z-0"></div>

                <div className="z-10 flex items-center gap-2 sm:gap-4">
                    {/* Hours */}
                    <WheelColumn 
                        items={hours} 
                        value={time.hour.toString().padStart(2, '0')} 
                        onChange={(val) => updateTime({ hour: parseInt(val, 10) })}
                        width="w-16 sm:w-20"
                        align="center"
                    />

                    {/* Separator Colon */}
                    <div className="text-primary text-[2.5rem] font-bold opacity-80 pb-2">:</div>

                    {/* Minutes */}
                    <WheelColumn 
                        items={minutes} 
                        value={time.minute.toString().padStart(2, '0')} 
                        onChange={(val) => updateTime({ minute: parseInt(val, 10) })}
                        width="w-16 sm:w-20"
                        align="center"
                    />

                    {/* Divider Line */}
                    <div className="h-16 w-px bg-[var(--border-subtle)] opacity-40 mx-2 rounded-full hidden sm:block"></div>

                    {/* AM/PM */}
                    <div className="flex flex-col gap-2 ml-2 sm:ml-0">
                        <WheelColumn 
                            items={periods} 
                            value={time.period} 
                            onChange={(val) => updateTime({ period: val })}
                            width="w-14 sm:w-16"
                            align="center"
                        />
                    </div>
                </div>
            </div>

            {/* Helper Text */}
            {!hideHelperText && (
                <div className="text-muted text-sm font-medium flex items-center gap-2 opacity-80">
                    Scroll or drag to select time
                </div>
            )}
            
            {!inline && (
                 <div className="mt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 w-full">
                     <button onClick={() => setIsOpen(false)} className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[var(--border-subtle)] text-white font-bold bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all shadow-md active:scale-95 cursor-pointer">Done</button>
                     <div className="bg-[var(--color-primary)] text-[var(--bg-primary)] px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-[0_4px_15px_rgba(249,119,102,0.4)] border-2 border-[var(--bg-raised)] w-full sm:w-auto text-center">
                         {time.hour.toString().padStart(2, '0')}:{time.minute.toString().padStart(2, '0')} {time.period}
                     </div>
                 </div>
            )}
        </div>
    );

    if (inline) return pickerContent;

    if (variant === 'inline-text') {
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

        return (
            <div className="relative inline-block select-none" ref={containerRef}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-1.5 text-[#f97766] border-b-2 border-dotted border-[#f97766]/40 hover:border-[#f97766] px-1 font-bold italic transition-all focus:outline-none"
                    style={{ fontFamily: 'cursive' }}
                >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>{time.hour.toString().padStart(2, '0')}:{time.minute.toString().padStart(2, '0')} {time.period}</span>
                </button>

                {isOpen && createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
                        <div className="picker-modal-content relative z-50 w-full max-w-min mx-auto animate-in zoom-in-95 duration-200 bg-[var(--bg-raised)]/90 p-6 sm:p-8 rounded-[2rem] border border-[var(--border-subtle)] shadow-2xl backdrop-blur-md">
                            {pickerContent}
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        );
    }


    return (
        <div className="relative inline-block w-full sm:w-auto select-none">
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-4 px-6 py-4 w-full sm:w-[16rem] rounded-[1.5rem] sm:rounded-full border transition-all cursor-pointer ${isOpen
                        ? 'bg-[var(--bg-raised)] border-primary text-primary shadow-[0_0_15px_rgba(249,119,102,0.15)]'
                        : 'bg-transparent border-[var(--border-subtle)] hover:bg-[var(--bg-raised)] hover:border-primary/50 text-primary'
                    }`}
            >
                <ClockIcon />
                <div className="text-left flex flex-col">
                    <span className="font-bold text-[15px] leading-tight tracking-wide">{time.hour.toString().padStart(2, '0')}:{time.minute.toString().padStart(2, '0')}</span>
                    <span className="text-muted text-xs font-semibold">{time.period}</span>
                </div>
            </button>

            {isOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
                    <div className="picker-modal-content relative z-50 w-full max-w-min mx-auto animate-in zoom-in-95 duration-200 bg-[var(--bg-raised)]/90 p-6 sm:p-8 rounded-[2rem] border border-[var(--border-subtle)] shadow-2xl backdrop-blur-md">
                        {pickerContent}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
