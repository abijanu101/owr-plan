import React from 'react';
import Button from '../UI/Button';

export default function StructuredSidebar({ mode, setMode, status, onReset, onGenerate, isMobile }) {
    
    // status could be: { consistent: true, message: "Constraints consistent, you may generate." }
    // or { consistent: false, message: "Zoha's constraints are inconsistent and so no solution possible." }

    const isConsistent = status?.consistent !== false;
    const statusMessage = status?.message || "Constraints consistent, you may generate.";

    return (
        <div className={`flex flex-col gap-8 ${isMobile ? 'w-full' : 'w-[320px] shrink-0'}`}>
            
            {/* Header Pill */}
            {!isMobile && (
                <div className="flex justify-center">
                    <div className="inline-block px-8 py-3 rounded-full bg-[var(--bg-raised)] border border-[var(--border-subtle)] shadow-xl relative z-10">
                        <span className="text-[24px] text-[#DC8379] font-normal tracking-wide" style={{ fontFamily: 'cursive' }}>
                            Define Constraints
                        </span>
                    </div>
                </div>
            )}

            {/* Mode Toggles */}
            <div className="flex gap-4">
                <button 
                    onClick={() => setMode('global')}
                    className={`flex-1 aspect-square sm:aspect-auto sm:py-8 rounded-2xl border flex items-center justify-center text-center transition-all cursor-pointer shadow-lg
                        ${mode === 'global' ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border-[var(--color-primary)] scale-105 shadow-[0_0_20px_rgba(249,119,102,0.3)]' : 'bg-[var(--bg-raised)] text-[#DC8379] border-[var(--border-subtle)] hover:border-[#DC8379]/50 hover:bg-white/5'}`}
                >
                    <span className="text-xl sm:text-2xl font-normal leading-tight px-4" style={{ fontFamily: 'cursive' }}>Global<br/>Constraints</span>
                </button>
                <button 
                    onClick={() => setMode('local')}
                    className={`flex-1 aspect-square sm:aspect-auto sm:py-8 rounded-2xl border flex items-center justify-center text-center transition-all cursor-pointer shadow-lg
                        ${mode === 'local' ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border-[var(--color-primary)] scale-105 shadow-[0_0_20px_rgba(249,119,102,0.3)]' : 'bg-[var(--bg-raised)] text-[#DC8379] border-[var(--border-subtle)] hover:border-[#DC8379]/50 hover:bg-white/5'}`}
                >
                    <span className="text-xl sm:text-2xl font-normal leading-tight px-4" style={{ fontFamily: 'cursive' }}>Local<br/>Constraints</span>
                </button>
            </div>

            {/* Status Box */}
            <div className={`p-5 rounded-2xl flex items-center gap-4 transition-colors duration-300 ${isConsistent ? 'bg-black/20' : 'bg-[#1a0f12] border border-red-900/30'}`}>
                {/* Heart Icon */}
                <div className="shrink-0 relative">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill={isConsistent ? "#5a3a45" : "#4a2a35"} className="transition-colors">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    {!isConsistent && (
                        <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in">
                            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#24141c" strokeWidth="3" className="rotate-45">
                                <line x1="12" y1="2" x2="12" y2="22" />
                            </svg>
                        </div>
                    )}
                </div>
                
                <div className="flex-1 text-[15px] leading-snug" style={{ fontFamily: 'sans-serif' }}>
                    {isConsistent ? (
                        <span className="text-muted">Constraints <span className="text-[#DC8379] font-bold">consistent</span>, you may generate.</span>
                    ) : (
                        <span className="text-muted" dangerouslySetInnerHTML={{ __html: statusMessage.replace(/inconsistent/, '<span class="text-[#DC8379] font-bold">inconsistent</span>') }} />
                    )}
                </div>
            </div>

        </div>
    );
}
