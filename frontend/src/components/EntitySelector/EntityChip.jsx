import React from 'react';

const HeartIcon = () => (
    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);

const HeartOutlineIcon = () => (
    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);

export default function EntityChip({ 
    name, 
    color = '#f97766', 
    isSelected = false, 
    isGroup = false,
    onClick 
}) {
    // Inner chip styles
    // Removed hover:scale-105 from here to handle it at the top level
    const chipBaseClasses = `relative flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-300 whitespace-nowrap text-xs font-bold shadow-sm select-none overflow-hidden`;
    
    const chipStyles = isSelected 
        ? { backgroundColor: color, color: '#fff', border: `2px solid ${color}` }
        : { 
            backgroundColor: `${color}15`, 
            color: color, 
            border: `2px solid ${color}`,
          };

    const content = (
        <div 
            className={chipBaseClasses}
            style={chipStyles}
        >
            {/* Glint effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-glint" />
            </div>

            <div className="flex-shrink-0 relative z-10">
                {isSelected ? <HeartIcon /> : <HeartOutlineIcon />}
            </div>
            <span className="tracking-wide relative z-10">{name}</span>
        </div>
    );

    // Outermost wrapper class for scale and interaction
    const wrapperClasses = `group inline-block transition-all duration-300 cursor-pointer hover:scale-105 hover:brightness-110 active:scale-95 rounded-full`;

    // Ensure both types have the same footprint
    return (
        <div 
            className={`${wrapperClasses} p-[2px] border-2 ${isGroup ? '' : 'border-transparent'}`}
            style={isGroup ? { borderColor: color } : {}}
            onClick={onClick}
        >
            {content}
        </div>
    );
}
