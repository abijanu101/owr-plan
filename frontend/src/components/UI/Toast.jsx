import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div 
            className={`fixed bottom-24 right-6 z-[200] px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            style={{ 
                fontFamily: 'cursive',
                backgroundColor: type === 'error' ? 'rgba(153, 1, 1, 0.15)' : type === 'warning' ? 'rgba(220, 131, 121, 0.15)' : 'rgba(220, 131, 121, 0.1)',
                borderColor: type === 'error' ? 'var(--color-error)' : 'var(--text-neutral)',
                color: type === 'error' ? '#ff4d4d' : 'var(--text-neutral)',
                borderWidth: '1px',
                borderStyle: 'solid'
            }}
        >
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
            <span className="font-medium">{message}</span>
        </div>
    );
}
