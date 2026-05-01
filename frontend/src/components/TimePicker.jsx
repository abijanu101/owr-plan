import { useState, useEffect } from 'react';

const UpArrow = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 15-6-6-6 6" />
    </svg>
);

const DownArrow = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export default function TimePicker({ initialTime = "08:59 AM", onChange }) {
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

    const [time, setTime] = useState(() => parseTime(initialTime));

    // Controlled inputs for text editing
    const [hourInput, setHourInput] = useState(time.hour.toString().padStart(2, '0'));
    const [minuteInput, setMinuteInput] = useState(time.minute.toString().padStart(2, '0'));

    useEffect(() => {
        setHourInput(time.hour.toString().padStart(2, '0'));
        setMinuteInput(time.minute.toString().padStart(2, '0'));
        if (onChange) {
            onChange(`${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')} ${time.period}`);
        }
    }, [time, onChange]);

    const updateTime = (updates) => {
        setTime(prev => ({ ...prev, ...updates }));
    };

    const incHour = () => updateTime({ hour: time.hour === 12 ? 1 : time.hour + 1 });
    const decHour = () => updateTime({ hour: time.hour === 1 ? 12 : time.hour - 1 });
    const incMinute = () => updateTime({ minute: time.minute === 59 ? 0 : time.minute + 1 });
    const decMinute = () => updateTime({ minute: time.minute === 0 ? 59 : time.minute - 1 });

    const handleHourBlur = () => {
        let h = parseInt(hourInput, 10);
        if (isNaN(h) || h < 1) h = 12;
        if (h > 12) h = 12;
        updateTime({ hour: h });
    };

    const handleMinuteBlur = () => {
        let m = parseInt(minuteInput, 10);
        if (isNaN(m) || m < 0) m = 0;
        if (m > 59) m = 59;
        updateTime({ minute: m });
    };

    const handleHourKeyDown = (e) => {
        if (e.key === 'ArrowUp') { e.preventDefault(); incHour(); }
        if (e.key === 'ArrowDown') { e.preventDefault(); decHour(); }
    };

    const handleMinuteKeyDown = (e) => {
        if (e.key === 'ArrowUp') { e.preventDefault(); incMinute(); }
        if (e.key === 'ArrowDown') { e.preventDefault(); decMinute(); }
    };

    const handleHourWheel = (e) => {
        // Prevent page scroll when hovering over inputs
        e.preventDefault();
        if (e.deltaY < 0) incHour();
        else decHour();
    };

    const handleMinuteWheel = (e) => {
        e.preventDefault();
        if (e.deltaY < 0) incMinute();
        else decMinute();
    };

    return (
        <div className="flex items-center gap-6">
            {/* The Main Pill Container */}
            <div className="flex items-center gap-4 bg-[var(--bg-accent)]/20 p-8 rounded-[2.5rem] border border-[var(--border-subtle)]/40 shadow-xl shadow-[var(--bg-primary)] backdrop-blur-sm">

                {/* Hours Section */}
                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={incHour}
                        className="w-14 h-8 flex items-center justify-center rounded-xl border border-[var(--border-subtle)] text-muted hover:text-neutral hover:bg-[var(--bg-raised)] transition-all cursor-pointer active:scale-95"
                        aria-label="Increment hour"
                    >
                        <UpArrow />
                    </button>

                    <input
                        type="text"
                        value={hourInput}
                        onChange={(e) => setHourInput(e.target.value.replace(/\D/g, '').slice(0, 2))}
                        onBlur={handleHourBlur}
                        onKeyDown={handleHourKeyDown}
                        onWheel={handleHourWheel}
                        className="w-16 text-center text-[3.25rem] font-bold text-primary bg-transparent outline-none tabular-nums tracking-tighter"
                    />

                    <button
                        onClick={decHour}
                        className="w-14 h-8 flex items-center justify-center rounded-xl border border-[var(--border-subtle)] text-muted hover:text-neutral hover:bg-[var(--bg-raised)] transition-all cursor-pointer active:scale-95"
                        aria-label="Decrement hour"
                    >
                        <DownArrow />
                    </button>
                </div>

                {/* Separator Colon */}
                <div className="text-primary text-[3.25rem] font-bold pb-2 opacity-80 animate-pulse">:</div>

                {/* Minutes Section */}
                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={incMinute}
                        className="w-14 h-8 flex items-center justify-center rounded-xl border border-[var(--border-subtle)] text-muted hover:text-neutral hover:bg-[var(--bg-raised)] transition-all cursor-pointer active:scale-95"
                        aria-label="Increment minute"
                    >
                        <UpArrow />
                    </button>

                    <input
                        type="text"
                        value={minuteInput}
                        onChange={(e) => setMinuteInput(e.target.value.replace(/\D/g, '').slice(0, 2))}
                        onBlur={handleMinuteBlur}
                        onKeyDown={handleMinuteKeyDown}
                        onWheel={handleMinuteWheel}
                        className="w-16 text-center text-[3.25rem] font-bold text-primary bg-transparent outline-none tabular-nums tracking-tighter"
                    />

                    <button
                        onClick={decMinute}
                        className="w-14 h-8 flex items-center justify-center rounded-xl border border-[var(--border-subtle)] text-muted hover:text-neutral hover:bg-[var(--bg-raised)] transition-all cursor-pointer active:scale-95"
                        aria-label="Decrement minute"
                    >
                        <DownArrow />
                    </button>
                </div>

                {/* Divider Line */}
                <div className="h-20 w-px bg-[var(--border-subtle)] opacity-40 mx-2 rounded-full"></div>

                {/* AM/PM Toggles */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => updateTime({ period: 'AM' })}
                        className={`w-16 py-2.5 rounded-xl font-bold text-sm tracking-wider transition-all border cursor-pointer active:scale-95 ${time.period === 'AM'
                                ? 'bg-white text-[var(--bg-primary)] border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                                : 'text-white border-[var(--border-subtle)] hover:border-white/50 hover:bg-white/5'
                            }`}
                    >
                        AM
                    </button>
                    <button
                        onClick={() => updateTime({ period: 'PM' })}
                        className={`w-16 py-2.5 rounded-xl font-bold text-sm tracking-wider transition-all border cursor-pointer active:scale-95 ${time.period === 'PM'
                                ? 'bg-white text-[var(--bg-primary)] border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                                : 'text-white border-[var(--border-subtle)] hover:border-white/50 hover:bg-white/5'
                            }`}
                    >
                        PM
                    </button>
                </div>
            </div>

            {/* Helper Text */}
            <div className="text-muted text-sm font-medium flex items-center gap-2 opacity-80 pl-2">
                <span>&larr;</span> Scroll, click arrows, or type
            </div>
        </div>
    );
}
