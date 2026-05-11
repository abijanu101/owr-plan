import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', duration = 4000, onClose, action }) {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const startTime = Date.now();
        const endTime = startTime + duration;
        let animationFrame;

        const updateProgress = () => {
            const now = Date.now();
            const remaining = endTime - now;
            if (remaining <= 0) {
                setProgress(0);
                setIsVisible(false);
                setTimeout(() => {
                    if (onClose) onClose();
                }, 300); // Wait for fade out animation
            } else {
                setProgress((remaining / duration) * 100);
                animationFrame = requestAnimationFrame(updateProgress);
            }
        };

        animationFrame = requestAnimationFrame(updateProgress);

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [duration, onClose]);

    const handleInteract = () => {
        setIsVisible(false);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300);
    };

    return (
        <div 
            onClick={handleInteract}
            className={`fixed bottom-24 right-6 z-[200] px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border flex flex-col gap-2 transition-all duration-300 cursor-pointer ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            style={{ 
                fontFamily: 'cursive',
                backgroundColor: type === 'error' ? 'rgba(153, 1, 1, 0.15)' : type === 'warning' ? 'rgba(220, 131, 121, 0.15)' : 'rgba(220, 131, 121, 0.1)',
                borderColor: type === 'error' ? 'var(--color-error)' : 'var(--text-neutral)',
                color: type === 'error' ? '#ff4d4d' : 'var(--text-neutral)',
                borderWidth: '1px',
                borderStyle: 'solid',
                minWidth: '280px'
            }}
        >
            <div className="flex items-center gap-3 w-full justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ 
                            backgroundColor: type === 'error' ? 'rgba(153, 1, 1, 0.2)' : 'rgba(220, 131, 121, 0.2)'
                        }}
                    >
                        {type === 'error' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        )}
                    </div>
                    <span className="font-medium pr-2">{message}</span>
                </div>
                {action && (
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            action.onClick(); 
                            handleInteract(); 
                        }}
                        className="ml-auto shrink-0 px-4 py-1.5 rounded-lg text-sm font-bold transition-all hover:bg-white/10 border border-white/20 hover:scale-105 active:scale-95 text-[#f97766]"
                    >
                        {action.label}
                    </button>
                )}
            </div>
            {/* Progress bar */}
            <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden mt-1">
                <div 
                    className="h-full rounded-full ease-linear"
                    style={{ 
                        width: `${progress}%`,
                        backgroundColor: type === 'error' ? 'var(--color-error)' : 'var(--text-neutral)'
                    }}
                />
            </div>
        </div>
    );
}
