import React from 'react';

export default function Button({ 
    children, 
    onClick, 
    variant = 'primary', 
    className = '', 
    icon: Icon,
    style,
    ...props 
}) {
    const baseStyles = "group relative flex items-center gap-2 font-bold transition-all duration-300 active:scale-95 cursor-pointer overflow-hidden select-none";
    
    const variants = {
        primary: "px-6 sm:px-8 py-2.5 rounded-xl bg-[var(--color-primary)] text-[var(--bg-primary)] text-sm sm:text-base shadow-lg hover:shadow-[0_0_25px_rgba(249,119,102,0.5)] hover:scale-[1.03] hover:-translate-y-0.5",
        secondary: "px-4 py-2 rounded-lg text-[#DC8379]/60 hover:text-[#f97766] text-sm hover:bg-white/5",
        ghost: "px-4 py-2 rounded-lg text-[#DC8379]/40 hover:text-[#DC8379] text-sm hover:bg-white/5"
    };

    const combinedStyle = { fontFamily: 'cursive', ...style };
    const isDisabled = props.disabled;

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${isDisabled ? 'opacity-30 grayscale pointer-events-none cursor-default shadow-none' : ''} ${className}`}
            onClick={!isDisabled ? onClick : undefined}
            style={combinedStyle}
            {...props}
        >
            {!isDisabled && variant === 'primary' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-glint" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[var(--color-primary)] blur-2xl transition-opacity duration-500 pointer-events-none" />
                </>
            )}
            {Icon && (
                <Icon className={`w-4 h-4 fill-current transition-transform duration-500 ${variant === 'primary' ? 'group-hover:rotate-12 group-hover:scale-110' : ''}`} />
            )}
            <span className="relative z-10">{children}</span>
        </button>
    );
}
