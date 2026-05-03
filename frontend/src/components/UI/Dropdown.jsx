import { useState, useRef, useEffect } from 'react';

export default function Dropdown({ value, onChange, options, placeholder = "Select...", className = "", align = "left" }) {
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

    const selectedOption = options.find(opt => (typeof opt === 'string' ? opt : opt.value) === value);
    const displayValue = selectedOption ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label) : placeholder;

    return (
        <div className={`relative inline-block ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-2 px-4 py-2 w-full rounded-xl border bg-[var(--bg-raised)] text-neutral font-bold text-sm transition-all outline-none cursor-pointer hover:border-primary/50 ${isOpen ? 'border-[var(--color-primary)] shadow-[0_0_10px_rgba(249,119,102,0.1)]' : 'border-[var(--border-subtle)]'}`}
            >
                <span className="truncate">{displayValue}</span>
                <svg className={`w-4 h-4 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isOpen && (
                <div className={`absolute z-50 mt-1 min-w-full ${align === 'right' ? 'right-0' : 'left-0'} bg-[var(--bg-raised)]/95 backdrop-blur-md border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150`}>
                    <div className="max-h-60 overflow-y-auto p-1 flex flex-col gap-0.5">
                        {options.map((opt, i) => {
                            const val = typeof opt === 'string' ? opt : opt.value;
                            const label = typeof opt === 'string' ? opt : opt.label;
                            const isSelected = val === value;
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        onChange(val);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${isSelected ? 'bg-[var(--color-primary)]/15 text-primary' : 'text-neutral hover:bg-[var(--bg-primary)] hover:text-primary'}`}
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
