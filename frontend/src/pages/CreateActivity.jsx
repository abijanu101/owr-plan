import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TimePicker from '../components/Pickers/TimePicker';
import DateTimePicker from '../components/Pickers/DateTimePicker';
import EntitySelector from '../components/EntitySelector';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FREQ = ['Day', 'Week', 'Month'];
const defaultSlot = () => ({ day: 'Monday', startTime: '08:00 AM', endTime: '09:00 AM', label: '' });

// ─── Shared UI primitives ────────────────────────────────────────────────────

function Label({ children }) {
    return <span className="text-xs font-bold tracking-widest uppercase text-muted">{children}</span>;
}

function SectionCard({ children, className = '' }) {
    return (
        <div className={`bg-[var(--bg-raised)]/60 border border-[var(--border-subtle)]/40 rounded-2xl p-4 sm:p-5 ${className}`}>
            {children}
        </div>
    );
}

function PrimaryBtn({ children, onClick, disabled, type = 'button', className = '' }) {
    return (
        <button type={type} onClick={onClick} disabled={disabled}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all cursor-pointer active:scale-95 ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110'} bg-[var(--color-primary)] text-[var(--bg-primary)] ${className}`}>
            {children}
        </button>
    );
}

function GhostBtn({ children, onClick, className = '' }) {
    return (
        <button type="button" onClick={onClick}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[var(--border-subtle)] text-neutral font-bold transition-all hover:bg-white/5 hover:border-white/30 cursor-pointer active:scale-95 ${className}`}>
            {children}
        </button>
    );
}

function Stepper({ value, onChange, min = 1, max = 99 }) {
    return (
        <div className="flex items-center gap-2">
            <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
                className="w-8 h-8 rounded-full border border-[var(--border-subtle)] text-primary font-bold flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer active:scale-90">−</button>
            <span className="w-8 text-center font-bold text-primary text-lg tabular-nums">{value}</span>
            <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
                className="w-8 h-8 rounded-full border border-[var(--border-subtle)] text-primary font-bold flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer active:scale-90">+</button>
        </div>
    );
}

// ─── Collapsible Slot Card ───────────────────────────────────────────────────

function SlotCard({ slot, index, onChange, onRemove }) {
    const [collapsed, setCollapsed] = useState(false);
    const [editingStart, setEditingStart] = useState(false);
    const [editingEnd, setEditingEnd] = useState(false);

    const summary = `${slot.day} • ${slot.startTime} – ${slot.endTime}${slot.label ? ` • ${slot.label}` : ''}`;

    return (
        <SectionCard className="transition-all duration-200">
            {/* Header row – always visible, tapping collapses/expands */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCollapsed(c => !c)}>
                <div className={`w-6 h-6 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center text-xs font-bold text-primary transition-transform duration-200 ${collapsed ? '' : 'rotate-90'}`}>
                    ›
                </div>
                <div className="flex-1 min-w-0">
                    {collapsed
                        ? <p className="text-sm text-neutral font-bold truncate">{summary}</p>
                        : <Label>Slot {index + 1}</Label>
                    }
                </div>
                {onRemove && (
                    <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }}
                        className="text-muted hover:text-primary transition-colors text-xs border border-[var(--border-subtle)] rounded-full px-3 py-1 hover:border-primary/50 cursor-pointer shrink-0">
                        ✕
                    </button>
                )}
            </div>

            {/* Expandable body */}
            {!collapsed && (
                <div className="flex flex-col gap-1 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Day */}
                    <div className="flex items-center justify-between hover:bg-white/5 rounded-xl px-2 py-2 transition-all">
                        <span className="text-muted text-sm font-bold">Day</span>
                        <select value={slot.day} onChange={e => onChange({ ...slot, day: e.target.value })}
                            className="bg-transparent text-neutral font-bold text-right outline-none cursor-pointer hover:text-primary transition-colors text-sm">
                            {DAYS.map(d => <option key={d} value={d} className="bg-[var(--bg-raised)]">{d}</option>)}
                        </select>
                    </div>

                    {/* Start Time */}
                    <div onClick={() => !editingStart && setEditingStart(true)}
                        className="flex items-center justify-between hover:bg-white/5 rounded-xl px-2 py-2 transition-all cursor-pointer group">
                        <span className="text-muted text-sm font-bold">Start</span>
                        <div className="flex items-center gap-2">
                            <span className="text-primary font-bold text-sm">{slot.startTime}</span>
                            <svg className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                    </div>
                    {editingStart && (
                        <div className="px-2 py-2 animate-in fade-in duration-150">
                            <TimePicker initialTime={slot.startTime} inline={true} hideHelperText={true}
                                onChange={t => onChange({ ...slot, startTime: t })} />
                            <GhostBtn onClick={() => setEditingStart(false)} className="mt-3 w-full text-sm py-2">Done</GhostBtn>
                        </div>
                    )}

                    {/* End Time */}
                    <div onClick={() => !editingEnd && setEditingEnd(true)}
                        className="flex items-center justify-between hover:bg-white/5 rounded-xl px-2 py-2 transition-all cursor-pointer group">
                        <span className="text-muted text-sm font-bold">End</span>
                        <div className="flex items-center gap-2">
                            <span className="text-primary font-bold text-sm">{slot.endTime}</span>
                            <svg className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                    </div>
                    {editingEnd && (
                        <div className="px-2 py-2 animate-in fade-in duration-150">
                            <TimePicker initialTime={slot.endTime} inline={true} hideHelperText={true}
                                onChange={t => onChange({ ...slot, endTime: t })} />
                            <GhostBtn onClick={() => setEditingEnd(false)} className="mt-3 w-full text-sm py-2">Done</GhostBtn>
                        </div>
                    )}

                    {/* Label */}
                    <div className="flex items-center justify-between hover:bg-white/5 rounded-xl px-2 py-2 transition-all">
                        <span className="text-muted text-sm font-bold">Label</span>
                        <input value={slot.label} onChange={e => onChange({ ...slot, label: e.target.value })}
                            placeholder="e.g. AHCI"
                            className="bg-transparent text-right text-neutral font-bold placeholder-[var(--text-muted)]/40 outline-none w-28 text-sm" />
                    </div>

                    {/* Collapse shortcut */}
                    <button type="button" onClick={() => setCollapsed(true)}
                        className="mt-1 text-xs text-muted hover:text-primary transition-colors text-center w-full py-1 cursor-pointer">
                        ▲ Collapse
                    </button>
                </div>
            )}
        </SectionCard>
    );
}

// ─── Recurrence section ──────────────────────────────────────────────────────

function RecurrenceSection({ rec, onChange }) {
    const set = updates => onChange({ ...rec, ...updates });

    return (
        <div className="flex flex-col gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Repeat every */}
            <div className="flex items-center gap-3 flex-wrap">
                <Label>Every</Label>
                <Stepper value={rec.interval} onChange={v => set({ interval: v })} />
                <select value={rec.frequency} onChange={e => set({ frequency: e.target.value })}
                    className="bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-neutral font-bold outline-none cursor-pointer hover:border-primary/50 transition-all text-sm">
                    {FREQ.map(f => <option key={f} value={f} className="bg-[var(--bg-raised)]">{f}{rec.interval > 1 ? 's' : ''}</option>)}
                </select>
            </div>

            {/* Ends */}
            <div className="flex flex-col gap-2.5">
                <Label>Ends</Label>
                {[
                    { val: 'never', label: 'Never' },
                    { val: 'on_date', label: 'On Date' },
                    { val: 'after', label: 'After N Occurrences' },
                ].map(({ val, label }) => (
                    <div key={val}>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div onClick={() => set({ endType: val })}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${rec.endType === val ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-[var(--border-subtle)] group-hover:border-primary/50'}`}>
                                {rec.endType === val && <div className="w-2 h-2 rounded-full bg-[var(--bg-primary)]" />}
                            </div>
                            <span className="text-neutral text-sm font-bold flex-1">{label}</span>
                            {val === 'after' && rec.endType === 'after' && (
                                <Stepper value={rec.occurrences} onChange={v => set({ occurrences: v })} />
                            )}
                        </label>

                        {/* DateTimePicker for On Date – opens as a popup modal */}
                        {val === 'on_date' && rec.endType === 'on_date' && (
                            <div className="mt-3 ml-8 animate-in fade-in duration-150">
                                <DateTimePicker
                                    onChange={state => set({ endDate: state.date, endTime: state.time })}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepDot({ n, active, done, onClick }) {
    return (
        <button type="button" onClick={onClick}
            className={`flex flex-col items-center gap-1 cursor-pointer group transition-all`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--bg-primary)]' : active ? 'border-[var(--color-primary)] text-primary' : 'border-[var(--border-subtle)] text-muted'}`}>
                {done ? '✓' : n}
            </div>
        </button>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CreateActivity() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);
    const [selectedEntityIds, setSelectedEntityIds] = useState([]);
    const [scheduleMode, setScheduleMode] = useState('structured');
    const [slots, setSlots] = useState([defaultSlot()]);
    const [pasteText, setPasteText] = useState('');
    const [parsedSlots, setParsedSlots] = useState([]);
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState('');
    const [recurrence, setRecurrence] = useState({ enabled: false, interval: 1, frequency: 'Week', endType: 'never', endDate: '', endTime: '', occurrences: 1 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const titleDone = title.trim().length > 0;
    const scheduleReady = scheduleMode === 'structured' ? slots.length > 0 : parsedSlots.length > 0 || pasteText.trim().length > 0;

    const updateSlot = (i, updated) => setSlots(prev => prev.map((s, idx) => idx === i ? updated : s));
    const removeSlot = (i) => setSlots(prev => prev.filter((_, idx) => idx !== i));

    const handleParse = async () => {
        setIsParsing(true); setParseError('');
        try {
            const res = await fetch('/api/activities/parse', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ rawText: pasteText }),
            });
            const data = await res.json();
            if (data.success) { setParsedSlots(data.parsed || []); if (data.warning) setParseError(data.warning); }
            else setParseError(data.message || 'Parsing failed.');
        } catch { setParseError('Could not reach the server.'); }
        finally { setIsParsing(false); }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true); setSubmitError('');
        try {
            const payload = { userId: user?._id, title, participants: selectedEntityIds, scheduleMode, slots: scheduleMode === 'structured' ? slots : [], pastedScheduleRaw: scheduleMode === 'paste' ? pasteText : '', parsedSlots: scheduleMode === 'paste' ? parsedSlots : [], recurrence };
            const res = await fetch('/api/activities', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (data.success) navigate('/activities');
            else setSubmitError(data.message || 'Failed to create activity.');
        } catch { setSubmitError('Could not reach the server.'); }
        finally { setIsSubmitting(false); }
    };

    const STEPS = ['Title', 'Participants', 'Schedule'];

    return (
        <div className="min-h-full w-full px-4 pt-6 pb-28 sm:px-8 max-w-2xl mx-auto">

            {/* Header + stepper — fixed context at top */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-3">Create Activity</h1>

                {/* Inline-editable title display */}
                <div className="flex justify-center mb-4">
                    {editingTitle || !title ? (
                        <input
                            autoFocus={editingTitle}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            onBlur={() => setEditingTitle(false)}
                            onKeyDown={e => { if (e.key === 'Enter') setEditingTitle(false); }}
                            placeholder="Activity name…"
                            className="text-center text-base sm:text-lg font-bold text-neutral bg-transparent border-b-2 border-[var(--color-primary)]/60 outline-none placeholder-[var(--text-muted)]/40 pb-1 w-full max-w-xs transition-all"
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setEditingTitle(true)}
                            className="group flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-subtle)]/40 hover:border-[var(--color-primary)]/50 hover:bg-white/5 transition-all cursor-pointer"
                        >
                            <span className="text-base sm:text-lg font-bold text-neutral">{title}</span>
                            <svg className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-center gap-2">
                    {STEPS.map((label, i) => {
                        const n = i + 1;
                        return (
                            <div key={label} className="flex items-center gap-2">
                                <div className="flex flex-col items-center gap-1">
                                    <StepDot n={n} active={step === n} done={step > n} onClick={() => step > n && setStep(n)} />
                                    <span className={`text-[10px] font-bold transition-colors hidden sm:block ${step === n ? 'text-primary' : step > n ? 'text-neutral' : 'text-muted'}`}>{label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`h-px w-10 sm:w-16 rounded-full mb-3 transition-all ${step > n ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-subtle)]/40'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Step 1: Title ── */}
            {step === 1 && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-250">
                    <SectionCard>
                        <Label>Activity Title</Label>
                        <input id="activity-title" autoFocus value={title}
                            onChange={e => setTitle(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && titleDone) setStep(2); }}
                            placeholder="e.g. AHCI Weekly Lab"
                            className="mt-3 w-full bg-transparent text-xl font-bold text-neutral placeholder-[var(--text-muted)]/40 outline-none border-b-2 border-[var(--border-subtle)]/40 focus:border-[var(--color-primary)]/60 pb-2 transition-all"
                        />
                    </SectionCard>
                    <div className="flex justify-end">
                        <PrimaryBtn onClick={() => setStep(2)} disabled={!titleDone}>Next → Participants</PrimaryBtn>
                    </div>
                </div>
            )}

            {/* ── Step 2: Participants ── */}
            {step === 2 && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-250">
                    <SectionCard>
                        <Label>Participants</Label>
                        <p className="text-xs text-muted mt-1 mb-3">Click the area below to open the entity selector</p>
                        <EntitySelector
                            selectedIds={selectedEntityIds}
                            onChange={setSelectedEntityIds}
                            variant="standalone"
                        />
                    </SectionCard>
                    <div className="flex gap-3">
                        <GhostBtn onClick={() => setStep(1)} className="flex-1 justify-center">← Back</GhostBtn>
                        <PrimaryBtn onClick={() => setStep(3)} className="flex-1 justify-center">Next → Schedule</PrimaryBtn>
                    </div>
                </div>
            )}

            {/* ── Step 3: Schedule ── */}
            {step === 3 && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-250">

                    {/* Mode toggle */}
                    <SectionCard>
                        <Label>Schedule Input Method</Label>
                        <div className="flex gap-3 mt-3 flex-wrap">
                            {['structured', 'paste'].map(mode => (
                                <button key={mode} type="button" onClick={() => setScheduleMode(mode)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm transition-all cursor-pointer active:scale-95 ${scheduleMode === mode ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border-[var(--color-primary)] shadow-[0_0_12px_rgba(249,119,102,0.3)]' : 'border-[var(--border-subtle)] text-neutral hover:border-primary/50 hover:bg-white/5'}`}>
                                    <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center shrink-0 ${scheduleMode === mode ? 'border-[var(--bg-primary)]' : 'border-current'}`}>
                                        {scheduleMode === mode && <div className="w-1.5 h-1.5 rounded-full bg-[var(--bg-primary)]" />}
                                    </div>
                                    {mode === 'structured' ? 'Structured Builder' : 'Paste Schedule'}
                                </button>
                            ))}
                        </div>
                    </SectionCard>

                    {/* Structured builder */}
                    {scheduleMode === 'structured' && (
                        <div className="flex flex-col gap-3">
                            {slots.map((slot, i) => (
                                <SlotCard key={i} slot={slot} index={i}
                                    onChange={updated => updateSlot(i, updated)}
                                    onRemove={slots.length > 1 ? () => removeSlot(i) : null}
                                />
                            ))}
                            <GhostBtn onClick={() => setSlots(prev => [...prev, defaultSlot()])} className="w-full justify-center">
                                <span className="text-lg leading-none">+</span> Add Slot
                            </GhostBtn>
                        </div>
                    )}

                    {/* Paste mode */}
                    {scheduleMode === 'paste' && (
                        <SectionCard>
                            <Label>Paste Your Schedule</Label>
                            <p className="text-xs text-muted mt-1 mb-3">Any format — AI will extract the slots for you.</p>
                            <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} rows={5}
                                placeholder={`Mon 08:30–10:00 AHCI\nTue 14:00–15:30 Lab\nWed 09:00–11:00 AHCI\n\nOr any other format — just paste it!`}
                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)]/40 rounded-xl p-4 text-neutral text-sm resize-none outline-none placeholder-[var(--text-muted)]/40 focus:border-[var(--color-primary)]/50 transition-all font-mono leading-relaxed"
                            />
                            <div className="flex items-start justify-between mt-3 gap-3 flex-wrap">
                                {parseError && <p className="text-xs text-muted flex-1">{parseError}</p>}
                                <PrimaryBtn onClick={handleParse} disabled={isParsing || !pasteText.trim()} className="ml-auto text-sm">
                                    {isParsing ? '⏳ Parsing…' : '✦ Parse with AI'}
                                </PrimaryBtn>
                            </div>

                            {parsedSlots.length > 0 && (
                                <div className="mt-4 flex flex-col gap-2">
                                    <Label>Parsed Slots ({parsedSlots.length})</Label>
                                    {parsedSlots.map((s, i) => (
                                        <div key={i} className="flex flex-wrap items-center gap-2 bg-[var(--bg-primary)] rounded-xl px-4 py-2.5 border border-[var(--color-primary)]/20">
                                            <span className="font-bold text-primary text-sm">{s.day}</span>
                                            <span className="text-muted text-xs">•</span>
                                            <span className="text-neutral text-sm">{s.startTime} – {s.endTime}</span>
                                            {s.label && <span className="ml-auto text-xs bg-[var(--color-primary)]/20 text-primary rounded-full px-2 py-0.5">{s.label}</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    )}

                    {/* Recurrence card — separate visual group */}
                    <SectionCard className="border-[var(--color-primary)]/15 bg-[var(--bg-accent)]/15">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Recurrence</Label>
                                {recurrence.enabled && (
                                    <p className="text-xs text-muted mt-0.5">Every {recurrence.interval} {recurrence.frequency}{recurrence.interval > 1 ? 's' : ''}</p>
                                )}
                            </div>
                            <button type="button" onClick={() => setRecurrence(r => ({ ...r, enabled: !r.enabled }))}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm transition-all cursor-pointer active:scale-95 shrink-0 ${recurrence.enabled ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border-[var(--color-primary)]' : 'border-[var(--border-subtle)] text-neutral hover:border-primary/50 hover:bg-white/5'}`}>
                                {recurrence.enabled ? '↺ Recurring' : '+ Recurring'}
                            </button>
                        </div>

                        {recurrence.enabled && (
                            <RecurrenceSection rec={recurrence} onChange={setRecurrence} />
                        )}
                    </SectionCard>

                    {submitError && (
                        <div className="bg-red-900/30 border border-red-500/40 rounded-xl px-4 py-3 text-sm text-red-300">{submitError}</div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <GhostBtn onClick={() => setStep(2)} className="flex-1 justify-center">← Back</GhostBtn>
                        <PrimaryBtn onClick={handleSubmit} disabled={isSubmitting || !scheduleReady} className="flex-1 justify-center py-3.5">
                            {isSubmitting ? '⏳ Creating…' : '✓ Create Activity'}
                        </PrimaryBtn>
                    </div>
                </div>
            )}
        </div>
    );
}
