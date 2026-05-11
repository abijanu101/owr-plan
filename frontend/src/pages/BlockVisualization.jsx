import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EntitySelector from '../components/EntitySelector';
import { useAuth } from '../context/AuthContext';
import { listEntities } from '../api/entitiesApi';
import { generatePlan } from '../api/planApi';
import { usePlan } from '../context/PlanContext';
import DateTimeRangePicker from '../components/Pickers/DateTimeRangePicker';
import TimelineRow, { parseTimeToMinutes, getSlotConfig } from '../components/TimelineRow';
import DummyTimeline from '../components/DummyTimeline';

// --- REMOVED DUMMY DATA ---

const DURATIONS = ['12 hr', '24 hr', '1 week', '1 month'];


export default function BlockVisualization() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [entities, setEntities] = useState([]);

    // Parse initial state from EntityDetails or PlanResults if available
    const initialState = location.state || {};

    const [selectedEntities, setSelectedEntities] = useState(initialState.selectedEntities || []);

    // Calculate initial duration index based on passed duration
    // DURATIONS = ['12 hr', '24 hr', '1 week', '1 month']
    const initDurationIdx = () => {
        if (!initialState.durationStr) return 0;
        const baseHours = parseFloat(initialState.durationStr) || 1;
        const targetHours = baseHours + 2; // +- 1hr duration -> total +2 hours
        if (targetHours <= 12) return 0; // '12 hr'
        if (targetHours <= 24) return 1; // '24 hr'
        if (targetHours <= 168) return 2; // '1 week'
        return 3; // '1 month'
    };

    const [durationIdx, setDurationIdx] = useState(initDurationIdx());

    const initOffsetSlots = () => {
        if (!initialState.baseTime) return 0;
        let startMins = parseTimeToMinutes(initialState.baseTime);
        const config = getSlotConfig(DURATIONS[initDurationIdx()]);
        let baseStart = DURATIONS[initDurationIdx()] === '12 hr' ? 480 : 0;

        const diffMins = startMins - baseStart;
        const exactOffset = diffMins / config.slotMins;

        // Center the time in the view
        return Math.max(0, Math.floor(exactOffset - config.count / 2.5));
    };

    const [offsetSlots, setOffsetSlots] = useState(initOffsetSlots());
    const [isLoading, setIsLoading] = useState(true);

    const [isCustomRange, setIsCustomRange] = useState(!!initialState.baseDate);
    const [customRange, setCustomRange] = useState(() => {
        if (!initialState.baseDate) {
            return {
                start: { date: new Date(), time: "08:00 AM" },
                end: { date: new Date(), time: "11:59 PM" }
            };
        }

        const baseDate = new Date(initialState.baseDate);
        const durationHours = parseFloat(initialState.durationStr) || 1.5;
        const paddingHours = durationHours * 3; // 300% padding

        // Helper to adjust time with padding
        const adjustTime = (timeStr, offsetHours) => {
            let t = timeStr.trim();
            if (!t.includes('AM') && !t.includes('PM')) t += ' AM';
            let [timePart, period] = t.split(' ');
            let [h, m] = timePart.split(':').map(Number);
            if (period === 'PM' && h < 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;

            const d = new Date(baseDate);
            d.setHours(h, m + (offsetHours * 60));

            let nh = d.getHours();
            const nm = d.getMinutes();
            const np = nh >= 12 ? 'PM' : 'AM';
            const displayH = nh % 12 || 12;

            return {
                date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
                time: `${displayH.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')} ${np}`
            };
        };

        return {
            start: adjustTime(initialState.baseTime || "08:00 AM", -paddingHours),
            end: adjustTime(initialState.baseTime || "08:00 AM", durationHours + paddingHours)
        };
    });

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

    const { setResults, setIsGenerating, setConstraints } = usePlan();

    const handleArrangePlan = async () => {
        if (selectedEntities.length === 0) return;

        const newConstraints = [
            {
                id: Date.now(),
                type: 'be between',
                modifier: 'can',
                parameter: customRange,
                isGlobal: true
            },
            {
                id: Date.now() + 1,
                type: 'include',
                modifier: 'must',
                parameter: selectedEntities,
                isGlobal: true
            }
        ];

        setConstraints(prev => {
            const system = prev.filter(c => c.isSystem);
            return [...system, ...newConstraints];
        });

        setIsGenerating(true);
        navigate('/plan/results');

        try {
            const results = await generatePlan(newConstraints);
            setResults(results);
        } catch (error) {
            console.error('Arrange plan failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    function calculateEndTime(startTime, durationStr) {
        if (!startTime || !durationStr) return "11:59 PM";
        const durationHours = parseFloat(durationStr) || 1.5;
        let t = startTime.trim();
        if (!t.includes('AM') && !t.includes('PM')) t += ' AM';
        let [time, period] = t.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h < 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;

        const d = new Date();
        d.setHours(h, m + (durationHours * 60));

        let nh = d.getHours();
        const nm = d.getMinutes();
        const np = nh >= 12 ? 'PM' : 'AM';
        nh = nh % 12 || 12;
        return `${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')} ${np}`;
    }

    return (
        <div className="bg-[var(--bg-primary)] p-4 sm:p-6 md:p-8 md:pt-0 relative min-h-screen overflow-x-hidden">
            <div className="max-w-5xl mx-auto pt-8 sm:pt-12 flex flex-col gap-8">

                {/* Search Bar container styled to match the visualization image */}
                <div className="relative w-full bg-[#200412] rounded-[1.5rem] border border-[#f97766]/10 hover:border-[#f97766]/30 transition-all shadow-lg overflow-hidden group">
                    {/* EntitySelector is embedded here */}
                    <div className="relative z-10 p-1 sm:p-2">
                        <EntitySelector
                            selectedIds={selectedEntities}
                            onChange={setSelectedEntities}
                            variant="table"
                        />
                    </div>
                </div>

                {/* Main Visualization Area */}
                {selectedEntities.length > 0 ? (
                    <div className="flex flex-col gap-6 mt-4">

                        {/* Adjust Duration Header */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4 text-[#f97766]/80 group/duration cursor-default">
                            {/* Custom Range Toggle */}
                            <button
                                onClick={() => setIsCustomRange(!isCustomRange)}
                                className={`px-5 py-2 rounded-full border transition-all text-sm font-bold tracking-wide ${isCustomRange
                                    ? 'bg-[#f97766] text-[#200412] border-[#f97766] shadow-[0_0_15px_rgba(249,119,102,0.4)]'
                                    : 'border-[#f97766]/30 hover:border-[#f97766]/60 hover:bg-[#f97766]/5'
                                    }`}
                            >
                                {isCustomRange ? 'Custom Range: ON' : 'Set Custom Range'}
                            </button>

                            {!isCustomRange && (
                                <div className="flex items-center gap-2">
                                    <span className="text-base sm:text-lg tracking-wide">Adjust Duration:</span>
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
                            )}
                        </div>

                        {isCustomRange && (
                            <div className="flex justify-end mt-[-8px]">
                                <DateTimeRangePicker
                                    variant="inline-text"
                                    initialStart={customRange.start}
                                    initialEnd={customRange.end}
                                    onChange={(range) => setCustomRange(range)}
                                />
                            </div>
                        )}

                        {/* Timelines */}
                        <div className="flex flex-col gap-8">
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
                                        isCustom={isCustomRange}
                                        customRange={customRange}
                                        navigate={navigate}
                                    />
                                );
                            })}
                        </div>

                        {/* Arrange Plan Button */}
                        <div className="flex justify-end mt-12">
                            <button
                                onClick={handleArrangePlan}
                                className="bg-[#f97766] hover:bg-[#e86655] text-[#200412] px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-colors shadow-lg cursor-pointer"
                            >
                                Arrange plan
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <div className="text-center mb-4">
                            <p className="text-[#f97766]/40 text-sm font-medium italic tracking-wide">Select an entity above to see their schedule</p>
                            <br />
                        </div>
                        <DummyTimeline />
                    </div>
                )}

            </div>
        </div>
    );
}
