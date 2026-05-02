import { useState } from 'react';
import DayPicker from './DayPicker';

export default function ActivityForm({ initial, onSubmit }) {
  const [form, setForm] = useState(initial ?? {
    title: '', timeRange: '', date: '', days: [], participants: [],
  });

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  return (
    <form
      id="activity-form"
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div>
        <label className="label">Title</label>
        <input className="input" value={form.title}
          onChange={(e) => update({ title: e.target.value })} required />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="label">Time range</label>
          <input className="input" placeholder="1pm-4pm" value={form.timeRange}
            onChange={(e) => update({ timeRange: e.target.value })} />
        </div>
        <div>
          <label className="label">Date</label>
          <input className="input" placeholder="12 March 2026" value={form.date}
            onChange={(e) => update({ date: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="label">Days</label>
        <DayPicker value={form.days} onChange={(days) => update({ days })} />
      </div>

      <div>
        <label className="label">Participants (comma separated)</label>
        <input className="input"
          value={form.participants.join(', ')}
          onChange={(e) => update({
            participants: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
          })}
        />
      </div>
    </form>
  );
}
