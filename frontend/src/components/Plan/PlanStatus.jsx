import React from 'react';
import { usePlan } from '../../context/PlanContext';

export default function PlanStatus({ variant = 'desktop' }) {
    const { planStatus: status } = usePlan();

    if (!status) return null;

    if (variant === 'mobile') {
        return (
            <div className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ${status.consistent !== false ? 'bg-black/20' : 'bg-[#1a0f12] border border-red-900/30'}`}>
                <div className="shrink-0 relative scale-75">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill={status.consistent !== false ? "#5a3a45" : "#4a2a35"} className="transition-colors">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    {status.consistent === false && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#24141c" strokeWidth="3" className="rotate-45">
                                <line x1="12" y1="2" x2="12" y2="22" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="flex-1 text-xs leading-snug" style={{ fontFamily: 'sans-serif' }}>
                    {status.consistent !== false ? (
                        <span className="text-muted">Constraints <span className="text-[#DC8379] font-bold">consistent</span>, you may generate.</span>
                    ) : (
                        <span className="text-muted" dangerouslySetInnerHTML={{ __html: status.message.replace(/inconsistent/, '<span class="text-[#DC8379] font-bold">inconsistent</span>') }} />
                    )}
                </div>
            </div>
        );
    }

    // Desktop (for ActionBar)
    return (
        <div className="flex items-center gap-2 px-4 border-l border-[#DC8379]/20">
            <div className="relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill={status.consistent !== false ? "#5a3a45" : "#4a2a35"} className="shrink-0 transition-colors">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {status.consistent === false && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#24141c" strokeWidth="2" className="rotate-45">
                            <line x1="12" y1="2" x2="12" y2="22" />
                        </svg>
                    </div>
                )}
            </div>
            <span className="text-xs text-muted leading-tight max-w-[250px]" style={{ fontFamily: 'sans-serif' }}>
                {status.consistent !== false ? (
                    <>Constraints <span className="text-[#DC8379] font-bold">consistent</span>, you may generate.</>
                ) : (
                    <span dangerouslySetInnerHTML={{ __html: status.message.replace(/inconsistent/, '<span class="text-[#DC8379] font-bold">inconsistent</span>') }} />
                )}
            </span>
        </div>
    );
}
