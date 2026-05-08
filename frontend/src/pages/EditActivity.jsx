import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TimePicker from '../components/Pickers/TimePicker';
import DateTimePicker from '../components/Pickers/DateTimePicker';
import DateTimeRangePicker from '../components/Pickers/DateTimeRangePicker';
import Dropdown from '../components/UI/Dropdown';
import EntitySelector from '../components/EntitySelector';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FREQ_UNITS   = ['Day', 'Week'];

// ─── Shared primitives ────────────────────────────────────────────────────────
function SectionCard({ children, className = '' }) {
    return <div className={`bg-[var(--bg-raised)]/60 border border-[var(--border-subtle)]/40 rounded-2xl p-4 sm:p-5 ${className}`}>{children}</div>;
}
function Label({ children }) {
    return <span className="text-[10px] font-bold tracking-widest uppercase text-muted">{children}</span>;
}
function PrimaryBtn({ children, onClick, disabled, className = '' }) {
    return (
        <button type="button" onClick={onClick} disabled={disabled}
            className={`min-h-[44px] flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all cursor-pointer active:scale-95 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'} bg-[var(--color-primary)] text-[var(--bg-primary)] ${className}`}>
            {children}
        </button>
    );
}
function GhostBtn({ children, onClick, className = '' }) {
    return (
        <button type="button" onClick={onClick}
            className={`min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[var(--border-subtle)] text-neutral font-bold transition-all hover:bg-white/5 hover:border-white/30 cursor-pointer active:scale-95 ${className}`}>
            {children}
        </button>
    );
}
function Stepper({ value, onChange }) {
    return (
        <div className="flex items-center gap-2">
            <button type="button" onClick={() => onChange(Math.max(1, value - 1))}
                className="min-w-[44px] min-h-[44px] rounded-full border border-[var(--border-subtle)] text-primary font-bold flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer active:scale-90">−</button>
            <span className="w-8 text-center font-bold text-primary text-lg tabular-nums">{value}</span>
            <button type="button" onClick={() => onChange(Math.min(99, value + 1))}
                className="min-w-[44px] min-h-[44px] rounded-full border border-[var(--border-subtle)] text-primary font-bold flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer active:scale-90">+</button>
        </div>
    );
}

// ─── Discard sheet ────────────────────────────────────────────────────────────
function DiscardSheet({ onDiscard, onKeep }) {
    return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-3xl p-6 flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-250">
                <h3 className="text-lg font-bold text-primary text-center">Discard changes?</h3>
                <p className="text-sm text-muted text-center">Your edits will be lost permanently.</p>
                <button onClick={onDiscard} className="min-h-[44px] w-full py-3 rounded-full border border-red-500/40 text-red-400 font-bold hover:bg-red-500/10 transition-all cursor-pointer active:scale-95">Discard</button>
                <button onClick={onKeep} className="min-h-[44px] w-full py-3 rounded-full bg-[var(--color-primary)] text-[var(--bg-primary)] font-bold hover:brightness-110 transition-all cursor-pointer active:scale-95">Keep editing</button>
            </div>
        </div>
    );
}

// ─── Helper: ISO → picker { date, time } ─────────────────────────────────────
const isoToPickerDT = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d)) return null;
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hh = h % 12 === 0 ? 12 : h % 12;
    const mm = String(m).padStart(2, '0');
    return { date: d, time: `${hh}:${mm} ${ampm}` };
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EditActivity() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);
    const [selectedEntityIds, setSelectedEntityIds] = useState([]);
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

    const [isDirty, setIsDirty] = useState(false);
    const [showDiscard, setShowDiscard] = useState(false);
    const [saveState, setSaveState] = useState('idle');
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/activities/${id}`, { credentials: 'include' });
                const data = await res.json();
                if (data.success) {
                    const a = data.data.activity;
                    setTitle(a.title);
                    setSelectedEntityIds((a.participants || []).map(p => p._id || p));
                    setActivityType(a.activityType || 'non-recurring');

                    if (a.activityType === 'non-recurring') {
                        if (a.rangeStart || a.rangeEnd) {
                            setRange({ start: isoToPickerDT(a.rangeStart), end: isoToPickerDT(a.rangeEnd) });
                        }
                    } else {
                        setRecurringStartTime(a.recurringStartTime || '08:00 AM');
                        setRecurringEndTime(a.recurringEndTime   || '09:00 AM');
                        setEveryInterval(a.everyInterval || 1);
                        setEveryUnit(a.everyUnit || 'Week');
                        setRecurringDay(a.recurringDay || 'Monday');
                        setExpiryType(a.expiryType || 'never');
                        setExpiryOccurrences(a.expiryOccurrences || 5);
                        if (a.expiryDate) setExpiryDate(isoToPickerDT(a.expiryDate));
                    }
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [id]);

    const markDirty = useCallback(() => setIsDirty(true), []);

    const handleCancel = () => isDirty ? setShowDiscard(true) : navigate(-1);

    const handleSave = async () => {
        setSaveState('saving'); setSaveError('');
        try {
            const common = { title, participants: selectedEntityIds, activityType };
            const extra = activityType === 'non-recurring'
                ? { rangeStart: range?.start?.date ?? range?.start, rangeEnd: range?.end?.date ?? range?.end }
                : { recurringStartTime, recurringEndTime, everyInterval, everyUnit,
                    recurringDay: everyUnit === 'Week' ? recurringDay : null,
                    expiryType, expiryDate: expiryDate?.date ?? expiryDate, expiryOccurrences };
            const res = await fetch(`/api/activities/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', body: JSON.stringify({ ...common, ...extra }),
            });
            const data = await res.json();
            if (data.success) { setSaveState('saved'); setTimeout(() => navigate('/activities'), 1500); }
            else { setSaveState('error'); setSaveError(data.message || 'Failed to save.'); }
        } catch { setSaveState('error'); setSaveError('Could not reach the server.'); }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-primary font-bold text-lg animate-pulse">Loading…</div>
        </div>
    );

    const saveLabel = saveState === 'saving' ? '⏳ Saving…' : saveState === 'saved' ? '✓ Saved!' : '✓ Save Changes';

    return (
        <div className="min-h-full w-full px-4 pt-6 pb-28 sm:px-8 max-w-2xl mx-auto">

            {/* Page header */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-3">Edit Activity</h1>
                <div className="flex justify-center">
                    {editingTitle ? (
                        <input autoFocus value={title}
                            onChange={e => { setTitle(e.target.value); markDirty(); }}
                            onBlur={() => setEditingTitle(false)}
                            onKeyDown={e => { if (e.key === 'Enter') setEditingTitle(false); }}
                            className="text-center text-base sm:text-lg font-bold text-neutral bg-transparent border-b-2 border-[var(--color-primary)]/60 outline-none pb-1 w-full max-w-xs transition-all" />
                    ) : (
                        <button onClick={() => setEditingTitle(true)}
                            className="group flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-subtle)]/40 hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer min-h-[44px]">
                            <span className="text-base sm:text-lg font-bold text-neutral">{title || 'Untitled'}</span>
                            <svg className="w-3.5 h-3.5 text-muted group-hover:text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-5">

                {/* Activity type badge (read-only reminder) */}
                <SectionCard>
                    <Label>Activity Type</Label>
                    <div className="mt-3 flex gap-3 flex-wrap">
                        {[
                            { id: 'non-recurring', label: 'Non-Recurring', sub: 'One-time date range' },
                            { id: 'recurring',     label: 'Recurring',      sub: 'Repeating schedule' },
                        ].map(({ id, label, sub }) => (
                            <button key={id} type="button"
                                onClick={() => { setActivityType(id); markDirty(); }}
                                className={`flex-1 min-w-[140px] flex flex-col items-start gap-1 px-4 py-3 rounded-xl border font-bold text-sm transition-all cursor-pointer active:scale-95 min-h-[44px] ${
                                    activityType === id
                                        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/60 text-primary'
                                        : 'border-[var(--border-subtle)] text-neutral hover:border-primary/40 hover:bg-white/5'
                                }`}>
                                <span className="text-sm font-bold">{label}</span>
                                <span className="text-[11px] font-normal text-muted">{sub}</span>
                            </button>
                        ))}
                    </div>
                </SectionCard>

                {/* Participants */}
                <SectionCard>
                    <Label>Participants</Label>
                    <p className="text-xs text-muted mt-1 mb-3">Click below to add or remove participants</p>
                    <EntitySelector selectedIds={selectedEntityIds} onChange={v => { setSelectedEntityIds(v); markDirty(); }} variant="standalone" />
                </SectionCard>

                {/* ── Non-Recurring schedule ── */}
                {activityType === 'non-recurring' && (
                    <SectionCard className="flex flex-col items-center py-10">
                        <Label>Select Date & Time Range</Label>
                        <div className="mt-6 w-full flex justify-center">
                            <DateTimeRangePicker
                                key={range ? `${range.start?.date}-${range.end?.date}` : 'new'}
                                initialStart={range?.start ?? undefined}
                                initialEnd={range?.end ?? undefined}
                                onChange={r => { setRange(r); markDirty(); }}
                            />
                        </div>
                    </SectionCard>
                )}

                {/* ── Recurring schedule ── */}
                {activityType === 'recurring' && (
                    <div className="flex flex-col gap-4">

                        {/* Time window */}
                        <SectionCard>
                            <Label>Time Window</Label>
                            <div className="flex flex-col gap-1 mt-3">
                                <button onClick={() => { setEditingStart(s => !s); setEditingEnd(false); }}
                                    className="flex items-center justify-between hover:bg-white/5 rounded-xl px-2 py-2 transition-all group w-full min-h-[44px] cursor-pointer">
                                    <span className="text-muted text-sm font-bold">Start</span>
                                    <span className="text-primary font-bold text-sm bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-full px-3 py-1">{recurringStartTime}</span>
                                </button>
                                {editingStart && (
                                    <div className="px-2 py-2 animate-in fade-in duration-150">
                                        <TimePicker initialTime={recurringStartTime} inline hideHelperText onChange={t => { setRecurringStartTime(t); markDirty(); }} />
                                        <GhostBtn onClick={() => setEditingStart(false)} className="mt-2 w-full text-sm py-2">Done</GhostBtn>
                                    </div>
                                )}
                                <button onClick={() => { setEditingEnd(s => !s); setEditingStart(false); }}
                                    className="flex items-center justify-between hover:bg-white/5 rounded-xl px-2 py-2 transition-all group w-full min-h-[44px] cursor-pointer">
                                    <span className="text-muted text-sm font-bold">End</span>
                                    <span className="text-primary font-bold text-sm bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-full px-3 py-1">{recurringEndTime}</span>
                                </button>
                                {editingEnd && (
                                    <div className="px-2 py-2 animate-in fade-in duration-150">
                                        <TimePicker initialTime={recurringEndTime} inline hideHelperText onChange={t => { setRecurringEndTime(t); markDirty(); }} />
                                        <GhostBtn onClick={() => setEditingEnd(false)} className="mt-2 w-full text-sm py-2">Done</GhostBtn>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* Period */}
                        <SectionCard>
                            <Label>Repeats</Label>
                            <div className="flex items-center gap-3 flex-wrap mt-3">
                                <span className="text-muted text-sm font-bold">Every</span>
                                <Stepper value={everyInterval} onChange={v => { setEveryInterval(v); markDirty(); }} />
                                <Dropdown
                                    value={everyUnit}
                                    onChange={v => { setEveryUnit(v); markDirty(); }}
                                    options={FREQ_UNITS.map(u => ({ value: u, label: `${u}${everyInterval > 1 ? 's' : ''}` }))}
                                    className="w-32"
                                />
                            </div>
                            {everyUnit === 'Week' && (
                                <div className="flex items-center justify-between mt-4 hover:bg-white/5 rounded-xl px-2 py-2 transition-all">
                                    <span className="text-muted text-sm font-bold">On</span>
                                    <Dropdown
                                        value={recurringDay}
                                        onChange={v => { setRecurringDay(v); markDirty(); }}
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
                                        <label className="flex items-center gap-3 cursor-pointer group min-h-[44px]">
                                            <div onClick={() => { setExpiryType(val); markDirty(); }}
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${expiryType === val ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-[var(--border-subtle)] group-hover:border-primary/50'}`}>
                                                {expiryType === val && <div className="w-2 h-2 rounded-full bg-[var(--bg-primary)]" />}
                                            </div>
                                            <span className="text-neutral text-sm font-bold flex-1">{label}</span>
                                            {val === 'after' && expiryType === 'after' && (
                                                <Stepper value={expiryOccurrences} onChange={v => { setExpiryOccurrences(v); markDirty(); }} />
                                            )}
                                        </label>
                                        {val === 'on_date' && expiryType === 'on_date' && (
                                            <div className="mt-2 ml-8 animate-in fade-in duration-150">
                                                <DateTimePicker onChange={s => { setExpiryDate(s); markDirty(); }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>
                )}

                {/* Save error */}
                {saveState === 'error' && (
                    <div className="bg-red-900/30 border border-red-500/40 rounded-xl px-4 py-3 text-sm text-red-300 animate-in fade-in duration-200">
                        {saveError}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2">
                    <button onClick={handleCancel}
                        className="min-h-[44px] text-muted hover:text-neutral font-bold text-sm transition-colors px-4 cursor-pointer">
                        ← Cancel
                    </button>
                    <PrimaryBtn onClick={handleSave}
                        disabled={saveState === 'saving' || saveState === 'saved'}
                        className={`flex-1 py-3.5 ${saveState === 'saved' ? 'bg-green-600' : ''}`}>
                        {saveLabel}
                    </PrimaryBtn>
                </div>
            </div>

            {showDiscard && (
                <DiscardSheet
                    onDiscard={() => { setShowDiscard(false); navigate(-1); }}
                    onKeep={() => setShowDiscard(false)} />
            )}
        </div>
    );
}
