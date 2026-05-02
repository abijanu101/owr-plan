import React, { useState } from 'react';
import { CONSTRAINT_SCHEMA, getDefaultParameter, getDefaultModifier } from './ConstraintSchema';
import DateTimePicker from '../../Pickers/DateTimePicker';
import DateTimeRangePicker from '../../Pickers/DateTimeRangePicker';
import DurationPicker from '../../Pickers/DurationPicker';
import TimePicker from '../../Pickers/TimePicker';
import EntitySelector from '../../EntitySelector';
import MultiDatePicker from '../../Pickers/MultiDatePicker';

export default function ConstraintBlockRow({ block, onChange, onRemove, isMobile }) {
    const [isMobileCardExpanded, setIsMobileCardExpanded] = useState(false);

    const handleEntityChange = (entities) => {
        onChange({ ...block, entity: entities });
    };

    const handleModifierChange = (mod) => {
        const updatedChildren = block.children ? block.children.map(c => ({ ...c, modifier: mod })) : [];
        onChange({ ...block, modifier: mod, children: updatedChildren });
    };

    const allModifiers = block.children ? block.children.map(c => c.modifier).filter(Boolean) : [];
    const uniqueModifiers = [...new Set(allModifiers)];
    const displayedModifier = block.children && block.children.length > 0
        ? (uniqueModifiers.length === 1 ? uniqueModifiers[0] : '')
        : block.modifier;

    const getSummary = () => {
        const entityCount = block.entity ? block.entity.length : 0;
        const ruleCount = block.children ? block.children.length : 0;
        return (
            <div className="flex gap-2 items-center w-full overflow-hidden" style={{ fontFamily: 'cursive' }}>
                <span className="font-bold text-[#DC8379] shrink-0">{displayedModifier}</span>
                <span className="text-[#DC8379] shrink-0">for</span>
                <span className="text-[#DC8379]/60 italic truncate text-sm mt-0.5">{entityCount} entities, {ruleCount} rules</span>
            </div>
        );
    };

    const toggleExpand = () => {
        onChange({ ...block, isExpanded: !block.isExpanded });
    };

    const addChild = () => {
        const newChild = { id: Date.now(), modifier: '', type: 'last for', parameter: getDefaultParameter('last for') };
        onChange({ ...block, children: [...block.children, newChild], isExpanded: true });
    };

    const removeChild = (childId) => {
        onChange({ ...block, children: block.children.filter(c => c.id !== childId) });
    };

    const updateChild = (childId, newChild) => {
        onChange({ ...block, children: block.children.map(c => c.id === childId ? newChild : c) });
    };

    const renderParameterInput = (constraint, childOnChange) => {
        const schema = CONSTRAINT_SCHEMA[constraint.type];
        switch (schema?.parameterType) {
            case 'DateTimeRangePicker':
                return <DateTimeRangePicker variant="inline-text" initialStart={constraint.parameter?.start} initialEnd={constraint.parameter?.end} onChange={(p) => childOnChange({ ...constraint, parameter: p })} />;
            case 'MultiDatePicker':
                return <MultiDatePicker variant="inline-text" initialDates={constraint.parameter || []} onChange={(p) => childOnChange({ ...constraint, parameter: p })} />;
            case 'DatePicker':
                return <DateTimePicker variant="inline-text" initialDate={constraint.parameter} onChange={(p) => childOnChange({ ...constraint, parameter: p.date })} />;
            case 'DurationPicker':
                return <DurationPicker hours={constraint.parameter?.hours || 0} minutes={constraint.parameter?.minutes || 0} onChange={(p) => childOnChange({ ...constraint, parameter: p })} />;
            case 'TimePicker':
                return <TimePicker initialTime={constraint.parameter} variant="inline-text" hideHelperText={true} onChange={(p) => childOnChange({ ...constraint, parameter: p })} />;
            case 'EntitySelector':
                return <EntitySelector variant="table" maxVisible={3} selectedIds={constraint.parameter || []} onChange={(p) => childOnChange({ ...constraint, parameter: p })} />;
            default:
                return <div className="text-muted text-sm opacity-50">Select parameter</div>;
        }
    };

    if (isMobile) {
        if (isMobile) {
            return (
                <div className="bg-[var(--bg-accent)]/10 border-l-4 border-[var(--color-primary)] rounded-r-2xl flex flex-col relative mb-4 shadow-sm">
                    <div
                        className={`p-3 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-accent)]/20 transition-colors ${isMobileCardExpanded ? 'border-b border-[var(--border-subtle)]/20' : ''}`}
                        onClick={() => setIsMobileCardExpanded(!isMobileCardExpanded)}
                    >
                        <div className="flex-1 min-w-0 pr-4">
                            {getSummary()}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="shrink-0 w-6 h-6 rounded-full bg-[#1A0B16] text-red-400 border border-[var(--border-subtle)]/40 flex items-center justify-center font-bold text-sm active:scale-90 transition-all hover:bg-red-500/10">×</button>
                    </div>

                    {isMobileCardExpanded && (
                        <div className="p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
                            {/* Parent Row */}
                            <div className="flex flex-col gap-2 mt-2">
                                <div className="flex gap-4">
                                    <div className="flex flex-col gap-1 w-1/2 relative">
                                        <select value={displayedModifier} onChange={e => handleModifierChange(e.target.value)} className="bg-transparent text-[#DC8379] font-bold text-lg outline-none cursor-pointer appearance-none border-b border-[var(--border-subtle)] pb-1 pr-6" style={{ fontFamily: 'cursive' }}>
                                            <option value="" disabled className="hidden"></option>
                                            <option value="must" className="bg-[var(--bg-raised)] text-neutral">must</option>
                                            <option value="should" className="bg-[var(--bg-raised)] text-neutral">should</option>
                                        </select>
                                        <div className="absolute right-0 bottom-1.5 pointer-events-none text-[#DC8379]/60 bg-[#DC8379]/5 border border-[#DC8379]/10 rounded p-[1px]">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 w-1/2 relative cursor-pointer" onClick={toggleExpand}>
                                        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-1">
                                            <span className="text-[#DC8379] font-bold text-lg" style={{ fontFamily: 'cursive' }}>for</span>
                                            <div className="absolute right-0 bottom-1.5 text-[#DC8379]/60">
                                                <svg className={`w-3.5 h-3.5 text-[#DC8379] transition-transform ${block.isExpanded ? '' : '-rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <EntitySelector variant="table" maxVisible={3} selectedIds={block.entity || []} onChange={handleEntityChange} />
                                </div>
                            </div>

                            {/* Children */}
                            {block.isExpanded && (
                                <div className="flex flex-col gap-3 pl-4 border-l-2 border-[var(--border-subtle)]/30 mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                    {block.children.map(child => (
                                        <div key={child.id} className="bg-[var(--bg-raised)]/60 rounded-xl p-3 flex flex-col gap-2 relative">
                                            <button onClick={() => removeChild(child.id)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-sm active:scale-90 transition-all">×</button>
                                            <div className="flex flex-col gap-1 pr-8 relative">
                                                <select
                                                    value={child.type}
                                                    onChange={(e) => updateChild(child.id, { ...child, type: e.target.value, modifier: getDefaultModifier(e.target.value), parameter: getDefaultParameter(e.target.value) })}
                                                    className="bg-transparent text-[#DC8379] text-base outline-none cursor-pointer appearance-none border-b border-[var(--border-subtle)] pb-1 pr-6"
                                                    style={{ fontFamily: 'cursive' }}
                                                >
                                                    {Object.keys(CONSTRAINT_SCHEMA).map(k => <option key={k} value={k} className="bg-[var(--bg-raised)] text-neutral">{k}</option>)}
                                                </select>
                                                <div className="absolute right-8 bottom-1.5 pointer-events-none text-[#DC8379]/60 bg-[#DC8379]/5 border border-[#DC8379]/10 rounded p-[1px]">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                            <div className="mt-1">
                                                {renderParameterInput(child, (updated) => updateChild(child.id, updated))}
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={addChild} className="text-left text-sm text-[#DC8379]/60 hover:text-[#DC8379] font-bold py-2 transition-colors cursor-pointer w-full italic" style={{ fontFamily: 'cursive' }}>
                                        + Add rule into block
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        // Desktop
        return (
            <div className="flex flex-col border-b-2 border-[#DC8379]/10 group/block">
                {/* Parent Row */}
                <div className="flex items-center border-b border-[#DC8379]/10 group transition-colors">
                    <div className="w-12 shrink-0 flex justify-center">
                        <button onClick={onRemove} className="w-5 h-5 rounded-full bg-[#DC8379]/20 text-[#DC8379] hover:bg-[#DC8379] hover:text-[#1A0B16] flex items-center justify-center font-bold text-xs opacity-50 group-hover:opacity-100 transition-all cursor-pointer shadow-sm">×</button>
                    </div>
                    <div className="w-28 sm:w-32 shrink-0 border-r border-[#DC8379]/10 py-1.5 pl-3 relative flex items-center hover:bg-white/5 transition-colors">
                        <select value={displayedModifier} onChange={e => handleModifierChange(e.target.value)} className="w-full bg-transparent text-[#DC8379] text-base outline-none cursor-pointer appearance-none text-center pr-8" style={{ fontFamily: 'cursive' }}>
                            <option value="" disabled className="hidden"></option>
                            <option value="must" className="bg-[var(--bg-raised)] text-neutral">must</option>
                            <option value="should" className="bg-[var(--bg-raised)] text-neutral">should</option>
                        </select>
                        <div className="absolute right-0 top-0 bottom-0 w-8 border-l border-[#DC8379]/10 bg-white/[0.02] flex items-center justify-center pointer-events-none text-[#DC8379]/60">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                    <div className="w-40 sm:w-48 shrink-0 border-r border-[#DC8379]/10 py-1.5 pl-3 relative flex items-center justify-center cursor-pointer select-none hover:bg-white/5 transition-colors" onClick={toggleExpand}>
                        <span className="text-[#DC8379] text-base" style={{ fontFamily: 'cursive' }}>for</span>
                        <div className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center text-[#DC8379]/60">
                            <svg className={`w-3.5 h-3.5 text-[#DC8379] transition-transform ${block.isExpanded ? '' : '-rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                    <div className="flex-1 py-1.5 px-3 min-w-[200px] flex items-center hover:bg-white/5 transition-colors">
                        <div className="flex-1 min-w-[150px]">
                            <EntitySelector variant="table" maxVisible={3} selectedIds={block.entity || []} onChange={handleEntityChange} />
                        </div>
                    </div>
                </div>

                {/* Child Rows */}
                {block.isExpanded && (
                    <div className="flex flex-col animate-in slide-in-from-top-2 fade-in duration-200">
                        {block.children.map((child, i) => {
                            const schema = CONSTRAINT_SCHEMA[child.type];
                            return (
                                <div key={child.id} className="flex items-center border-b border-[#DC8379]/5 transition-colors group/child">
                                    <div className="w-12 shrink-0 flex justify-center">
                                        <button onClick={() => removeChild(child.id)} className="w-5 h-5 rounded-full bg-[#DC8379]/10 text-[#DC8379] hover:bg-[#DC8379] hover:text-[#1A0B16] flex items-center justify-center font-bold text-xs opacity-0 group-hover/block:opacity-40 hover:opacity-100 transition-all cursor-pointer">×</button>
                                    </div>
                                    <div className="w-28 sm:w-32 shrink-0 border-r border-[#DC8379]/10 py-1.5 px-3 relative flex items-center justify-center hover:bg-white/5 transition-colors">
                                        {/* L Shape visual indicator */}
                                        <div className="absolute left-2 top-0 w-[2px] h-1/2 bg-[#DC8379]/60 group-hover/child:bg-[#DC8379]/80 transition-colors"></div>
                                        <div className="absolute left-2 top-1/2 w-4 h-[2px] bg-[#DC8379]/60 group-hover/child:bg-[#DC8379]/80 transition-colors"></div>

                                        {/* Optional modifier for children */}
                                        {schema?.allowedModifiers && schema.allowedModifiers[0] !== '' && (
                                            <>
                                                <select value={child.modifier} onChange={e => updateChild(child.id, { ...child, modifier: e.target.value })} className="pl-6 w-full bg-transparent text-[#DC8379]/60 text-sm outline-none cursor-pointer appearance-none text-center pr-8" style={{ fontFamily: 'cursive' }}>
                                                    {schema.allowedModifiers.map(m => <option key={m} value={m} className="bg-[var(--bg-raised)] text-neutral">{m}</option>)}
                                                </select>
                                                <div className="absolute right-0 top-0 bottom-0 w-8 border-l border-[#DC8379]/10 bg-white/[0.02] flex items-center justify-center pointer-events-none text-[#DC8379]/60">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="w-40 sm:w-48 shrink-0 border-r border-[#DC8379]/10 py-1.5 pl-3 relative flex items-center hover:bg-white/5 transition-colors">
                                        <select value={child.type} onChange={e => updateChild(child.id, { ...child, type: e.target.value, modifier: getDefaultModifier(e.target.value), parameter: getDefaultParameter(e.target.value) })} className="w-full bg-transparent text-[#DC8379] text-base outline-none cursor-pointer appearance-none text-center pr-8" style={{ fontFamily: 'cursive' }}>
                                            {Object.keys(CONSTRAINT_SCHEMA).map(k => <option key={k} value={k} className="bg-[var(--bg-raised)] text-neutral">{k}</option>)}
                                        </select>
                                        <div className="absolute right-0 top-0 bottom-0 w-8 border-l border-[#DC8379]/10 bg-white/[0.02] flex items-center justify-center pointer-events-none text-[#DC8379]/60">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                    <div className="flex-1 py-1.5 px-3 min-w-[200px] flex items-center hover:bg-white/5 transition-colors">
                                        {renderParameterInput(child, (updated) => updateChild(child.id, updated))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add Child Row Placeholder */}
                        <div className="flex items-center transition-colors cursor-pointer group/add" onClick={addChild}>
                            <div className="w-12 shrink-0"></div>
                            <div className="w-28 sm:w-32 shrink-0 border-r border-[#DC8379]/10 py-1.5 px-3 relative">
                                <div className="absolute left-2 top-0 w-[2px] h-1/2 bg-[#DC8379]/40 group-hover/add:bg-[#DC8379]/60 transition-colors"></div>
                                <div className="absolute left-2 top-1/2 w-4 h-[2px] bg-[#DC8379]/40 group-hover/add:bg-[#DC8379]/60 transition-colors"></div>
                            </div>
                            <div className="w-40 sm:w-48 shrink-0 border-r border-[#DC8379]/10 py-1.5 px-3 text-center">
                                <span className="text-[#DC8379]/40 text-sm group-hover/add:text-[#DC8379]/80 transition-colors" style={{ fontFamily: 'cursive' }}>——</span>
                            </div>
                            <div className="flex-1 py-1.5 px-3 hover:bg-white/5 transition-colors">
                                <span className="text-[#DC8379]/40 text-sm group-hover/add:text-[#DC8379]/80 transition-colors italic font-semibold" style={{ fontFamily: 'cursive' }}>Choose to add into block</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
