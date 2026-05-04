import { useState, useRef, useEffect } from 'react';

export default function Dropdown({ value, onChange, options, placeholder = "Select...", className = "", align = "left", disabled = false, style = {} }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => !opt.isDivider && !opt.isLabel && (typeof opt === 'string' ? opt : opt.value) === value);
    const displayValue = selectedOption ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label) : placeholder;

    return (
        <div className={`relative inline-block ${className}`} ref={containerRef} style={style}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-2 px-3 py-1.5 w-full rounded-xl border bg-transparent text-[#DC8379] font-bold text-base transition-all outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'} ${isOpen ? 'border-[#DC8379]/40 bg-white/5 shadow-sm' : 'border-transparent hover:border-[#DC8379]/20'}`}
                style={style}
            >
                <span className="truncate">{displayValue}</span>
                {!disabled && (
                    <svg className={`w-4 h-4 text-[#DC8379]/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                )}
            </button>

            {isOpen && (
                <div className={`absolute z-50 mt-1 min-w-[200px] ${align === 'right' ? 'right-0' : 'left-0'} bg-[#1A0B16] border border-[#DC8379]/20 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150`}>
                    <div className="max-h-[300px] overflow-y-auto p-1.5 flex flex-col gap-0.5">
                        {options.map((opt, i) => {
                            if (opt.isDivider) {
                                return <div key={`div-${i}`} className="h-px bg-[#DC8379]/10 my-1.5 mx-2" />;
                            }
                            if (opt.isLabel) {
                                return <div key={`lbl-${i}`} className="px-3 py-1 mt-1 text-xs font-bold text-[#DC8379]/40 uppercase tracking-widest">{opt.label}</div>;
                            }
                            
                            const val = typeof opt === 'string' ? opt : opt.value;
                            const label = typeof opt === 'string' ? opt : opt.label;
                            const isDisabled = typeof opt === 'object' && opt.disabled;
                            const isSelected = val === value;
                            return (
                                <button
                                    key={`opt-${i}`}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => {
                                        onChange(val);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${isDisabled ? 'opacity-40 cursor-not-allowed text-[#DC8379]/60' : isSelected ? 'bg-[#DC8379]/20 text-[#DC8379]' : 'text-[#DC8379]/80 cursor-pointer hover:bg-[#DC8379]/10 hover:text-[#DC8379]'}`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
