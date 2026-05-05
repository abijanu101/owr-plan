import React, { useState } from 'react';
import { CONSTRAINT_SCHEMA, getDefaultParameter } from './ConstraintSchema';
import DateTimePicker from '../../Pickers/DateTimePicker';
import DateTimeRangePicker from '../../Pickers/DateTimeRangePicker';
import DurationPicker from '../../Pickers/DurationPicker';
import TimePicker from '../../Pickers/TimePicker';
import EntitySelector from '../../EntitySelector';
import MultiDatePicker from '../../Pickers/MultiDatePicker';
import Dropdown from '../../UI/Dropdown';

export default function GlobalConstraintRow({ constraint, onChange, onRemove, isMobile, hasInclude }) {
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);

    const schema = CONSTRAINT_SCHEMA[constraint.type];

    const handleTypeChange = (newType) => {
        const newSchema = CONSTRAINT_SCHEMA[newType];
        // If the current modifier is not allowed in the new type, pick the first allowed one
        let newModifier = constraint.modifier;
        if (!newSchema.allowedModifiers.includes(newModifier)) {
            newModifier = newSchema.allowedModifiers[0];
        }
        onChange({ ...constraint, type: newType, modifier: newModifier, parameter: getDefaultParameter(newType) });
    };

    const getSummary = () => {
        let paramStr = '...';
        const p = constraint.parameter;
        if (p) {
            switch (schema?.parameterType) {
                case 'DateTimeRangePicker': {
                    const s = p.start ? new Date(p.start) : null;
                    const e = p.end ? new Date(p.end) : null;
                    const sStr = s && !isNaN(s) ? s.toLocaleDateString() : '?';
                    const eStr = e && !isNaN(e) ? e.toLocaleDateString() : '?';
                    paramStr = `${sStr} - ${eStr}`;
                    if (sStr === '?' && eStr === '?') paramStr = '...';
                    break;
                }
                case 'MultiDatePicker':
                    paramStr = Array.isArray(p) && p.length > 0 ? `${p.length} dates` : '...';
                    break;
                case 'DatePicker': {
                    const d = new Date(p);
                    paramStr = p && !isNaN(d) ? d.toLocaleDateString() : '...';
                    break;
                }
                case 'DurationPicker':
                    paramStr = `${p.hours || 0}h ${p.minutes || 0}m`;
                    break;
                case 'TimePicker':
                    paramStr = p;
                    break;
                case 'EntitySelector':
                    paramStr = Array.isArray(p) ? `${p.length} entities` : '';
                    break;
                default:
                    paramStr = '...';
            }
        }
        return (
            <div className="flex gap-2 items-center w-full overflow-hidden" style={{ fontFamily: 'cursive' }}>
                <span className="font-bold text-[#DC8379] shrink-0">{constraint.modifier}</span>
                <span className="text-[#DC8379] shrink-0">{constraint.type}</span>
                <span className="text-[#DC8379]/60 italic truncate text-sm mt-0.5">{paramStr}</span>
            </div>
        );
    };

    const renderParameterInput = () => {
        switch (schema?.parameterType) {
            case 'DateTimeRangePicker':
                // For simplified display, we use the inline-text variant.
                return (
                    <div className="flex-1 min-w-[200px]">
                        <DateTimeRangePicker
                            variant="inline-text"
                            initialStart={constraint.parameter?.start}
                            initialEnd={constraint.parameter?.end}
                            onChange={(p) => onChange({ ...constraint, parameter: p })}
                        />
                    </div>
                );
            case 'MultiDatePicker':
                return (
                    <div className="flex-1 min-w-[150px]">
                        <MultiDatePicker
                            variant="inline-text"
                            initialDates={Array.isArray(constraint.parameter) ? constraint.parameter : [constraint.parameter].filter(Boolean)}
                            onChange={(p) => onChange({ ...constraint, parameter: p })}
                        />
                    </div>
                );
            case 'DatePicker':
                return (
                    <div className="flex-1 min-w-[150px]">
                        <DateTimePicker
                            variant="inline-text"
                            initialDate={constraint.parameter}
                            onChange={(p) => onChange({ ...constraint, parameter: p.date })}
                        />
                    </div>
                );
            case 'DurationPicker':
                return (
                    <div className="flex-1 min-w-[100px]">
                        <DurationPicker
                            hours={constraint.parameter?.hours || 0}
                            minutes={constraint.parameter?.minutes || 0}
                            onChange={(p) => onChange({ ...constraint, parameter: p })}
                        />
                    </div>
                );
            case 'TimePicker':
                return (
                    <div className="flex-1 min-w-[100px]">
                        <TimePicker
                            initialTime={constraint.parameter}
                            variant="inline-text"
                            hideHelperText={true}
                            onChange={(p) => onChange({ ...constraint, parameter: p })}
                        />
                    </div>
                );
            case 'EntitySelector':
                return (
                    <div className="flex-1 min-w-[200px]">
                        <EntitySelector
                            variant="table"
                            maxVisible={3}
                            selectedIds={constraint.parameter || []}
                            onChange={(p) => onChange({ ...constraint, parameter: p })}
                        />
                    </div>
                );
            default:
                return <div className="text-muted text-sm opacity-50">Select a constraint type</div>;
        }
    };

    const getTypeOptions = () => {
        const options = [];
        const groups = {};
        
        Object.keys(CONSTRAINT_SCHEMA).forEach(k => {
            if (CONSTRAINT_SCHEMA[k].localOnly) return;
            if (k === 'include' && hasInclude && constraint.type !== 'include') return;
            
            const cat = CONSTRAINT_SCHEMA[k].category;
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(k);
        });

        Object.keys(groups).forEach((cat, idx) => {
            if (idx > 0) options.push({ isDivider: true });
            options.push({ isLabel: true, label: cat });
            groups[cat].forEach(k => options.push({ label: k, value: k }));
        });
        
        return options;
    };

    const typeOptions = getTypeOptions();
    const modifierOptions = schema?.allowedModifiers.map(m => ({ label: m, value: m })) || [];

    if (isMobile) {
        return (
            <div className={`bg-[var(--bg-accent)]/10 border-l-4 border-[var(--color-primary)] rounded-r-2xl flex flex-col relative mb-4 shadow-sm transition-opacity duration-300 ${constraint.disabled ? 'opacity-40' : 'opacity-100'}`}>
                <div
                    className={`p-3 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-accent)]/20 transition-colors ${isMobileExpanded ? 'border-b border-[var(--border-subtle)]/20' : ''}`}
                    onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                >
                    <div className="flex-1 min-w-0 pr-2">
                        {getSummary()}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <svg 
                            className={`w-4 h-4 text-[#DC8379]/60 transition-transform duration-300 ${isMobileExpanded ? 'rotate-180' : ''}`} 
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>

                        {constraint.isSystem && (constraint.type === 'start after' || constraint.type === 'end before') ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onChange({ ...constraint, disabled: !constraint.disabled }); }}
                                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${!constraint.disabled ? 'text-[#DC8379] bg-[#DC8379]/10' : 'text-[#DC8379]/40 bg-white/5'}`}
                            >
                                {constraint.disabled ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        ) : !constraint.isSystem && (
                            <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="shrink-0 w-6 h-6 rounded-full bg-[#1A0B16] text-red-400 border border-[var(--border-subtle)]/40 flex items-center justify-center font-bold text-sm active:scale-90 transition-all hover:bg-red-500/10">×</button>
                        )}
                    </div>
                </div>

                {isMobileExpanded && (
                    <div className="p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-1 w-1/2 relative">
                                <Dropdown 
                                    value={constraint.modifier} 
                                    onChange={(val) => onChange({ ...constraint, modifier: val })} 
                                    options={modifierOptions} 
                                    disabled={constraint.isSystem} 
                                    className="w-full" 
                                    style={{ fontFamily: 'cursive' }}
                                />
                            </div>
                            <div className="flex flex-col gap-1 w-1/2 relative">
                                <Dropdown 
                                    value={constraint.type} 
                                    onChange={handleTypeChange} 
                                    options={typeOptions} 
                                    disabled={constraint.isSystem} 
                                    className="w-full" 
                                    style={{ fontFamily: 'cursive' }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="pt-1">
                                {renderParameterInput()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Desktop Table Row
    return (
        <div className={`flex items-center border-b border-[#DC8379]/10 group transition-all duration-300 min-h-[44px] ${constraint.disabled ? 'opacity-40 grayscale-[0.5]' : 'opacity-100 grayscale-0'}`}>
            {/* Remove Button */}
            <div className="w-12 shrink-0 flex justify-center">
                {constraint.isSystem && (constraint.type === 'start after' || constraint.type === 'end before') ? (
                    <button
                        onClick={() => onChange({ ...constraint, disabled: !constraint.disabled })}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${!constraint.disabled ? 'text-[#DC8379] bg-[#DC8379]/10 hover:bg-[#DC8379]/20' : 'text-[#DC8379]/40 bg-white/5 hover:bg-white/10'}`}
                        title={constraint.disabled ? "Enable constraint" : "Disable constraint"}
                    >
                        {constraint.disabled ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                    </button>
                ) : !constraint.isSystem && (
                    <button
                        onClick={onRemove}
                        className="w-5 h-5 rounded-full bg-[#DC8379]/20 text-[#DC8379] hover:bg-[#DC8379] hover:text-[#1A0B16] flex items-center justify-center font-bold text-xs opacity-50 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Modifier Cell */}
            <div className="w-28 sm:w-32 shrink-0 border-r border-[#DC8379]/10 py-1.5 px-3 relative flex items-center hover:bg-white/5 transition-colors">
                <Dropdown 
                    value={constraint.modifier} 
                    onChange={(val) => onChange({ ...constraint, modifier: val })} 
                    options={modifierOptions} 
                    disabled={constraint.isSystem} 
                    className="w-full" 
                    style={{ fontFamily: 'cursive' }}
                />
            </div>

            {/* Constraint Cell */}
            <div className="w-40 sm:w-48 shrink-0 border-r border-[#DC8379]/10 py-1.5 px-3 relative flex items-center hover:bg-white/5 transition-colors">
                <Dropdown 
                    value={constraint.type} 
                    onChange={handleTypeChange} 
                    options={typeOptions} 
                    disabled={constraint.isSystem} 
                    className="w-full" 
                    style={{ fontFamily: 'cursive' }}
                />
            </div>

            {/* Parameter Cell */}
            <div className="flex-1 py-1.5 px-3 min-w-[200px] flex items-center hover:bg-white/5 transition-colors">
                {renderParameterInput()}
            </div>
        </div>
    );
}
