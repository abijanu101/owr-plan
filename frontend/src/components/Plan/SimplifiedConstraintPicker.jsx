import React, { useState } from 'react';
import DateTimePicker from '../Pickers/DateTimePicker';
import DurationPicker from '../Pickers/DurationPicker';

export default function SimplifiedConstraintPicker({ duration, setDuration, range, setRange }) {

    return (
        <div className="flex flex-col items-center w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Pill - Outside the main box */}
            <div className="inline-block px-5 py-1.5 rounded-full bg-[#4C0E36] border border-[#DC8379]/20 mb-[-14px] sm:mb-[-16px] relative z-10 shadow-lg">
                <span className="text-[14px] sm:text-[16px] text-[#DC8379] font-normal tracking-wide" style={{ fontFamily: 'cursive' }}>
                    Define Constraints
                </span>
            </div>

            {/* Main Sentence Box */}
            <div className="w-full bg-[var(--bg-raised)] rounded-[1.5rem] sm:rounded-[2rem] py-5 sm:py-6 px-5 sm:px-8 border border-[var(--border-subtle)] shadow-xl relative">
                <div className="space-y-2 sm:space-y-3 pl-0 sm:pl-1">
                    {/* Sentence Line 1 */}
                    <div className="text-[15px] sm:text-[18px] text-[#DC8379] leading-relaxed tracking-wide flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-2 sm:gap-y-4" style={{ fontFamily: 'cursive' }}>
                        <span>I want a time slot that is</span>
                        <DurationPicker
                            hours={duration.hours}
                            minutes={duration.minutes}
                            onChange={setDuration}
                        />
                        <span>long</span>
                    </div>

                    {/* Sentence Line 2 */}
                    <div className="text-[15px] sm:text-[18px] text-[#DC8379] leading-relaxed tracking-wide flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 sm:gap-y-2" style={{ fontFamily: 'cursive' }}>
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
