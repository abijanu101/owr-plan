import React from 'react';
import { CONSTRAINT_SCHEMA, getDefaultParameter } from './ConstraintSchema';
import DateTimePicker from '../Pickers/DateTimePicker';
import DateTimeRangePicker from '../Pickers/DateTimeRangePicker';
import DurationPicker from '../Pickers/DurationPicker';
import TimePicker from '../Pickers/TimePicker';
import EntitySelector from '../EntitySelector';
import MultiDatePicker from '../Pickers/MultiDatePicker';

export default function GlobalConstraintRow({ constraint, onChange, onRemove, isMobile }) {
    // constraint looks like: { id: 1, modifier: 'must', type: 'last for', parameter: {hours:1, minutes:30} }

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

    if (isMobile) {
        return (
            <div className="bg-[var(--bg-raised)]/60 border border-[var(--border-subtle)]/40 rounded-2xl p-4 flex flex-col gap-3 relative">
                <button onClick={onRemove} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-lg active:scale-90 transition-all">
                    ×
                </button>
                <div className="flex gap-4">
                    <div className="flex flex-col gap-1 w-1/2 relative">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-muted">Modifier</span>
                        <select value={constraint.modifier} onChange={(e) => onChange({ ...constraint, modifier: e.target.value })} className="bg-transparent text-[#DC8379] font-bold text-lg outline-none cursor-pointer appearance-none border-b border-[var(--border-subtle)] pb-1 pr-6" style={{ fontFamily: 'cursive' }}>
                            {schema?.allowedModifiers.map(m => (
                                <option key={m} value={m} className="bg-[var(--bg-raised)] text-neutral">{m}</option>
                            ))}
                        </select>
                        <div className="absolute right-0 bottom-2 pointer-events-none text-[#DC8379]/40">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 w-1/2 relative">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-muted">Constraint</span>
                        <select value={constraint.type} onChange={(e) => handleTypeChange(e.target.value)} className="bg-transparent text-[#DC8379] font-bold text-lg outline-none cursor-pointer appearance-none border-b border-[var(--border-subtle)] pb-1 pr-6" style={{ fontFamily: 'cursive' }}>
                            {Object.keys(CONSTRAINT_SCHEMA).filter(k => !CONSTRAINT_SCHEMA[k].localOnly).map(k => (
                                <option key={k} value={k} className="bg-[var(--bg-raised)] text-neutral">{k}</option>
                            ))}
                        </select>
                        <div className="absolute right-0 bottom-2 pointer-events-none text-[#DC8379]/40">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-muted">Parameter</span>
                    <div className="pt-1">
                        {renderParameterInput()}
                    </div>
                </div>
            </div>
        );
    }

    // Desktop Table Row
    return (
        <div className="flex items-center border-b border-[#DC8379]/10 group hover:bg-white/5 transition-colors">
            {/* Remove Button */}
            <div className="w-12 shrink-0 flex justify-center">
                <button
                    onClick={onRemove}
                    className="w-6 h-6 rounded-full bg-[#DC8379]/10 text-[#DC8379] hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center font-bold text-sm opacity-50 group-hover:opacity-100 transition-all cursor-pointer"
                >
                    ×
                </button>
            </div>

            {/* Modifier Cell */}
            <div className="w-25 shrink-0 border-r border-[#DC8379]/10 py-2 pr-3 relative flex items-center">
                <select
                    value={constraint.modifier}
                    onChange={(e) => onChange({ ...constraint, modifier: e.target.value })}
                    className="w-full bg-transparent text-[#DC8379] text-base outline-none cursor-pointer appearance-none text-center pr-4"
                    style={{ fontFamily: 'cursive' }}
                >
                    {schema?.allowedModifiers.map(m => (
                        <option key={m} value={m} className="bg-[var(--bg-raised)] text-neutral">{m}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#DC8379]/40">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
            </div>

            {/* Constraint Cell */}
            <div className="w-40 sm:w-48 shrink-0 border-r border-[#DC8379]/10 py-2 px-3 relative flex items-center">
                <select
                    value={constraint.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full bg-transparent text-[#DC8379] text-base outline-none cursor-pointer appearance-none text-center pr-4"
                    style={{ fontFamily: 'cursive' }}
                >
                    {Object.keys(CONSTRAINT_SCHEMA).filter(k => !CONSTRAINT_SCHEMA[k].localOnly).map(k => (
                        <option key={k} value={k} className="bg-[var(--bg-raised)] text-neutral">{k}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#DC8379]/40">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
            </div>

            {/* Parameter Cell */}
            <div className="flex-1 py-2 px-3 min-w-[200px] flex items-center">
                {renderParameterInput()}
            </div>
        </div>
    );
}
