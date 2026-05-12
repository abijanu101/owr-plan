import React, { useState, useEffect } from 'react';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';
import { createActivity } from '../api/activitiesApi';
import { listEntities } from '../api/entitiesApi';
import { useNavigate } from 'react-router-dom';
import EntityChip from '../components/EntitySelector/EntityChip';
import Avatar from '../components/avatar';

const ResultCard = ({ result, index, isSelected, onClick, resolveEntity }) => {
    const isTopThree = index < 3;
    const isBest = index === 0;
    const remainingCount = result.attendees.length - 3;

    // Premium background colors
    const bgColor = isSelected
        ? 'bg-[#f97766]'
        : isBest
            ? 'bg-[#3A0B25]'
            : isTopThree
                ? 'bg-[#2D091D]'
                : 'bg-[#1F0715]';

    const borderColor = isSelected
        ? 'border-[#f97766]'
        : isBest
            ? 'border-[#f97766]/40'
            : 'border-[#f97766]/20';

    const textColor = isSelected ? 'text-[#1A0B16]' : 'text-[#f97766]';
    const subTextColor = isSelected ? 'text-[#1A0B16]/50' : 'text-[#f97766]/50';

    const entitiesData = result.attendees.map(a => resolveEntity(a));
    const displayEndTime = result.endTime || calculateEndTime(result.time, result.duration);

    return (
        <div
            onClick={onClick}
            className={`
                relative group transition-all duration-300 cursor-pointer snap-center shrink-0
                ${isSelected ? 'shadow-[0_0_30px_rgba(249,119,102,0.3)]' : ''}
                ${bgColor} border ${borderColor} 
                rounded-[1.2rem] lg:rounded-[1.5rem] shadow-xl hover:brightness-110 active:scale-95 flex flex-col justify-between
                w-[42vw] lg:w-full h-[120px] lg:h-full p-3 lg:p-4
            `}
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className={`${subTextColor} font-bold uppercase tracking-widest mb-0.5 ${isTopThree ? 'text-[9px] lg:text-[10px]' : 'text-[8px] lg:text-[9px]'}`}>
                        {result.date}
                    </span>
                    <div className="flex items-baseline flex-wrap gap-x-1">
                        <span className={`${textColor} font-bold italic whitespace-nowrap transition-all ${isBest ? 'text-lg lg:text-3xl' : isTopThree ? 'text-base lg:text-xl' : 'text-[13px] lg:text-base'}`} style={{ fontFamily: 'cursive' }}>
                            {result.time}
                        </span>
                        {isTopThree && (
                            <span className={`${isSelected ? 'text-[#1A0B16]/30' : 'text-[#f97766]/40'} font-bold italic whitespace-nowrap ${isBest ? 'text-xs lg:text-lg' : 'text-[10px] lg:text-sm'}`} style={{ fontFamily: 'cursive' }}>
                                - {displayEndTime}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`${isSelected ? 'bg-[#1A0B16] text-[#f97766]' : 'bg-[#f97766] text-[#1A0B16]'} font-black shadow-lg shrink-0 border border-black/10 rounded-full px-2 py-0.5 uppercase tracking-tighter leading-none ${isTopThree ? 'text-[8px] lg:text-[10px]' : 'text-[7px] lg:text-[8px]'}`}>
                    {result.duration}
                </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center">
                    {isTopThree ? (
                        <div className={`flex items-center transition-all duration-500 animate-ease-out-back rounded-full ${isSelected ? 'bg-[#4C0E36] px-2 py-1 lg:px-2.5 lg:py-1.5 shadow-lg' : 'bg-transparent px-0 py-0 shadow-none'}`}>
                            <div className="flex -space-x-1.5 lg:-space-x-3.5">
                                {entitiesData.slice(0, 3).map((e, i) => (
                                    <Avatar
                                        key={i}
                                        face={(e.faceIcon || '').split('/').pop() || ''}
                                        accessories={(e.accessories || []).map(acc => typeof acc === 'string' ? acc.split('/').pop() : acc)}
                                        theme={e.theme || 'dark'}
                                        size={typeof window !== 'undefined' && window.innerWidth >= 1024 ? 52 : 22}
                                        isGroup={e.type === 'group'}
                                        bgColor={e.color || '#f97766'}
                                        shape="circle"
                                        className="w-5 h-5 lg:w-[52px] lg:h-[52px] shrink-0 border-2 lg:border-[2.5px] border-[#4C0E36] rounded-full"
                                        style={{ outline: 'none' }}
                                    />
                                ))}
                                {remainingCount > 0 && (
                                    <div className={`w-5 h-5 lg:w-[52px] lg:h-[52px] rounded-full border-2 lg:border-[2.5px] border-[#4C0E36] bg-[#4C0E36] text-[#f97766] flex items-center justify-center text-[7px] lg:text-[12px] font-bold z-30 shadow-lg`}>
                                        +{remainingCount}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-0.5">
                            <span className={`text-[8px] lg:text-[9px] font-bold ${subTextColor} uppercase tracking-widest`}>
                                Attendees
                            </span>
                            <span className={`text-[10px] lg:text-[11px] font-bold ${isSelected ? 'text-[#1A0B16]/80' : 'text-[#f97766]/70'} uppercase tracking-tighter`}>
                                {result.attendees.length} entities
                            </span>
                        </div>
                    )}
                </div>
                {isTopThree && (
                    <div className={`text-[2rem] lg:text-[3.5rem] font-bold ${isSelected ? 'text-[#1A0B16]/10' : 'text-[#f97766]/10'} absolute bottom-0 right-2 lg:right-4 leading-none select-none pointer-events-none`} style={{ fontFamily: 'cursive' }}>
                        #{index + 1}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function PlanResults() {
    const { results, isGenerating, constraints } = usePlan();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isExploding, setIsExploding] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [allEntities, setAllEntities] = useState([]);

    useEffect(() => {
        // Fetch entities to map names to objects
        Promise.all([
            listEntities('person'),
            listEntities('group')
        ]).then(([people, groups]) => {
            setAllEntities([...people, ...groups]);
        });
    }, []);

    const getEntityData = (attendee) => {
        // Handle both string and object attendees
        const name = typeof attendee === 'string' ? attendee : attendee.name;
        const id = typeof attendee === 'object' ? (attendee.id || attendee._id) : null;

        // Try matching by ID first, then by name
        const match = allEntities.find(e =>
            (id && (e.id === id || e._id === id)) ||
            e.name.toLowerCase() === name.toLowerCase()
        );

        return match || { id, name, color: '#f97766' };
    };

    const handleCreateActivity = async () => {
        if (isCreating) return;
        setIsCreating(true);

        try {
            // 1. Extract entities from constraints
            const entities = [];
            constraints.forEach(c => {
                if (c.entity && Array.isArray(c.entity)) {
                    entities.push(...c.entity);
                }
                if (c.type === 'include' && Array.isArray(c.parameter)) {
                    entities.push(...c.parameter);
                }
            });
            const uniqueEntities = [...new Set(entities)];

            // 2. Prepare payload
            // Convert result date/time to a slot
            const formatTime = (t) => {
                if (t.includes('AM') || t.includes('PM')) return t;
                return `${t} AM`; // Default to AM
            };

            const calculateEndTime = (startTime, durationStr) => {
                // Simplistic duration parsing (e.g., "1.5hr", "2hr")
                const durationHours = parseFloat(durationStr);
                const [timePart, period] = formatTime(startTime).split(' ');
                let [h, m] = timePart.split(':').map(Number);
                if (period === 'PM' && h !== 12) h += 12;
                if (period === 'AM' && h === 12) h = 0;

                const d = new Date();
                d.setHours(h, m + (durationHours * 60), 0, 0);

                let nh = d.getHours();
                const nm = d.getMinutes();
                const nPeriod = nh >= 12 ? 'PM' : 'AM';
                nh = nh % 12 || 12;
                return `${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')} ${nPeriod}`;
            };

            const payload = {
                userId: user?._id,
                title: "Hangout Plan",
                participants: uniqueEntities,
                scheduleMode: 'structured',
                slots: [{
                    day: 'Monday', // Fallback, should ideally be derived from date
                    startTime: formatTime(currentSelection.time),
                    endTime: calculateEndTime(currentSelection.time, currentSelection.duration),
                    label: 'Planned Slot'
                }],
                recurrence: { enabled: false }
            };

            const data = await createActivity(payload);

            if (data?.activity?._id) {
                navigate(`/activities/${data.activity._id}`);
            } else if (data?._id) {
                navigate(`/activities/${data._id}`);
            } else {
                throw new Error('No activity ID returned');
            }
        } catch (error) {
            console.error('Quick create error:', error);
            // Fallback
            navigate('/activities/create');
        } finally {
            setIsCreating(false);
        }
    };

    const [randomStep] = useState(() => {
        const steps = [
            "making owr plan",
            "generating possibilities",
            "resolving constraints",
            "optimizing for maximum consistency",
            "plotting the best path"
        ];
        return steps[Math.floor(Math.random() * steps.length)];
    });

    useEffect(() => {
        if (!isGenerating && results && !showContent) {
            setIsExploding(true);
            // Delay content reveal to trigger almost immediately after the heart pop begins
            const timer = setTimeout(() => {
                setShowContent(true);
            }, 800);
            const explodeTimer = setTimeout(() => {
                setIsExploding(false);
            }, 500);
            return () => {
                clearTimeout(timer);
                clearTimeout(explodeTimer);
            };
        }
    }, [isGenerating, results, showContent]);

    if (isGenerating && !isExploding) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 overflow-hidden relative animate-in fade-in duration-1000">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#DC8379]/5 blur-[120px] rounded-full animate-pulse" />
                <div className="relative w-48 h-48 mb-12 transition-all duration-700 ease-in-out">
                    <div className="absolute inset-0 border-2 border-dashed border-[#DC8379]/20 rounded-full" style={{ animation: 'spin 10s linear infinite' }} />
                    <div className="absolute inset-4 border border-[#DC8379]/30 rounded-full" style={{ animation: 'spin-reverse 15s linear infinite' }} />
                    <div className="absolute inset-8 border-2 border-dotted border-[#DC8379]/40 rounded-full" style={{ animation: 'spin 20s linear infinite' }} />
                    <div className="absolute inset-12 flex items-center justify-center">
                        <div className="relative w-full h-full group">
                            <div className="absolute inset-0 bg-[#DC8379] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                            <div className="relative w-full h-full bg-[var(--bg-raised)] border-2 border-[#DC8379] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,131,121,0.3)] overflow-hidden">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="#DC8379" style={{ animation: 'heartbeat 1.2s ease-in-out infinite' }} className="filter drop-shadow-[0_0_8px_rgba(220,131,121,0.5)]">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-0" style={{ animation: 'spin 4s linear infinite' }}><div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#f97766] rounded-full shadow-[0_0_15px_#f97766]" /></div>
                    <div className="absolute inset-0" style={{ animation: 'spin-reverse 6s linear infinite' }}><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#DC8379] rounded-full shadow-[0_0_10px_#DC8379]" /></div>
                </div>
                <div className="text-center relative z-10 flex flex-col items-center justify-center gap-3">
                    <div className="text-xl sm:text-2xl text-[#f97766] font-normal italic" style={{ fontFamily: 'cursive' }}>{randomStep}</div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-[#DC8379] rounded-full animate-bounce [animation-delay:-0.3s]" /><div className="w-1.5 h-1.5 bg-[#DC8379] rounded-full animate-bounce [animation-delay:-0.15s]" /><div className="w-1.5 h-1.5 bg-[#DC8379] rounded-full animate-bounce" />
                    </div>
                </div>
                <style>{`
                    @keyframes heartbeat { 0% { transform: scale(1); } 15% { transform: scale(1.3); } 30% { transform: scale(1); } 45% { transform: scale(1.15); } 60% { transform: scale(1); } }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                    @keyframes pop-in { 0% { transform: scale(0.9); opacity: 0; } 70% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
                    .animate-ease-out-back { animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1) !important; }
                `}</style>
            </div>
        );
    }

    const hasOptions = results?.bestOption || (results?.alternatives?.length > 0);

    if (!isGenerating && !isExploding && (!results || !hasOptions)) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-[#f97766] animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 mb-6 rounded-full bg-[#1A0B16] border-2 border-[#DC8379]/30 flex items-center justify-center shadow-[0_0_30px_rgba(249,119,102,0.1)]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#DC8379]/60"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <h2 className="text-4xl lg:text-5xl font-normal mb-4 text-center" style={{ fontFamily: 'cursive' }}>No Plan Results Found</h2>
                <p className="text-[#DC8379]/60 text-center max-w-md mb-8">
                    Your mandatory constraints were impossible to satisfy. Try relaxing some "must" rules or modifying your date range to generate a successful plan.
                </p>
                <button onClick={() => navigate('/plan')} className="px-8 py-3 rounded-2xl border border-[#f97766]/30 text-[#f97766] font-bold hover:bg-[#f97766]/10 active:scale-95 transition-all shadow-xl">
                    Back to Constraints
                </button>
            </div>
        );
    }

    const allOptions = [results.bestOption, ...(results.alternatives || [])].filter(Boolean);
    const currentSelection = allOptions[selectedIdx];

    // Calculate End Time based on start time and duration
    const calculateEndTime = (startTime, durationStr) => {
        if (!startTime || !durationStr) return startTime;
        const durationHours = parseFloat(durationStr);
        if (isNaN(durationHours)) return startTime;

        let t = startTime.trim();
        if (!t.includes('AM') && !t.includes('PM')) t += ' AM';
        const [timePart, period] = t.split(' ');
        let [h, m] = timePart.split(':').map(Number);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;

        const d = new Date();
        d.setHours(h, m + (durationHours * 60), 0, 0);

        let nh = d.getHours();
        const nm = d.getMinutes();
        const nPeriod = nh >= 12 ? 'PM' : 'AM';
        nh = nh % 12 || 12;
        return `${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')} ${nPeriod}`;
    };

    const handleVisualizeAround = () => {
        const uniqueEntities = [...new Set(currentSelection.attendees.map(a => typeof a === 'object' ? (a.id || a._id) : a))];
        navigate('/visualize', {
            state: {
                entities: uniqueEntities,
                baseDate: currentSelection.date,
                baseTime: currentSelection.time,
                durationStr: currentSelection.duration
            }
        });
    };

    const getCardClass = (index, total) => {
        let baseCls = "animate-in fade-in zoom-in-90 slide-in-from-right-24 duration-700 animate-ease-out-back cursor-pointer transition-all";

        if (index === 0) {
            // #1 Best Option - Full Width
            return `${baseCls} w-full h-[140px] lg:h-[180px]`;
        }

        if (index < 3) {
            // #2 and #3 Top Alternatives - Full on smaller laptops, Half on large
            return `${baseCls} w-full xl:w-[calc(50%-0.5rem)] h-[120px] lg:h-[150px]`;
        }

        // Other Alternatives - Full on smaller laptops, Quarter on large
        return `${baseCls} w-full lg:w-full xl:w-[calc(25%-0.75rem)] h-[110px] lg:h-[130px]`;
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-6 lg:p-12 lg:pt-0 overflow-x-hidden relative">
            {isExploding && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 z-[100]">
                        {Array.from({ length: 60 }).map((_, i) => {
                            const angle = (i / 60) * Math.PI * 2;
                            const velocity = 150 + Math.random() * 300;
                            const x = Math.cos(angle) * velocity;
                            const y = Math.sin(angle) * velocity;
                            const size = 2 + Math.random() * 8;
                            const delay = Math.random() * 0.1;
                            const duration = 0.8 + Math.random() * 0.4;
                            return (
                                <div key={i} className="absolute top-1/2 left-1/2 rounded-full bg-[#f97766] opacity-0"
                                    style={{ width: `${size}px`, height: `${size}px`, '--x': `${x}px`, '--y': `${y}px`, animation: `particle-out ${duration}s cubic-bezier(0.1, 1, 0.3, 1) ${delay}s forwards`, boxShadow: '0 0 12px #f97766' }}
                                />
                            );
                        })}
                    </div>
                    <div className="relative w-48 h-48 mb-12 transition-all duration-1000 ease-out scale-[2.5] opacity-0 blur-md">
                        <div className="absolute inset-0 border-2 border-dashed border-[#DC8379]/20 rounded-full" style={{ animation: 'spin 10s linear infinite' }} />
                        <div className="absolute inset-4 border border-[#DC8379]/30 rounded-full" style={{ animation: 'spin-reverse 15s linear infinite' }} />
                        <div className="absolute inset-8 border-2 border-dotted border-[#DC8379]/40 rounded-full" style={{ animation: 'spin 20s linear infinite' }} />
                        <div className="absolute inset-12 flex items-center justify-center">
                            <div className="relative w-full h-full group">
                                <div className="absolute inset-0 bg-[#DC8379] rounded-full blur-xl opacity-20 transition-opacity animate-pulse" />
                                <div className="relative w-full h-full bg-[var(--bg-raised)] border-2 border-[#DC8379] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,131,121,0.3)] overflow-hidden">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#DC8379" style={{ animation: 'heartbeat 1.2s ease-in-out infinite' }} className="filter drop-shadow-[0_0_8px_rgba(220,131,121,0.5)]">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <style>{`
                        @keyframes particle-out { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0); opacity: 0; } }
                    `}</style>
                </div>
            )}

            {showContent && currentSelection && (
                <div className="relative results-entrance">
                    {/* Full Viewport Blur Overlay */}
                    <div
                        onClick={() => setIsExpanded(false)}
                        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-md transition-opacity duration-500 lg:hidden ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    />

                    <div className={`max-w-[1600px] mx-auto px-6 lg:px-12 flex flex-col gap-6 transition-all duration-500 ${isExpanded ? 'pb-[220px]' : 'pb-12'} lg:pb-0 pt-6 lg:pt-12`}>
                        <div className={`flex-1 flex flex-col lg:flex-row gap-8 lg:gap-12 transition-all duration-500`}>
                            {/* Left Column: Detail View */}
                            <div className="lg:w-[60%] xl:w-1/2 flex-shrink-0 flex flex-col">
                                <div
                                    key={selectedIdx}
                                    className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-24 zoom-in-95 duration-700 animate-ease-out-back"
                                >
                                    <div className="flex flex-col gap-6">
                                        {/* Header Info */}
                                        <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-4">
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <span className="text-[#f97766]/40 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] whitespace-nowrap">{currentSelection.date}</span>
                                                <div className="bg-[#f97766]/10 border border-[#f97766]/30 px-3 py-1.5 rounded-xl text-[#f97766] font-black text-[10px] tracking-widest shadow-glow uppercase shrink-0">
                                                    {currentSelection.score}% MATCH
                                                </div>
                                            </div>
                                            <div className="bg-[#f97766] text-[#1A0B16] font-black shadow-glow border border-[#1A0B16]/20 rounded-full px-4 py-2 uppercase tracking-tighter leading-none text-xs shrink-0">
                                                {currentSelection.duration}
                                            </div>
                                        </div>

                                        {/* Timeline Block */}
                                        <div className="flex flex-col gap-4 relative py-2">
                                            {/* Vertical connecting line */}
                                            <div className="absolute left-4 top-10 bottom-10 w-0.5 bg-gradient-to-b from-[#f97766] via-[#f97766]/40 to-transparent" />

                                            <div className="flex items-center gap-8 group">
                                                <div className="w-8 h-8 rounded-full bg-[#f97766] flex items-center justify-center shadow-glow shrink-0 relative z-10 transition-transform group-hover:scale-110">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1A0B16" stroke="none"><path d="M5 3l14 9-14 9V3z" /></svg>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-[#f97766]/40 uppercase tracking-[0.2em] leading-none mb-1">Start Time</span>
                                                    <h1 className="text-4xl sm:text-5xl lg:text-7xl text-[#f97766] font-normal leading-none" style={{ fontFamily: 'cursive' }}>
                                                        {currentSelection.time}
                                                    </h1>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8 group">
                                                <div className="w-8 h-8 rounded-full bg-[#1A0B16] border-2 border-[#f97766]/40 flex items-center justify-center shrink-0 relative z-10 transition-transform group-hover:scale-110">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97766" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-[#f97766]/40 uppercase tracking-[0.2em] leading-none mb-1">End Time</span>
                                                    <h1 className="text-4xl sm:text-5xl lg:text-7xl text-[#f97766] font-normal leading-none opacity-80" style={{ fontFamily: 'cursive' }}>
                                                        {currentSelection.endTime || calculateEndTime(currentSelection.time, currentSelection.duration)}
                                                    </h1>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <h3 className="text-[10px] font-bold text-[#DC8379]/40 uppercase tracking-[0.2em] flex items-center gap-3">
                                            Attendees <div className="h-px bg-[#DC8379]/10 flex-1" />
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {currentSelection.attendees.map((attendee, i) => {
                                                const data = getEntityData(attendee);
                                                return (
                                                    <EntityChip
                                                        key={i}
                                                        name={data.name}
                                                        color={data.color}
                                                        isSelected={true}
                                                        isGroup={data.type === 'group'}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (data.id || data._id) {
                                                                navigate(`/entities/${data.id || data._id}`);
                                                            }
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-[10px] font-bold text-[#DC8379]/40 uppercase tracking-[0.2em] flex items-center gap-3">
                                            Quest Integrity <div className="h-px bg-[#DC8379]/10 flex-1" />
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-2 custom-scrollbar">
                                            {(currentSelection.commentary || [
                                                { type: 'success', title: 'Temporal Alignment', description: 'Slot fits perfectly within the requested date-time window.' },
                                                { type: 'success', title: 'Full Availability', description: 'All selected entities are confirmed to be free during this slot.' },
                                                { type: 'success', title: 'Score Factor', description: 'Ranked higher based on consistency across all member schedules.' },
                                                { type: 'warning', title: 'Constraint Margin', description: 'Minimal buffer space detected between this and existing activities.' }
                                            ]).map((comment, idx) => (
                                                <div key={idx} className={`${comment.type === 'success' ? 'bg-[#f97766]/5 border-[#f97766]/10' : 'bg-white/5 border-white/10 opacity-60'} border rounded-[1.2rem] p-4 flex items-start gap-4 group hover:brightness-110 transition-all`}>
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-glow ${comment.type === 'success' ? 'bg-[#f97766]/20' : 'bg-white/10'}`}>
                                                        {comment.type === 'success' ? (
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#f97766" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                                        ) : (
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC8379" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className={`text-sm font-bold italic ${comment.type === 'success' ? 'text-[#f97766]' : 'text-[#DC8379]'}`} style={{ fontFamily: 'cursive' }}>{comment.title}</span>
                                                        <p className="text-[10px] text-[#DC8379]/50 leading-relaxed">{comment.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Cards (Desktop only) */}
                            <div className="hidden lg:flex lg:w-[40%] xl:w-1/2 flex-shrink-0 flex flex-col relative h-full">
                                <div className="h-full flex flex-wrap gap-2.5 scroll-smooth content-start">
                                    {allOptions.map((res, i) => (
                                        <div
                                            key={i}
                                            className={getCardClass(i, allOptions.length)}
                                            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                                        >
                                            <ResultCard
                                                result={res}
                                                index={i}
                                                isSelected={selectedIdx === i}
                                                onClick={() => setSelectedIdx(i)}
                                                resolveEntity={getEntityData}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons (Desktop Bottom Right) */}
                                <div className="mt-8 flex justify-end items-center gap-4 w-full animate-in slide-in-from-bottom-4 duration-700 delay-300">
                                    <button
                                        onClick={() => navigate('/plan')}
                                        className="h-[54px] w-[54px] flex items-center justify-center rounded-2xl border border-[#f97766]/30 text-[#f97766] font-semibold hover:bg-[#f97766]/10 transition-all active:scale-95 shadow-lg group"
                                        title="Return to Constraints"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" /></svg>
                                    </button>
                                    <button
                                        onClick={handleVisualizeAround}
                                        className="h-[54px] px-6 rounded-2xl border border-[#f97766]/30 text-[#f97766] font-semibold hover:bg-[#f97766]/10 transition-all active:scale-95 text-sm shadow-lg whitespace-nowrap"
                                    >
                                        Visualize Around
                                    </button>
                                    <button
                                        onClick={handleCreateActivity}
                                        disabled={isCreating}
                                        className="h-[54px] flex items-center justify-center gap-3 px-10 rounded-2xl bg-[#f97766] text-[#1A0B16] font-black hover:brightness-110 transition-all shadow-glow active:scale-95 text-sm min-w-[220px] disabled:opacity-50"
                                    >
                                        {isCreating ? (
                                            <div className="w-5 h-5 border-2 border-[#1A0B16]/30 border-t-[#1A0B16] rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                                                Save Activity
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons (Mobile) */}
                        <div className="lg:hidden mt-12 mb-8 flex items-center gap-2.5 w-full animate-in slide-in-from-bottom-8 duration-1000 delay-300">
                            <button
                                onClick={() => navigate('/plan')}
                                className="h-[56px] w-[56px] shrink-0 flex items-center justify-center rounded-2xl border border-[#f97766]/20 bg-[#f97766]/5 text-[#f97766] transition-all active:scale-90 shadow-lg group"
                                title="Back"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" /></svg>
                            </button>

                            <button
                                onClick={handleVisualizeAround}
                                className="flex-1 h-[56px] flex items-center justify-center rounded-2xl border border-[#f97766]/20 bg-[#f97766]/5 text-[#f97766] font-bold text-[10px] uppercase tracking-[0.15em] transition-all active:scale-95 shadow-lg whitespace-nowrap"
                            >
                                Visualize
                            </button>

                            <button
                                onClick={handleCreateActivity}
                                disabled={isCreating}
                                className="flex-[1.5] h-[56px] flex items-center justify-center gap-2 rounded-2xl bg-[#f97766] text-[#1A0B16] font-black text-[10px] uppercase tracking-[0.15em] transition-all shadow-glow active:scale-95 disabled:opacity-50"
                            >
                                {isCreating ? (
                                    <div className="w-5 h-5 border-2 border-[#1A0B16]/30 border-t-[#1A0B16] rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                                        Save
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Mobile Fixed Option Picker */}
                        <div
                            onClick={() => !isExpanded && setIsExpanded(true)}
                            className={`lg:hidden fixed bottom-0 left-0 right-0 bg-[#1A0B16] z-50 border-t-2 border-[#f97766]/30 backdrop-blur-md transition-all duration-500 ease-in-out ${isExpanded ? 'h-[200px]' : 'h-[52px] cursor-pointer'}`}
                        >
                            {/* Tray Header */}
                            <div className={`flex items-center justify-between px-6 h-[52px] shadow-2xl relative z-[60] transition-colors duration-500 ease-in-out ${isExpanded ? 'bg-[#3A0B25] border-b border-[#f97766]/20' : 'bg-[#f97766]'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-500 ease-in-out ${isExpanded ? 'bg-[#f97766] shadow-[0_0_8px_#f97766]' : 'bg-[#1A0B16]/40'}`} />
                                    <span className={`text-[11px] font-black uppercase tracking-[0.25em] transition-colors duration-500 ease-in-out ${isExpanded ? 'text-[#f97766]' : 'text-[#1A0B16]'}`}>Select a timeslot</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded(!isExpanded);
                                    }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all duration-500 ease-in-out border ${isExpanded ? 'bg-[#1A0B16]/40 text-[#f97766] border-[#f97766]/20' : 'bg-[#1A0B16]/10 text-[#1A0B16] border-[#1A0B16]/20'}`}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className={`transition-transform duration-500 ${isExpanded ? 'rotate-0' : 'rotate-180'}`}>
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>
                            </div>


                            {/* Carousel Area */}
                            <div className={`flex overflow-x-auto gap-3 px-6 py-6 no-scrollbar snap-x snap-mandatory items-center transition-all duration-300 ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                {allOptions.map((res, i) => (
                                    <ResultCard
                                        key={i}
                                        result={res}
                                        index={i}
                                        isSelected={selectedIdx === i}
                                        onClick={() => setSelectedIdx(i)}
                                        resolveEntity={getEntityData}
                                    />
                                ))}



                            </div>
                        </div>
                    </div>

                    <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(249, 119, 102, 0.1); border-radius: 10px; }
@@ -319,7 +525,26 @@ export default function PlanResults() {
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes particle-out { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0); opacity: 0; } }





                    `}</style>

                </div>
            )}
        </div>
    );
}