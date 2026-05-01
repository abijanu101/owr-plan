import React, { useState } from 'react';
import DateTimePicker from './DateTimePicker';

export default function SimplifiedConstraintPicker() {
    const [duration, setDuration] = useState({ hours: 1, minutes: 30 });
    const [range, setRange] = useState({
        start: { date: new Date(2026, 3, 29), time: "08:00 AM" },
        end: { date: new Date(2026, 3, 30), time: "11:59 PM" }
    });

    const [isDurationOpen, setIsDurationOpen] = useState(false);

    return (
        <div className="w-full max-w-2xl bg-[var(--bg-raised)] rounded-[2.5rem] p-8 border border-[var(--border-subtle)] shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Pill */}
            <div className="inline-block px-8 py-2 rounded-full bg-[#4C0E36] border border-[#DC8379]/20 mb-8">
                <span className="text-[20px] text-[#DC8379] font-normal tracking-wide" style={{ fontFamily: 'cursive' }}>
                    Define Constraints
                </span>
            </div>

            {/* Sentence Content */}
            <div className="space-y-8 pl-4">
                <div className="text-[22px] text-[#DC8379] leading-relaxed tracking-wide flex flex-wrap items-baseline gap-x-3 gap-y-6" style={{ fontFamily: 'cursive' }}>
                    <span>I want a time slot that is</span>
                    
                    {/* Duration Picker Slot */}
                    <div className="relative inline-block">
                        <button 
                            onClick={() => setIsDurationOpen(!isDurationOpen)}
                            className="text-[#f97766] border-b-2 border-dotted border-[#f97766]/40 hover:border-[#f97766] px-2 font-bold italic transition-all focus:outline-none"
                        >
                            {duration.hours}h {duration.minutes}m
                        </button>
                        
                        {isDurationOpen && (
                            <div className="absolute top-full left-0 mt-2 z-50 bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-2xl animate-in zoom-in-95 duration-200 min-w-[150px]">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs font-bold text-muted uppercase tracking-widest">Hours</span>
                                        <input 
                                            type="number" 
                                            value={duration.hours}
                                            onChange={(e) => setDuration(prev => ({ ...prev, hours: Math.max(0, parseInt(e.target.value) || 0) }))}
                                            className="w-16 bg-black/40 border-none rounded-lg px-2 py-1 text-primary font-bold text-center focus:ring-1 ring-primary/30"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs font-bold text-muted uppercase tracking-widest">Minutes</span>
                                        <input 
                                            type="number" 
                                            value={duration.minutes}
                                            onChange={(e) => setDuration(prev => ({ ...prev, minutes: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) }))}
                                            className="w-16 bg-black/40 border-none rounded-lg px-2 py-1 text-primary font-bold text-center focus:ring-1 ring-primary/30"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => setIsDurationOpen(false)}
                                        className="w-full py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/20 transition-all"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <span>long</span>
                </div>

                <div className="text-[22px] text-[#DC8379] leading-relaxed tracking-wide flex flex-wrap items-baseline gap-x-3 gap-y-6" style={{ fontFamily: 'cursive' }}>
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

            {/* Bottom Actions */}
            <div className="mt-12 flex flex-col items-center gap-6">
                <button className="group relative flex items-center gap-3 px-10 py-3 rounded-full bg-[var(--color-primary)] text-[var(--bg-primary)] font-bold text-lg shadow-[0_0_20px_rgba(249,119,102,0.3)] hover:shadow-[0_0_30px_rgba(249,119,102,0.5)] transition-all active:scale-95 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-glint" />
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l2.45 4.96L20 7.71l-4 3.9 1 5.39L12 14.5l-5 2.5 1-5.39-4-3.9 5.55-.75L12 2z" />
                    </svg>
                    <span>Generate</span>
                </button>

                <button className="flex items-center gap-2 text-[#DC8379]/60 hover:text-[#DC8379] transition-all text-sm font-bold group">
                    <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span>View Advanced Options</span>
                </button>
            </div>
        </div>
    );
}
