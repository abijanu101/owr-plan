import React from 'react';
import { CONSTRAINT_SCHEMA, getDefaultParameter, getDefaultModifier } from './ConstraintSchema';
import DateTimePicker from '../Pickers/DateTimePicker';
import DateTimeRangePicker from '../Pickers/DateTimeRangePicker';
import DurationPicker from '../Pickers/DurationPicker';
import TimePicker from '../Pickers/TimePicker';
import EntitySelector from '../EntitySelector';
import MultiDatePicker from '../Pickers/MultiDatePicker';

export default function LocalConstraintBlock({ block, onChange, onRemove, isMobile }) {
    // block: { id, modifier: 'must', entity: ['userId'], children: [{ id, modifier, type, parameter }] }
    
    // ... I will skip implementation details for brevity in this scratch pad, wait I need to implement it.
    
    const handleEntityChange = (entities) => {
        onChange({ ...block, entity: entities });
    };

    const handleModifierChange = (mod) => {
        onChange({ ...block, modifier: mod });
    };

    const addChild = () => {
        const newChild = { id: Date.now(), modifier: '', type: 'last for', parameter: getDefaultParameter('last for') };
        onChange({ ...block, children: [...block.children, newChild] });
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
        return (
            <div className="bg-[var(--bg-accent)]/10 border-l-4 border-[var(--color-primary)] rounded-r-2xl p-4 flex flex-col gap-4 relative mb-4">
                <button onClick={onRemove} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-lg active:scale-90 transition-all">×</button>
                
                {/* Parent Row */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-1 w-1/2 relative">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-muted">Modifier</span>
                            <select value={block.modifier} onChange={e => handleModifierChange(e.target.value)} className="bg-transparent text-[#DC8379] font-bold text-lg outline-none cursor-pointer appearance-none border-b border-[var(--border-subtle)] pb-1 pr-6" style={{ fontFamily: 'cursive' }}>
                                <option value="must" className="bg-[var(--bg-raised)] text-neutral">must</option>
                                <option value="should" className="bg-[var(--bg-raised)] text-neutral">should</option>
                            </select>
                            <div className="absolute right-0 bottom-2 pointer-events-none text-[#DC8379]/40">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 w-1/2 relative">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-muted">Constraint</span>
                            <span className="text-[#DC8379] font-bold text-lg border-b border-[var(--border-subtle)] pb-1" style={{ fontFamily: 'cursive' }}>for</span>
                        </div>
                    </div>
                    <div className="mt-2">
                        <EntitySelector variant="table" maxVisible={3} selectedIds={block.entity || []} onChange={handleEntityChange} />
                    </div>
                </div>

                {/* Children */}
                <div className="flex flex-col gap-3 pl-4 border-l-2 border-[var(--border-subtle)]/30 mt-2">
                    {block.children.map(child => (
                        <div key={child.id} className="bg-[var(--bg-raised)]/60 rounded-xl p-3 flex flex-col gap-2 relative">
                            <button onClick={() => removeChild(child.id)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-sm active:scale-90 transition-all">×</button>
                            <div className="flex flex-col gap-1 pr-8 relative">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-muted">Constraint</span>
                                <select 
                                    value={child.type} 
                                    onChange={(e) => updateChild(child.id, { ...child, type: e.target.value, modifier: getDefaultModifier(e.target.value), parameter: getDefaultParameter(e.target.value) })}
                                    className="bg-transparent text-[#DC8379] text-base outline-none cursor-pointer appearance-none border-b border-[var(--border-subtle)] pb-1 pr-6"
                                    style={{ fontFamily: 'cursive' }}
                                >
                                    {Object.keys(CONSTRAINT_SCHEMA).map(k => <option key={k} value={k} className="bg-[var(--bg-raised)] text-neutral">{k}</option>)}
                                </select>
                                <div className="absolute right-8 bottom-2 pointer-events-none text-[#DC8379]/40">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
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
            </div>
        );
    }

    // Desktop
    return (
        <div className="flex flex-col border-b-2 border-[var(--color-primary)]/20 mb-2 group/block">
            {/* Parent Row */}
            <div className="flex items-center border-b border-[#DC8379]/10 group hover:bg-white/5 transition-colors">
                <div className="w-12 shrink-0 flex justify-center">
                    <button onClick={onRemove} className="w-6 h-6 rounded-full bg-[#DC8379]/10 text-[#DC8379] hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center font-bold text-sm opacity-50 group-hover:opacity-100 transition-all cursor-pointer">×</button>
                </div>
                <div className="w-32 sm:w-40 shrink-0 border-r border-[#DC8379]/10 py-2 px-3 relative flex items-center">
                    <select value={block.modifier} onChange={e => handleModifierChange(e.target.value)} className="w-full bg-transparent text-[#DC8379] text-base outline-none cursor-pointer appearance-none text-center pr-4" style={{ fontFamily: 'cursive' }}>
                        <option value="must" className="bg-[var(--bg-raised)] text-neutral">must</option>
                        <option value="should" className="bg-[var(--bg-raised)] text-neutral">should</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#DC8379]/40">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                </div>
                <div className="w-40 sm:w-48 shrink-0 border-r border-[#DC8379]/10 py-2 px-3 text-center">
                    <span className="text-[#DC8379] text-base" style={{ fontFamily: 'cursive' }}>for</span>
                </div>
                <div className="flex-1 py-2 px-3 min-w-[200px] flex items-center">
                    <div className="flex-1 min-w-[150px]">
                        <EntitySelector variant="table" maxVisible={3} selectedIds={block.entity || []} onChange={handleEntityChange} />
                    </div>
                </div>
            </div>

            {/* Child Rows */}
            {block.children.map((child, i) => {
                const schema = CONSTRAINT_SCHEMA[child.type];
                return (
                    <div key={child.id} className="flex items-center border-b border-[#DC8379]/5 hover:bg-white/5 transition-colors">
                        <div className="w-12 shrink-0 flex justify-center">
                            <button onClick={() => removeChild(child.id)} className="w-5 h-5 rounded-full bg-[#DC8379]/10 text-[#DC8379] hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center font-bold text-xs opacity-0 group-hover/block:opacity-50 hover:opacity-100 transition-all cursor-pointer">×</button>
                        </div>
                        <div className="w-32 sm:w-40 shrink-0 border-r border-[#DC8379]/10 py-2 px-3 relative flex items-center justify-center">
                            {/* L Shape visual indicator */}
                            <div className="absolute left-6 top-0 w-px h-1/2 bg-[#DC8379]/40"></div>
                            <div className="absolute left-6 top-1/2 w-8 h-px bg-[#DC8379]/40"></div>
                            
                            {/* Optional modifier for children? Mockup showed empty for pad/end before, but let's allow it if schema says so */}
                            {schema?.allowedModifiers && schema.allowedModifiers[0] !== '' && (
                                <>
                                    <select value={child.modifier} onChange={e => updateChild(child.id, { ...child, modifier: e.target.value })} className="ml-8 w-full bg-transparent text-[#DC8379]/60 text-sm outline-none cursor-pointer appearance-none text-center pr-4" style={{ fontFamily: 'cursive' }}>
                                        {schema.allowedModifiers.map(m => <option key={m} value={m} className="bg-[var(--bg-raised)] text-neutral">{m}</option>)}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#DC8379]/40">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="w-40 sm:w-48 shrink-0 border-r border-[#DC8379]/10 py-2 px-3 relative flex items-center">
                            <select value={child.type} onChange={e => updateChild(child.id, { ...child, type: e.target.value, modifier: getDefaultModifier(e.target.value), parameter: getDefaultParameter(e.target.value) })} className="w-full bg-transparent text-[#DC8379] text-base outline-none cursor-pointer appearance-none text-center pr-4" style={{ fontFamily: 'cursive' }}>
                                {Object.keys(CONSTRAINT_SCHEMA).map(k => <option key={k} value={k} className="bg-[var(--bg-raised)] text-neutral">{k}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#DC8379]/40">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                        </div>
                        <div className="flex-1 py-2 px-3 min-w-[200px] flex items-center">
                            {renderParameterInput(child, (updated) => updateChild(child.id, updated))}
                        </div>
                    </div>
                );
            })}
            
            {/* Add Child Row Placeholder */}
            <div className="flex items-center hover:bg-white/5 transition-colors cursor-pointer group/add" onClick={addChild}>
                <div className="w-12 shrink-0"></div>
                <div className="w-32 sm:w-40 shrink-0 border-r border-[#DC8379]/10 py-2 px-3 relative">
                    <div className="absolute left-6 top-0 w-px h-1/2 bg-[#DC8379]/20 group-hover/add:bg-[#DC8379]/40"></div>
                    <div className="absolute left-6 top-1/2 w-8 h-px bg-[#DC8379]/20 group-hover/add:bg-[#DC8379]/40"></div>
                </div>
                <div className="w-40 sm:w-48 shrink-0 border-r border-[#DC8379]/10 py-2 px-3 text-center">
                    <span className="text-[#DC8379]/40 text-base group-hover/add:text-[#DC8379]/80 transition-colors" style={{ fontFamily: 'cursive' }}>——</span>
                </div>
                <div className="flex-1 py-2 px-3">
                    <span className="text-[#DC8379]/40 text-base group-hover/add:text-[#DC8379]/80 transition-colors italic" style={{ fontFamily: 'cursive' }}>Choose to add into block</span>
                </div>
            </div>
        </div>
    );
}
