import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Custom dropdown that matches the app's design system.
 * Uses a portal panel that tracks scroll/resize so it stays aligned with the trigger.
 *
 * Options can be:
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
    const [panelStyle, setPanelStyle] = useState({});
    const containerRef = useRef(null);

    // ── Compute panel position from the trigger's bounding rect ──────────────
    const updatePosition = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUpward = spaceBelow < 240;

        setPanelStyle({
            position: 'fixed',
            width: Math.max(rect.width, 180),
            ...(align === 'right'
                ? { right: window.innerWidth - rect.right }
                : { left: rect.left }),
            ...(openUpward
                ? { bottom: window.innerHeight - rect.top + 6 }
                : { top: rect.bottom + 6 }),
            zIndex: 9999,
        });
    }, [align]);

    // Re-position on every scroll/resize while open
    useEffect(() => {
        if (!isOpen) return;
        updatePosition();

        const handler = () => updatePosition();
        window.addEventListener('scroll', handler, true);   // capture = true catches all scroll containers
        window.addEventListener('resize', handler);
        return () => {
            window.removeEventListener('scroll', handler, true);
            window.removeEventListener('resize', handler);
        };
    }, [isOpen, updatePosition]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            const portal = document.getElementById('dropdown-portal-active');
            if (containerRef.current?.contains(e.target)) return;
            if (portal?.contains(e.target)) return;
            setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Display value ──────────────────────────────────────────────────────────
    const valueIsSet = value !== null && value !== undefined && value !== '';

    const selectableOptions = options.filter(
        (o) => !o?.isDivider && !o?.isLabel && !o?.disabled
    );

    const selectedOption = valueIsSet
        ? selectableOptions.find((opt) => {
              const val = typeof opt === 'string' ? opt : opt?.value;
              return String(val).trim() === String(value).trim();
          })
        : undefined;

    // When there's only 1 possible choice always show it (e.g. 'should'-only modifier)
    const fallbackOption = !selectedOption && selectableOptions.length === 1
        ? selectableOptions[0]
        : undefined;

    const resolvedOption = selectedOption ?? fallbackOption;

    const displayValue = resolvedOption
        ? typeof resolvedOption === 'string'
            ? resolvedOption
            : resolvedOption.label
        : placeholder;

    // ── Panel ──────────────────────────────────────────────────────────────────
    const panel = isOpen && (
        <div
            id="dropdown-portal-active"
            style={panelStyle}
            className={[
                'py-1.5',
                'min-w-[180px] max-h-[300px] overflow-y-auto',
                'bg-[#1A0B16] border border-[#DC8379]/20 rounded-xl shadow-2xl',
                'animate-in fade-in slide-in-from-top-1 duration-100',
            ].join(' ')}
        >
            {options.map((opt, i) => {
                if (opt?.isDivider) {
                    return <div key={`div-${i}`} className="my-1 mx-3 h-px bg-[#DC8379]/10" />;
                }
                if (opt?.isLabel) {
                    return (
                        <div key={`lbl-${i}`}
                            className="px-3 pt-2 pb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#DC8379]/40 select-none">
                            {opt.label}
                        </div>
                    );
                }

                const val   = typeof opt === 'string' ? opt : opt?.value;
                const label = typeof opt === 'string' ? opt : opt?.label;
                const isItemDisabled = typeof opt === 'object' && opt?.disabled;
                const isSelected = valueIsSet && String(val).trim() === String(value).trim();

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
                        {isSelected && <span className="mr-1.5 opacity-70">✓</span>}
                        {label}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className={`relative inline-block ${className}`} ref={containerRef} style={style}>
            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => { if (!disabled) setIsOpen(o => !o); }}
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
            >
                <span className="flex-1 truncate text-left">{displayValue}</span>
                {!disabled && (
                    <svg
                        className={`w-3.5 h-3.5 text-[var(--color-primary)]/50 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>

            {/* Panel via portal — stays synchronized to trigger via scroll/resize listeners */}
            {isOpen && createPortal(panel, document.body)}
        </div>
    );
}
