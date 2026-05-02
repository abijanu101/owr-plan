import React, { useState, useEffect } from 'react';
import { usePlan } from '../context/PlanContext';
import { useNavigate } from 'react-router-dom';

export default function PlanResults() {
    const { results, isGenerating } = usePlan();
    const navigate = useNavigate();
    const [isExploding, setIsExploding] = useState(false);
    const [showContent, setShowContent] = useState(false);
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

    // Handle the transition from loading to results
    useEffect(() => {
        if (!isGenerating && results && !showContent) {
            setIsExploding(true);
            const timer = setTimeout(() => {
                setIsExploding(false);
                setShowContent(true);
            }, 800); // Explosion duration
            return () => clearTimeout(timer);
        }
    }, [isGenerating, results, showContent]);

    if (isGenerating || isExploding) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 overflow-hidden relative">
                {/* Background Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#DC8379]/5 blur-[120px] rounded-full animate-pulse" />

                {/* Particle Explosion Layer */}
                {isExploding && (
                    <div className="absolute inset-0 z-50 pointer-events-none">
                        {Array.from({ length: 40 }).map((_, i) => {
                            const angle = (i / 40) * Math.PI * 2;
                            const velocity = 100 + Math.random() * 200;
                            const x = Math.cos(angle) * velocity;
                            const y = Math.sin(angle) * velocity;
                            const size = 2 + Math.random() * 6;
                            const delay = Math.random() * 0.2;
                            return (
                                <div
                                    key={i}
                                    className="absolute top-1/2 left-1/2 rounded-full bg-[#f97766] opacity-0 animate-particle-out"
                                    style={{
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        '--x': `${x}px`,
                                        '--y': `${y}px`,
                                        animationDelay: `${delay}s`,
                                        boxShadow: '0 0 10px #f97766'
                                    }}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Central Animation Container */}
                <div className={`relative w-48 h-48 mb-12 transition-all duration-500 ${isExploding ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}>
                    {/* Outer Rotating Rings */}
                    <div className="absolute inset-0 border-2 border-dashed border-[#DC8379]/20 rounded-full animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-4 border border-[#DC8379]/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                    <div className="absolute inset-8 border-2 border-dotted border-[#DC8379]/40 rounded-full animate-[spin_20s_linear_infinite]" />

                    {/* The "Heart" of the generator */}
                    <div className="absolute inset-12 flex items-center justify-center">
                        <div className="relative w-full h-full group">
                            <div className="absolute inset-0 bg-[#DC8379] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                            <div className="relative w-full h-full bg-[var(--bg-raised)] border-2 border-[#DC8379] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,131,121,0.3)] overflow-hidden">
                                <svg
                                    width="40" height="40" viewBox="0 0 24 24" fill="#DC8379"
                                    className="animate-[heartbeat_1.2s_ease-in-out_infinite] filter drop-shadow-[0_0_8px_rgba(220,131,121,0.5)]"
                                >
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <style>{`
                        @keyframes heartbeat {
                            0% { transform: scale(1); }
                            15% { transform: scale(1.3); }
                            30% { transform: scale(1); }
                            45% { transform: scale(1.15); }
                            60% { transform: scale(1); }
                        }
                        @keyframes particle-out {
                            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                            100% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0); opacity: 0; }
                        }
                        .animate-particle-out {
                            animation: particle-out 0.8s cubic-bezier(0.1, 1, 0.3, 1) forwards;
                        }
                    `}</style>

                    {/* Orbiting Particles */}
                    <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#f97766] rounded-full shadow-[0_0_15px_#f97766]" />
                    </div>
                    <div className="absolute inset-0 animate-[spin_6s_linear_infinite_reverse]">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#DC8379] rounded-full shadow-[0_0_10px_#DC8379]" />
                    </div>
                </div>

                {/* Progress Text */}
                <div className={`text-center relative z-10 flex flex-col items-center justify-center gap-3 transition-all duration-500 ${isExploding ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
                    <div className="text-xl sm:text-2xl text-[#f97766] font-normal italic animate-in fade-in zoom-in-95 duration-700" style={{ fontFamily: 'cursive' }}>
                        {randomStep}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-[#DC8379] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-[#DC8379] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-[#DC8379] rounded-full animate-bounce" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 animate-in fade-in zoom-in-95 duration-1000 ease-out">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl sm:text-5xl text-[#f97766] font-normal mb-8" style={{ fontFamily: 'cursive' }}>
                    Results Found!
                </h1>
                <p className="text-[#DC8379]/60 mb-12">New interface coming soon...</p>
                <button
                    onClick={() => navigate('/plan')}
                    className="px-10 py-4 rounded-full bg-white/5 border border-[#DC8379]/30 text-[#DC8379] font-bold hover:bg-[#DC8379]/10 transition-all active:scale-95"
                >
                    Back to Plan
                </button>
            </div>
        </div>
    );
}
