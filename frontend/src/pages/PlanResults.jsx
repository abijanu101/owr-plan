import React, { useState, useEffect } from 'react';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';
import { createActivity } from '../api/activitiesApi';
import { listEntities } from '../api/entitiesApi';
import { useNavigate } from 'react-router-dom';
import EntityChip from '../components/EntitySelector/EntityChip';
import { PersonIcon, GroupIcon } from '../components/EntityIcons';

const ResultCard = ({ result, index, isSelected, onClick, resolveEntity }) => {
    const isTopThree = index < 3;
    const remainingCount = result.attendees.length - 3;

    // Responsive background and border colors
    const bgColor = `
        bg-[#3A0B25]
        ${isTopThree ? 'lg:bg-[#3A0B25]' : 'lg:bg-[#2A081D]'}
    `;
    const borderColor = `
        border-[#f97766]/30
        ${isTopThree ? 'lg:border-[#f97766]/30' : 'lg:border-[#f97766]/10'}
    `;

    const entitiesData = result.attendees.map(a => resolveEntity(a));

    return (
        <div
            onClick={onClick}
            className={`
                relative group transition-all duration-300 cursor-pointer snap-center shrink-0
                ${isSelected ? 'ring-2 ring-[#f97766] scale-[1.02]' : 'hover:scale-[1.01]'}
                ${bgColor} border ${borderColor} p-2.5 lg:p-3
                rounded-[1.2rem] lg:rounded-[1.5rem] shadow-xl hover:brightness-110 active:scale-95 flex flex-col justify-between
                w-[42vw] lg:w-full h-[110px] lg:h-full
            `}
        >
            <div className="flex justify-between items-start mb-1 lg:mb-1.5">
                <div className="flex flex-col">
                    <span className={`text-[#f97766]/60 font-bold uppercase tracking-widest mb-0.5 ${isTopThree ? 'text-[8px] lg:text-[10px]' : 'text-[7px] lg:text-[8px]'}`}>
                        {result.date}
                    </span>
                    <span className={`text-[#f97766] font-bold italic transition-all ${isTopThree ? 'text-lg lg:text-2xl' : 'text-base lg:text-lg'}`} style={{ fontFamily: 'cursive' }}>
                        {result.time}
                    </span>
                </div>
                <div className={`bg-[#f97766] text-[#1A0B16] font-bold shadow-lg shrink-0 border border-[#1A0B16]/20 rounded-full ${isTopThree ? 'px-2 py-0.5 lg:px-2.5 lg:py-0.5 text-[9px] lg:text-[10px]' : 'px-1.5 py-0.5 text-[8px] lg:text-[9px]'}`}>
                    {result.duration}
                </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center">
                    {isTopThree ? (
                        <div className="flex -space-x-1.5 lg:-space-x-2">
                            {entitiesData.slice(0, 3).map((e, i) => (
                                e.type === 'group' ? (
                                    <GroupIcon key={i} color={e.color} className="w-5 h-5 lg:w-6 lg:h-6" />
                                ) : (
                                    <PersonIcon key={i} color={e.color} className="w-5 h-5 lg:w-6 lg:h-6" />
                                )
                            ))}
                            {remainingCount > 0 && (
                                <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 border-[#1A0B16] bg-[#1A0B16]/80 flex items-center justify-center text-[6px] lg:text-[7px] text-[#f97766] font-bold z-30">
                                    +{remainingCount}
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="text-[9px] lg:text-[10px] font-bold text-[#f97766]/60 uppercase tracking-wider">
                            {result.attendees.length} entities
                        </span>
                    )}
                </div>
                {isTopThree && (
                    <div className="text-[2.2rem] lg:text-[3rem] font-bold text-[#f97766]/10 absolute bottom-0 right-2 lg:right-3 leading-none select-none" style={{ fontFamily: 'cursive' }}>
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

    if (!results && !isGenerating && !isExploding) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-[#f97766]">
                <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'cursive' }}>No Plan Results Found</h2>
                <button onClick={() => navigate('/plan')} className="px-6 py-2 rounded-xl border border-[#f97766]/30 hover:bg-[#f97766]/10 transition-all">
                    Back to Constraints
                </button>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-[#f97766]">
                <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'cursive' }}>No Plan Results Found</h2>
                <button onClick={() => navigate('/plan')} className="px-6 py-2 rounded-xl border border-[#f97766]/30 hover:bg-[#f97766]/10 transition-all">
                    Back to Constraints
                </button>
            </div>
        );
    }

    const allOptions = [results.bestOption, ...(results.alternatives || [])];
    const currentSelection = allOptions[selectedIdx];

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

            {showContent && (
                <div className="relative results-entrance">
                    {/* Full Viewport Blur Overlay */}
                    <div
                        onClick={() => setIsExpanded(false)}
                        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-md transition-opacity duration-500 lg:hidden ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    />

                    <div className={`max-w-7xl mx-auto flex flex-col gap-6 transition-all duration-500 ${isExpanded ? 'pb-[220px]' : 'pb-12'} lg:pb-0 pt-6 lg:pt-12`}>
                        <div className={`flex-1 flex flex-col lg:flex-row gap-8 lg:gap-16 transition-all duration-500`}>
                            {/* Left Column: Detail View */}
                            <div className="flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-left-32 zoom-in-95 duration-1000 animate-ease-out-back">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-baseline gap-4">
                                        <div className="bg-[#f97766]/10 border border-[#f97766]/30 px-3 py-1 rounded-lg text-[#f97766] font-bold text-sm tracking-tighter shadow-glow">
                                            {currentSelection.score}% MATCH
                                        </div>
                                        <span className="text-[#f97766]/40 text-sm font-bold uppercase tracking-[0.2em]">{currentSelection.date}</span>
                                    </div>
                                    <h1 className="text-5xl sm:text-7xl text-[#f97766] font-normal leading-none" style={{ fontFamily: 'cursive' }}>
                                        {currentSelection.time}
                                    </h1>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <h3 className="text-xs font-bold text-[#DC8379]/40 uppercase tracking-widest flex items-center gap-3">
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

                                <div className="flex flex-col gap-4 flex-1">
                                    <h3 className="text-xs font-bold text-[#DC8379]/40 uppercase tracking-widest flex items-center gap-3">
                                        Quest Integrity <div className="h-px bg-[#DC8379]/10 flex-1" />
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-2 custom-scrollbar">
                                        <div className="bg-[#f97766]/5 border border-[#f97766]/20 rounded-[1.5rem] p-4 flex items-start gap-4 group hover:bg-[#f97766]/10 transition-all">
                                            <div className="w-10 h-10 rounded-full bg-[#f97766]/20 flex items-center justify-center shrink-0 shadow-glow">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97766" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-[#f97766] font-bold italic" style={{ fontFamily: 'cursive' }}>Time Window Met</span>
                                                <p className="text-[10px] text-[#DC8379]/60 leading-relaxed">Slot falls perfectly within the requested availability range.</p>
                                            </div>
                                        </div>
                                        <div className="bg-[#f97766]/5 border border-[#f97766]/20 rounded-[1.5rem] p-4 flex items-start gap-4 group hover:bg-[#f97766]/10 transition-all">
                                            <div className="w-10 h-10 rounded-full bg-[#f97766]/20 flex items-center justify-center shrink-0 shadow-glow">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97766" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-[#f97766] font-bold italic" style={{ fontFamily: 'cursive' }}>Full Attendance</span>
                                                <p className="text-[10px] text-[#DC8379]/60 leading-relaxed">Everyone invited is confirmed free for this duration.</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-4 flex items-start gap-4 opacity-60">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC8379" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-[#DC8379] font-bold italic" style={{ fontFamily: 'cursive' }}>Minor Fatigue Risk</span>
                                                <p className="text-[10px] text-[#DC8379]/40 leading-relaxed">Ayesha has a back-to-back event immediately following this slot.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Cards (Desktop only) */}
                            <div className="hidden lg:flex flex-1 flex flex-col relative h-full">
                                <div className="h-full flex flex-wrap gap-2.5 scroll-smooth content-start">
                                    {allOptions.map((res, i) => (
                                        <div
                                            key={i}
                                            className={`w-full ${i === 0 ? 'h-[26%]' : i < 3 ? 'lg:w-[calc(50%-0.35rem)] h-[21%]' : 'lg:w-[calc(25%-0.5rem)] h-[19%]'} animate-in fade-in zoom-in-90 slide-in-from-right-24 duration-700 animate-ease-out-back`}
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
                                        className="px-8 py-3.5 rounded-2xl border border-[#f97766]/30 text-[#f97766] font-semibold hover:bg-[#f97766]/10 transition-all active:scale-95 text-sm min-w-[180px]"
                                    >
                                        Return to Constraints
                                    </button>
                                    <button
                                        onClick={handleCreateActivity}
                                        disabled={isCreating}
                                        className="flex items-center justify-center gap-2 px-10 py-3.5 rounded-2xl bg-[#f97766] text-[#1A0B16] font-bold hover:brightness-110 transition-all shadow-lg active:scale-95 text-sm min-w-[220px] disabled:opacity-50"
                                    >
                                        {isCreating ? (
                                            <div className="w-5 h-5 border-2 border-[#1A0B16]/30 border-t-[#1A0B16] rounded-full animate-spin" />
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                                        )}
                                        {isCreating ? 'Creating...' : 'Create Activity'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Action Bar (At the end of content) */}
                        <div className="lg:hidden mt-8 mb-4 animate-in slide-in-from-bottom-4 duration-700 delay-400">
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleCreateActivity}
                                    disabled={isCreating}
                                    className="w-full py-4 rounded-2xl bg-[#f97766] text-[#1A0B16] font-bold text-sm shadow-glow flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isCreating ? (
                                        <div className="w-5 h-5 border-2 border-[#1A0B16]/30 border-t-[#1A0B16] rounded-full animate-spin" />
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                                    )}
                                    {isCreating ? 'Creating Activity...' : 'Create Activity'}
                                </button>
                                <button
                                    onClick={() => navigate('/plan')}
                                    className="w-full py-4 rounded-2xl border border-[#f97766]/30 text-[#f97766] font-bold text-sm active:scale-[0.98] transition-all"
                                >
                                    Return to Constraints
                                </button>
                            </div>
                        </div>


                        {/* Mobile Fixed Option Picker */}
                        <div
                            onClick={() => !isExpanded && setIsExpanded(true)}
                            className={`lg:hidden fixed bottom-0 left-0 right-0 bg-[#1A0B16] z-50 border-t-2 border-[#f97766]/30 backdrop-blur-md transition-all duration-500 ease-in-out ${isExpanded ? 'h-[200px]' : 'h-[48px] cursor-pointer'}`}
                        >
                            {/* Tray Header */}
                            <div className="flex items-center justify-between px-6 h-[48px] border-b border-[#f97766]/20 bg-[#3A0B25] shadow-lg relative z-[60]">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#f97766] animate-pulse shadow-[0_0_8px_#f97766]" />
                                    <span className="text-[10px] font-black text-[#f97766] uppercase tracking-[0.25em]">Select a timeslot</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded(!isExpanded);
                                    }}
                                    className="w-8 h-8 rounded-full bg-[#1A0B16]/40 flex items-center justify-center text-[#f97766] active:scale-95 transition-all border border-[#f97766]/20"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-500 ${isExpanded ? 'rotate-0' : 'rotate-180'}`}>
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
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(249, 119, 102, 0.2); }
                .shadow-glow { box-shadow: 0 0 15px rgba(249, 119, 102, 0.2); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes particle-out { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0); opacity: 0; } }
                
                @keyframes results-entrance {
                    0% {
                        transform: translateY(60vh);
                        opacity: 0;
                    }
                    20% {
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .results-entrance {
                    animation: results-entrance 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
            `}</style>
                </div>
            )}
        </div>
    );
}
