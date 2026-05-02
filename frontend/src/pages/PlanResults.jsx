import React, { useState, useEffect } from 'react';
import { usePlan } from '../context/PlanContext';
import { useNavigate } from 'react-router-dom';

const ResultCard = ({ result, index, isSelected, onClick }) => {
    const displayAttendees = result.attendees.slice(0, 3);
    const remainingCount = result.attendees.length - 3;
    const isTopThree = index < 3;

    // Responsive background and border colors
    // Mobile: Always the nicer purple
    // Desktop: Top 3 get brighter variant, others get darker
    const bgColor = `
        bg-[#3A0B25]
        ${isTopThree ? 'lg:bg-[#3A0B25]' : 'lg:bg-[#2A081D]'}
    `;
    const borderColor = `
        border-[#f97766]/30
        ${isTopThree ? 'lg:border-[#f97766]/30' : 'lg:border-[#f97766]/10'}
    `;

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
                            {displayAttendees.map((a, i) => (
                                <div key={i} className="w-5 h-5 lg:w-6 lg:h-6 rounded-full border border-[#1A0B16] bg-gradient-to-tr from-[#DC8379]/40 to-[#f97766]/40 flex items-center justify-center text-[7px] lg:text-[8px] text-white font-bold">
                                    {a[0]}
                                </div>
                            ))}
                            {remainingCount > 0 && (
                                <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full border border-[#1A0B16] bg-[#1A0B16]/80 flex items-center justify-center text-[6px] lg:text-[7px] text-[#f97766] font-bold">
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
    const { results, isGenerating } = usePlan();
    const navigate = useNavigate();
    const [isExploding, setIsExploding] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

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
            const timer = setTimeout(() => {
                setIsExploding(false);
                setShowContent(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isGenerating, results]);

    const mockResults = {
        bestOption: { date: "March 25", time: "10:00", duration: "1.5hr", score: 98, attendees: ["Zoha", "Areeba", "Ayesha", "Moomal", "Huda", "Sara", "Fatima", "Zainab"] },
        alternatives: [
            { date: "March 25", time: "12:30", duration: "1.5hr", score: 92, attendees: ["Zoha", "Areeba", "Ayesha", "Moomal", "Huda", "Sara", "Fatima"] },
            { date: "March 26", time: "09:00", duration: "2hr", score: 85, attendees: ["Zoha", "Areeba", "Moomal", "Huda", "Sara", "Fatima"] },
            { date: "March 26", time: "15:00", duration: "2hr", score: 82, attendees: ["Zoha", "Ayesha", "Moomal", "Huda", "Sara", "Fatima"] },
            { date: "March 27", time: "11:00", duration: "2hr", score: 79, attendees: ["Zoha", "Areeba", "Ayesha", "Huda", "Sara", "Fatima"] },
            { date: "March 27", time: "14:00", duration: "1.5hr", score: 75, attendees: ["Zoha", "Areeba", "Ayesha", "Moomal", "Sara", "Fatima"] },
            { date: "March 28", time: "10:00", duration: "2hr", score: 72, attendees: ["Zoha", "Areeba", "Ayesha", "Moomal", "Huda", "Fatima"] },
            { date: "March 28", time: "16:30", duration: "1.5hr", score: 68, attendees: ["Areeba", "Ayesha", "Moomal", "Huda", "Sara", "Fatima"] },
            { date: "March 29", time: "09:00", duration: "2hr", score: 65, attendees: ["Zoha", "Areeba", "Ayesha", "Moomal", "Huda", "Sara"] },
            { date: "March 29", time: "13:00", duration: "1.5hr", score: 60, attendees: ["Zoha", "Areeba", "Ayesha", "Moomal", "Huda", "Fatima"] },
            { date: "March 30", time: "10:00", duration: "2hr", score: 55, attendees: ["Zoha", "Areeba", "Ayesha", "Moomal", "Sara", "Fatima"] },
        ]
    };

    const activeResults = results || mockResults;
    const allOptions = [activeResults.bestOption, ...(activeResults.alternatives || [])];
    const currentSelection = allOptions[selectedIdx];

    if (isGenerating || isExploding) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 overflow-hidden relative animate-in fade-in duration-1000">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#DC8379]/5 blur-[120px] rounded-full animate-pulse" />
                {isExploding && (
                    <div className="absolute inset-0 z-[100] pointer-events-none">
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
                )}
                <div className={`relative w-48 h-48 mb-12 transition-all duration-700 ease-in-out ${isExploding ? 'scale-[2.5] opacity-0 blur-md' : 'scale-100 opacity-100'}`}>
                    <div className="absolute inset-0 border-2 border-dashed border-[#DC8379]/20 rounded-full animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-4 border border-[#DC8379]/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                    <div className="absolute inset-8 border-2 border-dotted border-[#DC8379]/40 rounded-full animate-[spin_20s_linear_infinite]" />
                    <div className="absolute inset-12 flex items-center justify-center">
                        <div className="relative w-full h-full group">
                            <div className="absolute inset-0 bg-[#DC8379] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                            <div className="relative w-full h-full bg-[var(--bg-raised)] border-2 border-[#DC8379] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,131,121,0.3)] overflow-hidden">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="#DC8379" className="animate-[heartbeat_1.2s_ease-in-out_infinite] filter drop-shadow-[0_0_8px_rgba(220,131,121,0.5)]">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-0 animate-[spin_4s_linear_infinite]"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#f97766] rounded-full shadow-[0_0_15px_#f97766]" /></div>
                    <div className="absolute inset-0 animate-[spin_6s_linear_infinite_reverse]"><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#DC8379] rounded-full shadow-[0_0_10px_#DC8379]" /></div>
                </div>
                <div className={`text-center relative z-10 flex flex-col items-center justify-center gap-3 transition-all duration-700 ease-in-out ${isExploding ? 'opacity-0 translate-y-12 blur-sm' : 'opacity-100 translate-y-0'}`}>
                    <div className="text-xl sm:text-2xl text-[#f97766] font-normal italic" style={{ fontFamily: 'cursive' }}>{randomStep}</div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-[#DC8379] rounded-full animate-bounce [animation-delay:-0.3s]" /><div className="w-1.5 h-1.5 bg-[#DC8379] rounded-full animate-bounce [animation-delay:-0.15s]" /><div className="w-1.5 h-1.5 bg-[#DC8379] rounded-full animate-bounce" />
                    </div>
                </div>
                <style>{`
                    @keyframes heartbeat { 0% { transform: scale(1); } 15% { transform: scale(1.3); } 30% { transform: scale(1); } 45% { transform: scale(1.15); } 60% { transform: scale(1); } }
                    @keyframes particle-out { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0); opacity: 0; } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-6 lg:p-12 lg:pt-0 animate-in fade-in duration-1000 ease-out">
            <div className={`max-w-7xl mx-auto flex flex-col gap-6 transition-all duration-500 ${isExpanded ? 'pb-[160px]' : 'pb-12'} lg:pb-0 pt-6 lg:pt-12`}>

                <div className={`flex-1 flex flex-col lg:flex-row gap-8 lg:gap-16 transition-all duration-500 ${isExpanded ? 'blur-sm lg:blur-none scale-[0.98] lg:scale-100' : ''}`}>
                    {/* Left Column: Detail View */}
                    <div className="flex-1 flex flex-col gap-8 animate-in slide-in-from-left-8 duration-700">
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
                                {currentSelection.attendees.map((name, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-default group">
                                        <div className="w-6 h-6 rounded-full bg-[#f97766]/20 flex items-center justify-center text-[10px] text-[#f97766] font-bold">
                                            {name[0]}
                                        </div>
                                        <span className="text-sm text-[#DC8379] font-medium">{name}</span>
                                    </div>
                                ))}
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
                        <div className="h-full flex flex-wrap gap-2.5 scroll-smooth content-start animate-in slide-in-from-right-8 duration-700">
                            {allOptions.map((res, i) => (
                                <div key={i} className={`w-full ${i === 0 ? 'h-[26%]' : i < 3 ? 'lg:w-[calc(50%-0.35rem)] h-[21%]' : 'lg:w-[calc(25%-0.5rem)] h-[19%]'}`}>
                                    <ResultCard result={res} index={i} isSelected={selectedIdx === i} onClick={() => setSelectedIdx(i)} />
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons (Desktop Bottom Right / Mobile Floating) */}
                        <div className={`mt-6 flex flex-col sm:flex-row items-center gap-3 w-full animate-in slide-in-from-bottom-4 duration-700 delay-300 transition-all ${isExpanded ? 'blur-sm lg:blur-none' : ''}`}>
                            <button onClick={() => navigate('/plan')} className="w-full sm:flex-1 px-6 py-3 rounded-2xl border border-[#f97766]/30 text-[#f97766] font-semibold hover:bg-[#f97766]/10 transition-all active:scale-95 text-sm">
                                Retune
                            </button>
                            <button className="w-full sm:flex-[2] flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-[#f97766] text-[#1A0B16] font-bold hover:brightness-110 transition-all shadow-lg active:scale-95 text-sm">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                Save & Export
                            </button>
                        </div>
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
            `}</style>
        </div>
    );
}
