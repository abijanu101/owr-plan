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
            <div className="inline-block px-6 sm:px-10 py-2 sm:py-2.5 rounded-full bg-[#4C0E36] border border-[#DC8379]/20 mb-[-18px] sm:mb-[-20px] relative z-10 shadow-lg">
                <span className="text-[18px] sm:text-[22px] text-[#DC8379] font-normal tracking-wide" style={{ fontFamily: 'cursive' }}>
                    Define Constraints
                </span>
            </div>

            {/* Main Sentence Box */}
            <div className="w-full bg-[var(--bg-raised)] rounded-[2rem] sm:rounded-[2.5rem] py-4 sm:pt-8 sm:pb-6 px-6 sm:px-10 border border-[var(--border-subtle)] shadow-xl relative">
                <div className="space-y-3 sm:space-y-5 pl-0 sm:pl-2">
                    {/* Sentence Line 1 */}
                    <div className="text-[18px] sm:text-[22px] text-[#DC8379] leading-relaxed tracking-wide flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-3 sm:gap-y-6" style={{ fontFamily: 'cursive' }}>
                        <span>I want a time slot that is</span>
                        <DurationPicker
                            hours={duration.hours}
                            minutes={duration.minutes}
                            onChange={setDuration}
                        />
                        <span>long</span>
                    </div>

                    {/* Sentence Line 2 */}
                    <div className="text-[18px] sm:text-[22px] text-[#DC8379] leading-relaxed tracking-wide flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-2 sm:gap-y-3" style={{ fontFamily: 'cursive' }}>
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

        </div>
    );
}
