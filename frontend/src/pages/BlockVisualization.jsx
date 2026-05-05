import React, { useState } from 'react';
import EntitySelector from '../components/EntitySelector';
import { useAuth } from '../context/AuthContext';
import { listEntities } from '../api/entitiesApi';
import { getActivitiesByEntity } from '../api/activitiesApi';

// --- REMOVED DUMMY DATA ---

const DURATIONS = ['12 hr', '24 hr', '1 week', '1 month'];

// Helper to convert "09:00 AM" to minutes
function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(' ');
    if (parts.length !== 2) return 0;
    const [time, period] = parts;
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + (minutes || 0);
}

// Get slot config for the chosen duration
function getSlotConfig(durationStr) {
    if (durationStr === '12 hr') return { slotMins: 90, count: 8 };
    if (durationStr === '24 hr') return { slotMins: 180, count: 8 };
    if (durationStr === '1 week') return { slotMins: 1440, count: 7 };
    if (durationStr === '1 month') return { slotMins: 1440 * 3, count: 10 };
    return { slotMins: 90, count: 8 };
}

// Map duration state & offset to a minute range
function getTimelineBounds(durationStr, offsetSlots) {
    const { slotMins, count } = getSlotConfig(durationStr);

    let baseStart = 480; // Default 8 AM for 12hr view
    if (durationStr === '24 hr') baseStart = 0;
    if (durationStr === '1 week') baseStart = 0;
    if (durationStr === '1 month') baseStart = 0;

    const start = baseStart + (offsetSlots * slotMins);
    const end = start + (slotMins * count);

    return { start, end, slotMins, count };
}

// Format minutes into displayable time / day labels
function formatMinutesToLabel(minutes, durationStr) {
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

// Calculate css left and width percentages for a block
function calculateBlockStyle(slot, durationStr, offsetSlots) {
    const { start, end } = getTimelineBounds(durationStr, offsetSlots);
    const durationMins = end - start;

    let slotStart = parseTimeToMinutes(slot.startTime);
    let slotEnd = parseTimeToMinutes(slot.endTime);

    // Simplistic handling for multi-day views to scatter them slightly for visual effect
    if (durationStr === '1 week' || durationStr === '1 month') {
        const dayOffsets = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6 };
        const offset = (dayOffsets[slot.day] || 0) * 1440;
        slotStart += offset;
        slotEnd += offset;
    }

    const leftPct = Math.max(0, Math.min(100, ((slotStart - start) / durationMins) * 100));
    const rightPct = Math.max(0, Math.min(100, ((slotEnd - start) / durationMins) * 100));
    const widthPct = rightPct - leftPct;

    return { left: `${leftPct}%`, width: `${widthPct}%` };
}

// Individual Timeline Row Component
const TimelineRow = ({ entity, durationStr, offsetSlots, onShift }) => {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
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

    // Flatten slots into individual blocks
    const blocks = [];
    activities.forEach(act => {
        const slots = act.slots || act.parsedSlots || [];
        slots.forEach(slot => {
            blocks.push({ ...slot, title: act.title });
        });
    });

    const { start, slotMins, count } = getTimelineBounds(durationStr, offsetSlots);

    // Generate tick mark labels
    const tickMarks = [...Array(count + 1)].map((_, i) => {
        const mins = start + i * slotMins;
        return formatMinutesToLabel(mins, durationStr);
    });

    return (
        <div className="flex items-center gap-6 mt-6 group/row hover:scale-[1.02] transition-all duration-300 relative">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-2 w-16 shrink-0 mt-[-16px]">
                <div className="w-12 h-12 rounded-xl bg-[#200412] flex items-center justify-center overflow-hidden border-[3px] shadow-[0_0_15px_rgba(249,119,102,0.3)]" style={{ borderColor: entity.color }}>
                    <img src={`/avatar/${entity.faceIcon || 'base.svg'}`} alt={entity.name} className="w-full h-full object-cover bg-[var(--bg-primary)]" />
                </div>
                <span className="text-[#f97766]/80 text-sm tracking-wide">{entity.name}</span>
            </div>

            {/* Timeline Line Section */}
            <div className="flex-1 relative flex items-center group mb-6">
                {/* Left Arrow */}
                <svg onClick={() => onShift(-1)} className="w-6 h-6 text-[#f97766]/30 cursor-pointer hover:text-[#f97766] transition-colors shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>

                {/* The Line - thickness increased to h-2 */}
                <div className="flex-1 h-3 bg-[#f97766]/20 mx-4 relative rounded-full">
                    {/* Tick marks & Labels */}
                    <div className="absolute inset-0 flex justify-between pointer-events-none">
                        {tickMarks.map((label, i) => (
                            <div key={i} className="relative flex flex-col items-center">
                                {/* Tick mark line - height increased to 1.5x (h-6) */}
                                <div className="w-[3px] h-6 bg-[#f97766]/90 absolute top-1/2 -translate-y-1/2 rounded-full shadow-[0_0_8px_rgba(249,119,102,0.2)]"></div>
                                {/* Time label below - adjusted for longer tick marks */}
                                <span className="absolute top-7 text-[#f97766]/60 text-[10px] whitespace-nowrap tracking-wide">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Busy Blocks - thickness tripled (h-3 instead of h-1), uses entity color */}
                    {blocks.map((block, i) => {
                        const style = calculateBlockStyle(block, durationStr, offsetSlots);
                        if (style.width === '0%') return null; // block is outside the view range
                        return (
                            <div
                                key={i}
                                className="absolute top-1/2 -translate-y-1/2 h-3.5 rounded-none group/block cursor-pointer shadow-[0_0_12px_rgba(249,119,102,0.5)] z-10"
                                style={{ ...style, backgroundColor: '#f97766' }}
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#200412] border border-[#f97766]/10 rounded-lg text-[#f97766]/90 text-[11px] opacity-0 group-hover/block:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-10 text-center leading-tight">
                                    {block.title.split(' ').map((word, j) => <div key={j}>{word}</div>)}
                                    {/* Tooltip arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#200412]"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Arrow */}
                <svg onClick={() => onShift(1)} className="w-6 h-6 text-[#f97766]/30 cursor-pointer hover:text-[#f97766] transition-colors shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    );
};


export default function BlockVisualization() {
    const { user } = useAuth();
    const [entities, setEntities] = useState([]);
    const [selectedEntities, setSelectedEntities] = useState([]);
    const [durationIdx, setDurationIdx] = useState(0); // 0 -> '12 hr'
    const [offsetSlots, setOffsetSlots] = useState(0); // For timeline left/right shift
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all entities to have metadata available
    React.useEffect(() => {
        const fetchEntities = async () => {
            try {
                const data = await listEntities('all');
                setEntities(data);
            } catch (err) {
                console.error("Failed to fetch entities:", err);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) fetchEntities();
    }, [user]);

    const handleNextDuration = () => {
        setDurationIdx(prev => Math.min(prev + 1, DURATIONS.length - 1));
        setOffsetSlots(0); // reset shift when scaling view
    };

    const handlePrevDuration = () => {
        setDurationIdx(prev => Math.max(prev - 1, 0));
        setOffsetSlots(0); // reset shift when scaling view
    };

    const handleShift = (dir) => {
        setOffsetSlots(prev => prev + dir);
    };

    return (
        <div className="bg-[var(--bg-primary)] p-4 sm:p-6 md:p-8 md:pt-0 relative min-h-screen overflow-x-hidden">
            <div className="max-w-5xl mx-auto pt-8 sm:pt-12 flex flex-col gap-8">

                {/* Search Bar container styled to match the visualization image */}
                <div className="relative w-full bg-[#200412] rounded-[1.5rem] border border-[#f97766]/10 hover:border-[#f97766]/30 transition-all shadow-lg overflow-hidden group">
                    {/* Placeholder styling to show "Search Group or People" */}
                    {selectedEntities.length === 0 && (
                        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-between px-6 sm:px-8">
                            <span className="text-[#f97766]/80 text-lg sm:text-xl tracking-wide">Search Group or People</span>
                            <svg className="text-[#f97766]/80" width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 2L8 8L14 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    )}

                    {/* EntitySelector is embedded here */}
                    <div className={`relative z-10 ${selectedEntities.length === 0 ? 'opacity-0' : 'opacity-100'} hover:opacity-100 transition-opacity p-1 sm:p-2`}>
                        <EntitySelector
                            selectedIds={selectedEntities}
                            onChange={setSelectedEntities}
                            variant="table"
                        />
                    </div>
                </div>

                {/* Main Visualization Area */}
                {selectedEntities.length > 0 && (
                    <div className="flex flex-col gap-6 mt-4">

                        {/* Adjust Duration Header */}
                        <div className="flex items-center justify-end gap-2 text-[#f97766]/80 group/duration cursor-default">
                            <span className="text-base sm:text-lg tracking-wide">Adjust Duration:</span>
                            {/* <img
                                src="/sparkle1.png"
                                className="w-7 h-7 object-contain transition-transform duration-300 group-hover/duration:rotate-[30deg]"
                                style={{ mixBlendMode: 'screen' }}
                                alt="sparkle"
                            /> */}
                            <div className="flex items-center gap-4 ml-2">
                                <span className="w-24 text-center text-lg sm:text-xl font-bold tracking-tight">{DURATIONS[durationIdx]}</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={handlePrevDuration} disabled={durationIdx === 0} className="hover:text-[#f97766] disabled:opacity-30 transition-all hover:scale-125">
                                        <svg width="24" height="16" viewBox="0 0 12 8" fill="none" stroke="currentColor">
                                            <path d="M2 2L6 6L10 2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                    <button onClick={handleNextDuration} disabled={durationIdx === DURATIONS.length - 1} className="hover:text-[#f97766] disabled:opacity-30 transition-all hover:scale-125">
                                        <svg width="24" height="16" viewBox="0 0 12 8" fill="none" className="rotate-180" stroke="currentColor">
                                            <path d="M2 2L6 6L10 2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Timelines */}
                        <div className="flex flex-col gap-2">
                            {selectedEntities.map(entityId => {
                                const entity = entities.find(e => e.id === entityId);
                                if (!entity) return null;
                                return (
                                    <TimelineRow
                                        key={entityId}
                                        entity={entity}
                                        durationStr={DURATIONS[durationIdx]}
                                        offsetSlots={offsetSlots}
                                        onShift={handleShift}
                                    />
                                );
                            })}
                        </div>

                        {/* Arrange Plan Button */}
                        <div className="flex justify-end mt-12">
                            <button className="bg-[#f97766] hover:bg-[#e86655] text-[#200412] px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-colors shadow-lg">
                                Arrange plan
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
