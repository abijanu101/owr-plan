import React, { useState, useRef, useEffect } from 'react';

export default function DurationPicker({ hours = 1, minutes = 30, onChange }) {
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

    return (
        <div className="relative inline-block" ref={containerRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="text-[#f97766] border-b-2 border-dotted border-[#f97766]/40 hover:border-[#f97766] px-1 font-bold italic transition-all focus:outline-none"
                style={{ fontFamily: 'cursive' }}
            >
                {hours}h {minutes}m
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-2xl animate-in zoom-in-95 duration-200 min-w-[180px] backdrop-blur-md">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Hours</span>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => onChange({ hours: Math.max(0, hours - 1), minutes })}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-black/20 hover:bg-black/40 text-[#DC8379]"
                                >-</button>
                                <span className="w-8 text-center text-primary font-bold">{hours}</span>
                                <button 
                                    onClick={() => onChange({ hours: hours + 1, minutes })}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-black/20 hover:bg-black/40 text-[#DC8379]"
                                >+</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Minutes</span>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => {
                                        let newMin = minutes - 5;
                                        let newHours = hours;
                                        if (newMin < 0) {
                                            newMin = 55;
                                            newHours = Math.max(0, hours - 1);
                                        }
                                        onChange({ hours: newHours, minutes: newMin });
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-black/20 hover:bg-black/40 text-[#DC8379]"
                                >-</button>
                                <span className="w-8 text-center text-primary font-bold">{minutes}</span>
                                <button 
                                    onClick={() => {
                                        let newMin = minutes + 5;
                                        let newHours = hours;
                                        if (newMin >= 60) {
                                            newMin = 0;
                                            newHours = hours + 1;
                                        }
                                        onChange({ hours: newHours, minutes: newMin });
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-black/20 hover:bg-black/40 text-[#DC8379]"
                                >+</button>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold rounded-lg border border-primary/20 transition-all uppercase tracking-widest mt-1"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
