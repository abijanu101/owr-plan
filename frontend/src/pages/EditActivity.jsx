import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TimePicker from '../components/Pickers/TimePicker';
import DateTimePicker from '../components/Pickers/DateTimePicker';
import EntitySelector from '../components/EntitySelector';

// ─── Constants ───────────────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FREQ = ['Day', 'Week', 'Month'];
const defaultSlot = () => ({ id: Date.now(), day: 'Monday', startTime: '08:00 AM', endTime: '09:00 AM', label: '' });

// Mock data — replace with real API fetch
const MOCK_ACTIVITY = {
    _id: '1',
    title: 'AHCI Weekly Lab',
    participants: ['1', '3', '4'],
    scheduleMode: 'structured',
    slots: [
        { id: 1, day: 'Monday', startTime: '08:30 AM', endTime: '10:00 AM', label: 'AHCI' },
        { id: 2, day: 'Wednesday', startTime: '02:00 PM', endTime: '03:30 PM', label: 'Lab' },
    ],
    recurrence: { enabled: true, interval: 1, frequency: 'Week', endType: 'never', endDate: '', occurrences: 1 },
};

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

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, action, onAction, onDismiss }) {
    useEffect(() => {
        const t = setTimeout(onDismiss, 4000);
        return () => clearTimeout(t);
    }, [onDismiss]);
    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-2xl px-5 py-3 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <span className="text-sm text-neutral font-bold">{message}</span>
            {action && <button onClick={onAction} className="text-sm font-bold text-primary hover:underline cursor-pointer min-h-[44px] px-2">{action}</button>}
        </div>
    );
}

// ─── Discard Confirmation Sheet ───────────────────────────────────────────────
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

// ─── Collapsible Slot Card ────────────────────────────────────────────────────
function SlotCard({ slot, index, onChange, onRemove }) {
    const [collapsed, setCollapsed] = useState(true);
    const [editingStart, setEditingStart] = useState(false);
    const [editingEnd, setEditingEnd] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(false);
    const deleteTimer = useRef(null);

    const summary = `${slot.day} • ${slot.startTime} – ${slot.endTime}${slot.label ? ` • ${slot.label}` : ''}`;

    const handleDeleteTap = () => {
        if (pendingDelete) {
            clearTimeout(deleteTimer.current);
            setPendingDelete(false);
        } else {
            setPendingDelete(true);
            deleteTimer.current = setTimeout(() => {
                setPendingDelete(false);
                onRemove?.();
            }, 4000);
        }
    };

    useEffect(() => () => clearTimeout(deleteTimer.current), []);

    return (
        <SectionCard className="transition-all duration-200">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => setCollapsed(c => !c)}
                    className="w-8 h-8 min-w-[44px] min-h-[44px] rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center text-primary cursor-pointer transition-transform duration-200"
                    style={{ transform: collapsed ? 'none' : 'rotate(90deg)' }}>
                    ›
                </button>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setCollapsed(c => !c)}>
                    {collapsed
                        ? <p className="text-sm text-neutral font-bold truncate">{summary}</p>
                        : <Label>Slot {index + 1}</Label>}
                </div>
                {pendingDelete ? (
                    <div className="flex items-center gap-2 animate-in fade-in duration-150">
                        <span className="text-xs text-red-400 font-bold">Delete?</span>
                        <button onClick={() => { clearTimeout(deleteTimer.current); setPendingDelete(false); onRemove?.(); }}
                            className="text-xs text-red-400 border border-red-500/40 rounded-full px-3 py-1 hover:bg-red-500/10 cursor-pointer min-h-[44px]">Yes</button>
                        <button onClick={() => { clearTimeout(deleteTimer.current); setPendingDelete(false); }}
                            className="text-xs text-muted border border-[var(--border-subtle)] rounded-full px-3 py-1 hover:bg-white/5 cursor-pointer min-h-[44px]">Undo</button>
                    </div>
                ) : onRemove && (
                    <button onClick={handleDeleteTap}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted hover:text-red-400 transition-colors cursor-pointer rounded-full hover:bg-red-500/10">
                        🗑
                    </button>
                )}
            </div>

            {!collapsed && (
                <div className="flex flex-col gap-1 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Day */}
                    <div className="flex items-center justify-between hover:bg-white/5 rounded-xl px-2 py-2 transition-all min-h-[44px]">
                        <span className="text-muted text-sm font-bold">Day</span>
                        <select value={slot.day} onChange={e => onChange({ ...slot, day: e.target.value })}
                            className="bg-transparent text-neutral font-bold text-right outline-none cursor-pointer hover:text-primary transition-colors text-sm min-h-[44px]">
                            {DAYS.map(d => <option key={d} value={d} className="bg-[var(--bg-raised)]">{d}</option>)}
                        </select>
                    </div>

                    {/* Start */}
                    <button onClick={() => { setEditingStart(s => !s); setEditingEnd(false); }}
                        className="flex items-center justify-between hover:bg-white/5 rounded-xl px-2 py-2 transition-all group w-full min-h-[44px] cursor-pointer">
                        <span className="text-muted text-sm font-bold">Start</span>
                        <div className="flex items-center gap-2 bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-full px-3 py-1.5 group-hover:border-primary/50 transition-all">
                            <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span className="text-primary font-bold text-sm">{slot.startTime}</span>
                        </div>
                    </button>
                    {editingStart && (
                        <div className="px-2 py-2 animate-in fade-in duration-150">
                            <TimePicker initialTime={slot.startTime} inline hideHelperText onChange={t => onChange({ ...slot, startTime: t })} />
                            <GhostBtn onClick={() => setEditingStart(false)} className="mt-2 w-full text-sm py-2">Done</GhostBtn>
                        </div>
                    )}

                    {/* End */}
                    <button onClick={() => { setEditingEnd(s => !s); setEditingStart(false); }}
                        className="flex items-center justify-between hover:bg-white/5 rounded-xl px-2 py-2 transition-all group w-full min-h-[44px] cursor-pointer">
                        <span className="text-muted text-sm font-bold">End</span>
                        <div className="flex items-center gap-2 bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-full px-3 py-1.5 group-hover:border-primary/50 transition-all">
                            <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span className="text-primary font-bold text-sm">{slot.endTime}</span>
                        </div>
                    </button>
                    {editingEnd && (
                        <div className="px-2 py-2 animate-in fade-in duration-150">
                            <TimePicker initialTime={slot.endTime} inline hideHelperText onChange={t => onChange({ ...slot, endTime: t })} />
                            <GhostBtn onClick={() => setEditingEnd(false)} className="mt-2 w-full text-sm py-2">Done</GhostBtn>
                        </div>
                    )}

                    {/* Label */}
                    <div className="flex items-center justify-between hover:bg-white/5 rounded-xl px-2 py-2 transition-all min-h-[44px]">
                        <span className="text-muted text-sm font-bold">Label</span>
                        <input value={slot.label} onChange={e => onChange({ ...slot, label: e.target.value })}
                            placeholder="e.g. AHCI"
                            className="bg-transparent text-right text-neutral font-bold placeholder-[var(--text-muted)]/40 outline-none w-28 text-sm" />
                    </div>

                    <button onClick={() => setCollapsed(true)}
                        className="mt-1 text-xs text-muted hover:text-primary transition-colors text-center w-full min-h-[44px] cursor-pointer">▲ Collapse</button>
                </div>
            )}
        </SectionCard>
    );
}

// ─── Recurrence Section ───────────────────────────────────────────────────────
function RecurrenceSection({ rec, onChange }) {
    const set = u => onChange({ ...rec, ...u });
    return (
        <div className="flex flex-col gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3 flex-wrap">
                <Label>Every</Label>
                <Stepper value={rec.interval} onChange={v => set({ interval: v })} />
                <select value={rec.frequency} onChange={e => set({ frequency: e.target.value })}
                    className="bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-neutral font-bold outline-none cursor-pointer hover:border-primary/50 transition-all text-sm min-h-[44px]">
                    {FREQ.map(f => <option key={f} value={f} className="bg-[var(--bg-raised)]">{f}{rec.interval > 1 ? 's' : ''}</option>)}
                </select>
            </div>
            <div className="flex flex-col gap-2.5">
                <Label>Ends</Label>
                {[{val:'never',label:'Never'},{val:'on_date',label:'On Date'},{val:'after',label:'After N Occurrences'}].map(({val,label}) => (
                    <div key={val}>
                        <label className="flex items-center gap-3 cursor-pointer group min-h-[44px]">
                            <div onClick={() => set({ endType: val })}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${rec.endType===val?'border-[var(--color-primary)] bg-[var(--color-primary)]':'border-[var(--border-subtle)] group-hover:border-primary/50'}`}>
                                {rec.endType===val && <div className="w-2 h-2 rounded-full bg-[var(--bg-primary)]"/>}
                            </div>
                            <span className="text-neutral text-sm font-bold flex-1">{label}</span>
                            {val==='after' && rec.endType==='after' && <Stepper value={rec.occurrences} onChange={v => set({occurrences:v})}/>}
                        </label>
                        {val==='on_date' && rec.endType==='on_date' && (
                            <div className="mt-2 ml-8 animate-in fade-in duration-150">
                                <DateTimePicker onChange={s => set({endDate:s.date,endTime:s.time})} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EditActivity() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [original, setOriginal] = useState(null);

    const [title, setTitle] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);
    const [selectedEntityIds, setSelectedEntityIds] = useState([]);
    const [slots, setSlots] = useState([]);
    const [recurrence, setRecurrence] = useState({ enabled: false, interval: 1, frequency: 'Week', endType: 'never', endDate: '', occurrences: 1 });

    const [isDirty, setIsDirty] = useState(false);
    const [showDiscard, setShowDiscard] = useState(false);
    const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
    const [saveError, setSaveError] = useState('');
    const [toast, setToast] = useState(null); // { message, action, onAction }

    // Load activity
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Replace with real fetch: const res = await fetch(`/api/activities/${id}`); const data = await res.json();
                const data = { success: true, data: { activity: MOCK_ACTIVITY } };
                if (data.success) {
                    const a = data.data.activity;
                    setTitle(a.title);
                    setSelectedEntityIds(a.participants || []);
                    setSlots((a.slots || []).map((s, i) => ({ ...s, id: s.id || i })));
                    setRecurrence(a.recurrence || { enabled: false, interval: 1, frequency: 'Week', endType: 'never', endDate: '', occurrences: 1 });
                    setOriginal(a);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [id]);

    const markDirty = useCallback(() => setIsDirty(true), []);

    const updateTitle = v => { setTitle(v); markDirty(); };
    const updateSlot = (i, updated) => { setSlots(prev => prev.map((s, idx) => idx === i ? updated : s)); markDirty(); };
    const removeSlot = (i) => { setSlots(prev => prev.filter((_, idx) => idx !== i)); markDirty(); };
    const addSlot = () => { setSlots(prev => [...prev, defaultSlot()]); markDirty(); };
    const updateRec = v => { setRecurrence(v); markDirty(); };
    const updateEntities = v => { setSelectedEntityIds(v); markDirty(); };

    const handleCancel = () => {
        if (isDirty) setShowDiscard(true);
        else navigate(-1);
    };

    const handleSave = async () => {
        setSaveState('saving');
        setSaveError('');
        try {
            const payload = { title, participants: selectedEntityIds, slots, recurrence };
            // const res = await fetch(`/api/activities/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
            // const data = await res.json();
            await new Promise(r => setTimeout(r, 900)); // simulate
            const data = { success: true };
            if (data.success) {
                setSaveState('saved');
                setTimeout(() => navigate('/activities'), 1500);
            } else {
                setSaveState('error');
                setSaveError(data.message || 'Failed to save.');
            }
        } catch {
            setSaveState('error');
            setSaveError('Could not reach the server.');
        }
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

                {/* Inline-editable title */}
                <div className="flex justify-center">
                    {editingTitle ? (
                        <input autoFocus value={title}
                            onChange={e => updateTitle(e.target.value)}
                            onBlur={() => setEditingTitle(false)}
                            onKeyDown={e => { if (e.key === 'Enter') setEditingTitle(false); }}
                            className="text-center text-base sm:text-lg font-bold text-neutral bg-transparent border-b-2 border-[var(--color-primary)]/60 outline-none pb-1 w-full max-w-xs transition-all" />
                    ) : (
                        <button onClick={() => setEditingTitle(true)}
                            className="group flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-subtle)]/40 hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer min-h-[44px]">
                            <span className="text-base sm:text-lg font-bold text-neutral">{title || 'Untitled'}</span>
                            <svg className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-5">

                {/* Participants */}
                <SectionCard>
                    <Label>Participants</Label>
                    <p className="text-xs text-muted mt-1 mb-3">Click below to add or remove participants</p>
                    <EntitySelector selectedIds={selectedEntityIds} onChange={updateEntities} variant="standalone" />
                </SectionCard>

                {/* Time Slots */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                        <Label>Time Slots</Label>
                        <span className="text-xs text-muted">{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
                    </div>
                    {slots.map((slot, i) => (
                        <SlotCard key={slot.id} slot={slot} index={i}
                            onChange={updated => updateSlot(i, updated)}
                            onRemove={slots.length > 1 ? () => removeSlot(i) : null} />
                    ))}
                    <GhostBtn onClick={addSlot} className="w-full justify-center">+ Add Slot</GhostBtn>
                </div>

                {/* Recurrence */}
                <SectionCard className="border-[var(--color-primary)]/15 bg-[var(--bg-accent)]/15">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Recurrence</Label>
                            {recurrence.enabled && (
                                <p className="text-xs text-muted mt-0.5">Every {recurrence.interval} {recurrence.frequency}{recurrence.interval > 1 ? 's' : ''}</p>
                            )}
                        </div>
                        <button onClick={() => updateRec({ ...recurrence, enabled: !recurrence.enabled })}
                            className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm transition-all cursor-pointer active:scale-95 shrink-0 ${recurrence.enabled ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border-[var(--color-primary)]' : 'border-[var(--border-subtle)] text-neutral hover:border-primary/50 hover:bg-white/5'}`}>
                            {recurrence.enabled ? '↺ Recurring' : '+ Recurring'}
                        </button>
                    </div>
                    {recurrence.enabled && <RecurrenceSection rec={recurrence} onChange={updateRec} />}
                </SectionCard>

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

            {/* Discard sheet */}
            {showDiscard && (
                <DiscardSheet
                    onDiscard={() => { setShowDiscard(false); navigate(-1); }}
                    onKeep={() => setShowDiscard(false)} />
            )}

            {/* Toast */}
            {toast && (
                <Toast message={toast.message} action={toast.action} onAction={toast.onAction}
                    onDismiss={() => setToast(null)} />
            )}
        </div>
    );
}
