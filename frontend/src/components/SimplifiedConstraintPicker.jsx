import React, { useState } from 'react';
import DateTimePicker from './DateTimePicker';
import DurationPicker from './DurationPicker';

export default function SimplifiedConstraintPicker() {
    const [duration, setDuration] = useState({ hours: 1, minutes: 30 });
    const [range, setRange] = useState({
        start: { date: new Date(2026, 3, 29), time: "08:00 AM" },
        end: { date: new Date(2026, 3, 30), time: "11:59 PM" }
    });

    return (
        <div className="flex flex-col items-center w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Pill - Outside the main box */}
            <div className="inline-block px-10 py-2.5 rounded-full bg-[#4C0E36] border border-[#DC8379]/20 mb-[-20px] relative z-10 shadow-lg">
                <span className="text-[22px] text-[#DC8379] font-normal tracking-wide" style={{ fontFamily: 'cursive' }}>
                    Define Constraints
                </span>
            </div>

            {/* Main Sentence Box */}
            <div className="w-full bg-[var(--bg-raised)] rounded-[2.5rem] pt-12 pb-10 px-10 border border-[var(--border-subtle)] shadow-xl relative">
                <div className="space-y-10 pl-2">
                    {/* Sentence Line 1 */}
                    <div className="text-[26px] text-[#DC8379] leading-relaxed tracking-wide flex flex-wrap items-baseline gap-x-3 gap-y-6" style={{ fontFamily: 'cursive' }}>
                        <span>I want a time slot that is</span>
                        <DurationPicker 
                            hours={duration.hours}
                            minutes={duration.minutes}
                            onChange={setDuration}
                        />
                        <span>long</span>
                    </div>

                    {/* Sentence Line 2 */}
                    <div className="text-[26px] text-[#DC8379] leading-relaxed tracking-wide flex flex-wrap items-baseline gap-x-3 gap-y-6" style={{ fontFamily: 'cursive' }}>
                        <span>Somewhere between</span>
                        <DateTimePicker 
                            variant="inline-text"
                            initialDate={range.start.date}
                            initialTime={range.start.time}
                            onChange={(val) => setRange(prev => ({ ...prev, start: val }))}
                        />
                        <span>and</span>
                        <DateTimePicker 
                            variant="inline-text"
                            initialDate={range.end.date}
                            initialTime={range.end.time}
                            onChange={(val) => setRange(prev => ({ ...prev, end: val }))}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Actions - Outside the main box */}
            <div className="mt-8 flex flex-col items-center gap-6 w-full">
                <div className="flex justify-end w-full max-w-[90%]">
                    <button className="group relative flex items-center gap-3 px-10 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--bg-primary)] font-bold text-lg shadow-[0_0_20px_rgba(249,119,102,0.3)] hover:shadow-[0_0_30px_rgba(249,119,102,0.5)] transition-all active:scale-95 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-glint" />
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l2.45 4.96L20 7.71l-4 3.9 1 5.39L12 14.5l-5 2.5 1-5.39-4-3.9 5.55-.75L12 2z" />
                        </svg>
                        <span>Generate</span>
                    </button>
                </div>

                <div className="w-full flex justify-start pl-8 border-t border-[#DC8379]/10 pt-4">
                    <button className="flex items-center gap-2 text-[#DC8379]/60 hover:text-[#DC8379] transition-all text-sm font-bold group">
                        <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span style={{ fontFamily: 'cursive' }}>View Advanced Options</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
