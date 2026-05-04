import { useState, useRef, useEffect } from 'react';

/**
 * Custom dropdown that matches the app's design system.
 *
 * Options array entries can be:
 *   - A plain string / { label, value }              → selectable item
 *   - { isLabel: true, label: string }               → non-interactive category header
 *   - { isDivider: true }                            → horizontal rule
 *   - { label, value, disabled: true }               → greyed-out item
 */
export default function Dropdown({
    value,
    onChange,
    options,
    placeholder = 'Select…',
    className = '',
    align = 'left',
    disabled = false,
    style = {},
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(
        (opt) =>
            !opt?.isDivider &&
            !opt?.isLabel &&
            (typeof opt === 'string' ? opt : opt?.value) === value
    );
    const displayValue = selectedOption
        ? typeof selectedOption === 'string'
            ? selectedOption
            : selectedOption.label
        : placeholder;

    return (
        <div className={`relative inline-block ${className}`} ref={containerRef} style={style}>
            {/* ── Trigger ── */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen((o) => !o)}
                className={[
                    'flex items-center gap-2 px-3 py-1.5 w-full rounded-lg',
                    'text-[var(--color-primary)] font-bold text-sm',
                    'border transition-all duration-150 outline-none select-none',
                    disabled
                        ? 'opacity-40 cursor-not-allowed border-transparent bg-transparent'
                        : isOpen
                        ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 cursor-pointer'
                        : 'border-transparent bg-transparent hover:bg-[var(--color-primary)]/8 hover:border-[var(--color-primary)]/20 cursor-pointer',
                ].join(' ')}
                style={style}
            >
                <span className="flex-1 truncate text-left">{displayValue}</span>
                {!disabled && (
                    <svg
                        className={`w-3.5 h-3.5 text-[var(--color-primary)]/50 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>

            {/* ── Panel ── */}
            {isOpen && (
                <div
                    className={[
                        'absolute z-[200] mt-1.5 py-1.5',
                        'min-w-[180px] max-h-[300px] overflow-y-auto',
                        align === 'right' ? 'right-0' : 'left-0',
                        'bg-[#1A0B16] border border-[#DC8379]/20 rounded-xl shadow-2xl',
                        'animate-in fade-in slide-in-from-top-1 duration-100',
                    ].join(' ')}
                >
                    {options.map((opt, i) => {
                        // Divider
                        if (opt?.isDivider) {
                            return <div key={`div-${i}`} className="my-1 mx-3 h-px bg-[#DC8379]/10" />;
                        }

                        // Category label
                        if (opt?.isLabel) {
                            return (
                                <div
                                    key={`lbl-${i}`}
                                    className="px-3 pt-2 pb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#DC8379]/40 select-none"
                                >
                                    {opt.label}
                                </div>
                            );
                        }

                        // Selectable item
                        const val = typeof opt === 'string' ? opt : opt?.value;
                        const label = typeof opt === 'string' ? opt : opt?.label;
                        const isItemDisabled = typeof opt === 'object' && opt?.disabled;
                        const isSelected = val === value;

                        return (
                            <button
                                key={`opt-${i}`}
                                type="button"
                                disabled={isItemDisabled}
                                onClick={() => { onChange(val); setIsOpen(false); }}
                                className={[
                                    'w-full text-left px-3 py-2 text-sm font-bold transition-colors duration-100',
                                    isItemDisabled
                                        ? 'opacity-35 cursor-not-allowed text-[var(--color-primary)]/60'
                                        : isSelected
                                        ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/15'
                                        : 'text-[var(--color-primary)]/75 cursor-pointer hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]',
                                ].join(' ')}
                            >
                                {isSelected && (
                                    <span className="mr-1.5 opacity-70">✓</span>
                                )}
                                {label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
