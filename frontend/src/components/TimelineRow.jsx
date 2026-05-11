import React, { useState, useEffect } from 'react';
import { getActivitiesByEntity } from '../api/activitiesApi';
import Avatar from './avatar';

// --- Helpers copied from BlockVisualization.jsx ---

export function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(' ');
    if (parts.length !== 2) return 0;
    const [time, period] = parts;
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + (minutes || 0);
}

export function getSlotConfig(durationStr) {
    if (durationStr === '12 hr') return { slotMins: 90, count: 8 };
    if (durationStr === '24 hr') return { slotMins: 180, count: 8 };
    if (durationStr === '1 week') return { slotMins: 1440, count: 7 };
    if (durationStr === '1 month') return { slotMins: 1440 * 3, count: 10 };
    return { slotMins: 90, count: 8 };
}

export function getAbsMinutes(date, timeStr) {
    if (!date) return 0;
    const d = new Date(date);
    const mins = parseTimeToMinutes(timeStr);
    d.setHours(0, 0, 0, 0);
    return Math.floor(d.getTime() / 60000) + mins;
}

export function getTimelineBounds(durationStr, offsetSlots, isCustom, customRange) {
    if (isCustom && customRange) {
        const start = getAbsMinutes(customRange.start.date, customRange.start.time);
        const end = getAbsMinutes(customRange.end.date, customRange.end.time);
        const diff = end - start;
        const slotMins = diff > 0 ? diff / 8 : 60;
        return { start, end, slotMins, count: 8 };
    }

    const { slotMins, count } = getSlotConfig(durationStr);

    let baseStart = 480; // Default 8 AM for 12hr view
    if (durationStr === '24 hr') baseStart = 0;
    if (durationStr === '1 week') baseStart = 0;
    if (durationStr === '1 month') baseStart = 0;

    const start = baseStart + (offsetSlots * slotMins);
    const end = start + (slotMins * count);

    return { start, end, slotMins, count };
}

export function formatMinutesToLabel(minutes, durationStr, isCustom) {
    if (isCustom) {
        const d = new Date(minutes * 60000);
        const h = d.getHours();
        const m = d.getMinutes();
        const period = h >= 12 ? 'PM' : 'AM';
        let displayH = h % 12;
        if (displayH === 0) displayH = 12;
        const displayM = m.toString().padStart(2, '0');
        const timeStr = m === 0 ? `${displayH} ${period}` : `${displayH}:${displayM}`;
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${dateStr} ${timeStr}`;
    }

    if (durationStr === '12 hr' || durationStr === '24 hr') {
        let normalized = ((minutes % 1440) + 1440) % 1440;
        let h = Math.floor(normalized / 60);
        let m = Math.floor(normalized % 60);
        let period = h >= 12 ? 'PM' : 'AM';
        let displayH = h % 12;
        if (displayH === 0) displayH = 12;
        const displayM = m.toString().padStart(2, '0');
        return m === 0 ? `${displayH} ${period}` : `${displayH}:${displayM}`;
    } else if (durationStr === '1 week') {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dayIdx = Math.floor(minutes / 1440);
        return days[((dayIdx % 7) + 7) % 7];
    } else {
        const dayIdx = Math.floor(minutes / 1440);
        return `Day ${dayIdx + 1}`;
    }
}

export function calculateBlockStyle(block, durationStr, offsetSlots, isCustom, customRange) {
    const { start, end } = getTimelineBounds(durationStr, offsetSlots, isCustom, customRange);
    const durationMins = end - start;

    let slotStart, slotEnd;

    if (isCustom) {
        slotStart = block.absStart;
        slotEnd = block.absEnd;
    } else {
        slotStart = parseTimeToMinutes(block.startTime);
        slotEnd = parseTimeToMinutes(block.endTime);

        if (durationStr === '1 week' || durationStr === '1 month') {
            const dayOffsets = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6 };
            const offset = (dayOffsets[block.day] || 0) * 1440;
            slotStart += offset;
            slotEnd += offset;
        }
    }

    const leftPct = Math.max(0, Math.min(100, ((slotStart - start) / durationMins) * 100));
    const rightPct = Math.max(0, Math.min(100, ((slotEnd - start) / durationMins) * 100));
    const widthPct = rightPct - leftPct;

    return { left: `${leftPct}%`, width: `${widthPct}%` };
}

// --- Component ---

const TimelineRow = ({ entity, durationStr, offsetSlots, onShift, isCustom, customRange, navigate, compact }) => {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            setIsLoading(true);
            try {
                const data = await getActivitiesByEntity(entity.id);
                setActivities(data);
            } catch (err) {
                console.error("Failed to fetch activities for entity:", entity.id, err);
            } finally {
                setIsLoading(false);
            }
        };
        if (entity?.id) fetchActivities();
    }, [entity?.id]);

    const blocks = [];
    const { start: startAbs, end: endAbs } = getTimelineBounds(durationStr, offsetSlots, isCustom, customRange);

    activities.forEach(act => {
        let slots = act.slots || act.parsedSlots || [];

        if (slots.length === 0 && act.activityType === 'recurring' && act.recurringStartTime) {
            if (act.everyUnit === 'Day' || !act.recurringDay) {
                const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                slots = [{ day: todayName, startTime: act.recurringStartTime, endTime: act.recurringEndTime || act.recurringStartTime, _daily: true }];
            } else {
                slots = [{ day: act.recurringDay, startTime: act.recurringStartTime, endTime: act.recurringEndTime || act.recurringStartTime }];
            }
        }

        if (slots.length === 0 && act.activityType === 'non-recurring' && act.rangeStart) {
            const d = new Date(act.rangeStart);
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const day = dayNames[d.getDay()];
            const fmtTime = (date) => {
                const h = date.getHours();
                const m = date.getMinutes();
                const period = h >= 12 ? 'PM' : 'AM';
                const hh = h % 12 === 0 ? 12 : h % 12;
                const mm = String(m).padStart(2, '0');
                return `${hh}:${mm} ${period}`;
            };
            const startT = fmtTime(d);
            const endT = act.rangeEnd ? fmtTime(new Date(act.rangeEnd)) : startT;
            slots = [{ day, startTime: startT, endTime: endT }];
        }

        slots.forEach(slot => {
            if (isCustom) {
                let current = new Date(startAbs * 60000);
                current.setHours(0, 0, 0, 0);
                const endLimit = new Date(endAbs * 60000);

                while (current <= endLimit) {
                    const dayName = current.toLocaleDateString('en-US', { weekday: 'long' });
                    if (slot._daily || slot.day === dayName) {
                        const s = Math.floor(current.getTime() / 60000) + parseTimeToMinutes(slot.startTime);
                        const e = Math.floor(current.getTime() / 60000) + parseTimeToMinutes(slot.endTime);
                        if (e > startAbs && s < endAbs) {
                            blocks.push({ ...slot, absStart: s, absEnd: e, title: act.title, activityId: act._id || act.id });
                        }
                    }
                    current.setDate(current.getDate() + 1);
                }
            } else {
                if (durationStr === '12 hr' || durationStr === '24 hr' || slot._daily) {
                    blocks.push({ ...slot, title: act.title, activityId: act._id || act.id });
                } else if (slot.day) {
                    blocks.push({ ...slot, title: act.title, activityId: act._id || act.id });
                }
            }
        });
    });

    const { start, slotMins, count } = getTimelineBounds(durationStr, offsetSlots, isCustom, customRange);

    const tickMarks = [...Array(count + 1)].map((_, i) => {
        const mins = start + i * slotMins;
        return formatMinutesToLabel(mins, durationStr, isCustom);
    });

    return (
        <div className={`flex items-center gap-6 group/row hover:scale-[1.02] transition-all duration-300 relative`}>
            <div className={`flex flex-col items-center gap-2 ${compact ? 'w-12' : 'w-16'} shrink-0 mt-[-16px]`}>
                <Avatar
                    face={(entity.faceIcon || '').split('/').pop() || ''}
                    accessories={(entity.accessories || []).map(a => typeof a === 'string' ? a.split('/').pop() : a)}
                    theme={entity.theme || 'dark'}
                    size={compact ? 40 : 48}
                    isGroup={entity.type === 'group'}
                    bgColor={entity.color || '#200412'}
                    shape="rounded"
                    style={{ borderColor: entity.color, borderWidth: compact ? '2px' : '3px' }}
                />
                <span className={`text-[#f97766]/80 ${compact ? 'text-[10px]' : 'text-sm'} tracking-wide truncate max-w-full`}>{entity.name}</span>
            </div>

            <div className="flex-1 relative flex items-center group mb-6">
                <svg onClick={() => onShift && onShift(-1)} className={`w-6 h-6 text-[#f97766]/30 cursor-pointer hover:text-[#f97766] transition-colors shrink-0 ${!onShift && 'invisible'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>

                <div className={`flex-1 ${compact ? 'h-2' : 'h-3'} bg-[#f97766]/20 mx-4 relative rounded-full`}>
                    <div className="absolute inset-0 flex justify-between pointer-events-none">
                        {tickMarks.map((label, i) => (
                            <div key={i} className="relative flex flex-col items-center">
                                <div className={`w-[2px] ${compact ? 'h-4' : 'h-6'} bg-[#f97766]/90 absolute top-1/2 -translate-y-1/2 rounded-full shadow-[0_0_8px_rgba(249,119,102,0.2)]`}></div>
                                <span className={`absolute ${compact ? 'top-5' : 'top-7'} text-[#f97766]/60 ${compact ? 'text-[8px]' : 'text-[10px]'} whitespace-nowrap tracking-wide`}>{label}</span>
                            </div>
                        ))}
                    </div>

                    {blocks.map((block, i) => {
                        const style = calculateBlockStyle(block, durationStr, offsetSlots, isCustom, customRange);
                        if (style.width === '0%') return null;
                        return (
                            <div
                                key={i}
                                onClick={() => navigate && navigate(`/activities/${block.activityId}`)}
                                className={`absolute top-1/2 -translate-y-1/2 ${compact ? 'h-2.5' : 'h-3.5'} rounded-none group/block cursor-pointer shadow-[0_0_8px_rgba(249,119,102,0.35)] z-10 hover:brightness-125 transition-all`}
                                style={{ ...style, backgroundColor: '#f97766' }}
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#200412] border border-[#f97766]/10 rounded-lg text-[#f97766]/90 text-[11px] opacity-0 group-hover/block:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-10 text-center leading-tight">
                                    {block.title.split(' ').map((word, j) => <div key={j}>{word}</div>)}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#200412]"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <svg onClick={() => onShift && onShift(1)} className={`w-6 h-6 text-[#f97766]/30 cursor-pointer hover:text-[#f97766] transition-colors shrink-0 ${!onShift && 'invisible'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    );
};

export default TimelineRow;
