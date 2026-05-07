import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TimePicker from '../components/Pickers/TimePicker';
import DateTimePicker from '../components/Pickers/DateTimePicker';
import DateTimeRangePicker from '../components/Pickers/DateTimeRangePicker';
import Dropdown from '../components/UI/Dropdown';
import EntitySelector from '../components/EntitySelector';
import { useAuth } from '../context/AuthContext';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FREQ_UNITS   = ['Day', 'Week'];

// ─── Shared UI primitives ─────────────────────────────────────────────────────
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

function TypeToggle({ value, onChange }) {
    return (
        <div className="flex gap-3 flex-wrap">
            {[
                { id: 'non-recurring', label: 'Non-Recurring', sub: 'One-time date range' },
                { id: 'recurring',     label: 'Recurring',      sub: 'Repeating schedule' },
            ].map(({ id, label, sub }) => (
                <button key={id} type="button" onClick={() => onChange(id)}
                    className={`flex-1 min-w-[140px] flex flex-col items-start gap-1 px-4 py-3 rounded-xl border font-bold text-sm transition-all cursor-pointer active:scale-95 ${
                        value === id
                            ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/60 text-primary shadow-[0_0_16px_rgba(249,119,102,0.15)]'
                            : 'border-[var(--border-subtle)] text-neutral hover:border-primary/40 hover:bg-white/5'
                    }`}>
                    <span className="text-sm font-bold">{label}</span>
                    <span className="text-[11px] font-normal text-muted">{sub}</span>
                </button>
            ))}
        </div>
    );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDot({ n, active, done, onClick }) {
    return (
        <button type="button" onClick={onClick} className="flex flex-col items-center gap-1 cursor-pointer group">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--bg-primary)]' : active ? 'border-[var(--color-primary)] text-primary' : 'border-[var(--border-subtle)] text-muted'}`}>
                {done ? '✓' : n}
            </div>
        </button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CreateActivity() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);
    const [selectedEntityIds, setSelectedEntityIds] = useState(location.state?.entityId ? [location.state.entityId] : []);
    const [activityType, setActivityType] = useState('non-recurring');

    // Non-recurring
    const [range, setRange] = useState(null);

    // Recurring
    const [recurringStartTime, setRecurringStartTime] = useState('08:00 AM');
    const [recurringEndTime, setRecurringEndTime]     = useState('09:00 AM');
    const [editingStart, setEditingStart] = useState(false);
    const [editingEnd, setEditingEnd]     = useState(false);
    const [everyInterval, setEveryInterval] = useState(1);
    const [everyUnit, setEveryUnit]         = useState('Week');
    const [recurringDay, setRecurringDay]   = useState('Monday');
    const [expiryType, setExpiryType]       = useState('never');
    const [expiryDate, setExpiryDate]       = useState(null);
    const [expiryOccurrences, setExpiryOccurrences] = useState(5);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError]   = useState('');

    const titleDone = title.trim().length > 0;
    const scheduleReady = activityType === 'non-recurring' ? !!range : true;

    const STEPS = ['Type & Title', 'Participants', 'Schedule'];

    const handleSubmit = async () => {
        setIsSubmitting(true); setSubmitError('');
        try {
            const common = { userId: user?._id, title, participants: selectedEntityIds, activityType };
            const extra = activityType === 'non-recurring'
                ? { rangeStart: range?.start?.date ?? range?.start, rangeEnd: range?.end?.date ?? range?.end }
                : { recurringStartTime, recurringEndTime, everyInterval, everyUnit,
                    recurringDay: everyUnit === 'Week' ? recurringDay : null,
                    expiryType, expiryDate: expiryDate?.date ?? expiryDate, expiryOccurrences };
            const res = await fetch('/api/activities', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...common, ...extra }),
            });
            const data = await res.json();
            if (data.success) navigate('/activities');
            else setSubmitError(data.message || 'Failed to create activity.');
        } catch { setSubmitError('Could not reach the server.'); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="min-h-full w-full px-4 pt-6 pb-28 sm:px-8 max-w-2xl mx-auto">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-3">Create Activity</h1>

                {/* Inline title display */}
                <div className="flex justify-center mb-4">
                    {editingTitle || !title ? (
                        <input autoFocus={editingTitle} value={title} onChange={e => setTitle(e.target.value)}
                            onBlur={() => setEditingTitle(false)}
                            onKeyDown={e => { if (e.key === 'Enter') setEditingTitle(false); }}
                            placeholder="Activity name…"
                            className="text-center text-base sm:text-lg font-bold text-neutral bg-transparent border-b-2 border-[var(--color-primary)]/60 outline-none placeholder-[var(--text-muted)]/40 pb-1 w-full max-w-xs transition-all" />
                    ) : (
                        <button type="button" onClick={() => setEditingTitle(true)}
                            className="group flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-subtle)]/40 hover:border-[var(--color-primary)]/50 hover:bg-white/5 transition-all cursor-pointer">
                            <span className="text-base sm:text-lg font-bold text-neutral">{title}</span>
                            <svg className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                    )}
                </div>

                {/* Step dots */}
                <div className="flex items-center justify-center gap-2">
                    {STEPS.map((label, i) => {
                        const n = i + 1;
                        return (
                            <div key={label} className="flex items-center gap-2">
                                <div className="flex flex-col items-center gap-1">
                                    <StepDot n={n} active={step === n} done={step > n} onClick={() => step > n && setStep(n)} />
                                    <span className={`text-[10px] font-bold hidden sm:block ${step === n ? 'text-primary' : step > n ? 'text-neutral' : 'text-muted'}`}>{label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`h-px w-10 sm:w-16 rounded-full mb-3 transition-all ${step > n ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-subtle)]/40'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Step 1: Type & Title ── */}
            {step === 1 && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-250">
                    <SectionCard>
                        <Label>Activity Type</Label>
                        <div className="mt-3">
                            <TypeToggle value={activityType} onChange={setActivityType} />
                        </div>
                    </SectionCard>
                    <SectionCard>
                        <Label>Activity Title</Label>
                        <input id="activity-title" autoFocus value={title} onChange={e => setTitle(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && titleDone) setStep(2); }}
                            placeholder="e.g. Weekly Team Standup"
                            className="mt-3 w-full bg-transparent text-xl font-bold text-neutral placeholder-[var(--text-muted)]/40 outline-none border-b-2 border-[var(--border-subtle)]/40 focus:border-[var(--color-primary)]/60 pb-2 transition-all" />
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
                        <EntitySelector selectedIds={selectedEntityIds} onChange={setSelectedEntityIds} variant="standalone" />
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

                    {/* ── Non-Recurring ── */}
                    {activityType === 'non-recurring' && (
                        <SectionCard className="flex flex-col items-center py-10">
                            <Label>Select Date & Time Range</Label>
                            <div className="mt-6 w-full flex justify-center">
                                <DateTimeRangePicker onChange={r => setRange(r)} />
                            </div>
                        </SectionCard>
                    )}

                    {/* ── Recurring ── */}
                    {activityType === 'recurring' && (
                        <div className="flex flex-col gap-4">

                            {/* Time window */}
                            <SectionCard>
                                <Label>Time Window</Label>
                                <div className="flex flex-col gap-1 mt-3">
                                    {/* Start time */}
                                    <div onClick={() => !editingStart && setEditingStart(true)}
                                        className="flex items-center justify-between hover:bg-white/5 rounded-xl px-2 py-2 transition-all cursor-pointer group">
                                        <span className="text-muted text-sm font-bold">Start</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-primary font-bold text-sm">{recurringStartTime}</span>
                                            <svg className="w-3.5 h-3.5 text-muted group-hover:text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                        </div>
                                    </div>
                                    {editingStart && (
                                        <div className="px-2 py-2 animate-in fade-in duration-150">
                                            <TimePicker initialTime={recurringStartTime} inline hideHelperText onChange={t => setRecurringStartTime(t)} />
                                            <GhostBtn onClick={() => setEditingStart(false)} className="mt-3 w-full text-sm py-2">Done</GhostBtn>
                                        </div>
                                    )}
                                    {/* End time */}
                                    <div onClick={() => !editingEnd && setEditingEnd(true)}
                                        className="flex items-center justify-between hover:bg-white/5 rounded-xl px-2 py-2 transition-all cursor-pointer group">
                                        <span className="text-muted text-sm font-bold">End</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-primary font-bold text-sm">{recurringEndTime}</span>
                                            <svg className="w-3.5 h-3.5 text-muted group-hover:text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                        </div>
                                    </div>
                                    {editingEnd && (
                                        <div className="px-2 py-2 animate-in fade-in duration-150">
                                            <TimePicker initialTime={recurringEndTime} inline hideHelperText onChange={t => setRecurringEndTime(t)} />
                                            <GhostBtn onClick={() => setEditingEnd(false)} className="mt-3 w-full text-sm py-2">Done</GhostBtn>
                                        </div>
                                    )}
                                </div>
                            </SectionCard>

                            {/* Period */}
                            <SectionCard>
                                <Label>Repeats</Label>
                                <div className="flex items-center gap-3 flex-wrap mt-3">
                                    <span className="text-muted text-sm font-bold">Every</span>
                                    <Stepper value={everyInterval} onChange={setEveryInterval} />
                                    <Dropdown
                                        value={everyUnit}
                                        onChange={setEveryUnit}
                                        options={FREQ_UNITS.map(u => ({ value: u, label: `${u}${everyInterval > 1 ? 's' : ''}` }))}
                                        className="w-32"
                                    />
                                </div>
                                {everyUnit === 'Week' && (
                                    <div className="flex items-center justify-between mt-4 hover:bg-white/5 rounded-xl px-2 py-2 transition-all">
                                        <span className="text-muted text-sm font-bold">On</span>
                                        <Dropdown
                                            value={recurringDay}
                                            onChange={setRecurringDay}
                                            options={DAYS_OF_WEEK}
                                            align="right"
                                            className="w-36"
                                        />
                                    </div>
                                )}
                            </SectionCard>

                            {/* Expiry */}
                            <SectionCard className="border-[var(--color-primary)]/15 bg-[var(--bg-accent)]/15">
                                <Label>Ends</Label>
                                <div className="flex flex-col gap-3 mt-3">
                                    {[
                                        { val: 'never',   label: 'Never' },
                                        { val: 'on_date', label: 'On a specific date' },
                                        { val: 'after',   label: 'After N occurrences' },
                                    ].map(({ val, label }) => (
                                        <div key={val}>
                                            <label className="flex items-center gap-3 cursor-pointer group min-h-[36px]">
                                                <div onClick={() => setExpiryType(val)}
                                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${expiryType === val ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-[var(--border-subtle)] group-hover:border-primary/50'}`}>
                                                    {expiryType === val && <div className="w-2 h-2 rounded-full bg-[var(--bg-primary)]" />}
                                                </div>
                                                <span className="text-neutral text-sm font-bold flex-1">{label}</span>
                                                {val === 'after' && expiryType === 'after' && (
                                                    <Stepper value={expiryOccurrences} onChange={setExpiryOccurrences} />
                                                )}
                                            </label>
                                            {val === 'on_date' && expiryType === 'on_date' && (
                                                <div className="mt-3 ml-8 animate-in fade-in duration-150">
                                                    <DateTimePicker onChange={s => setExpiryDate(s)} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        </div>
                    )}

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
