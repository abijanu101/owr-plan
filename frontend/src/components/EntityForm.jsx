import { useState } from 'react';

export default function EntityForm({ initial, kind, onSubmit }) {
  const [form, setForm] = useState(initial ?? {
    kind, name: '', subtitle: '', emoji: kind === 'person' ? '🙂' : '✨', members: [],
  });
  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  return (
    <form
      id="entity-form"
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
        <div>
          <label className="label">Emoji</label>
          <input className="input" value={form.emoji}
            onChange={(e) => update({ emoji: e.target.value })} />
        </div>
        <div>
          <label className="label">Name</label>
          <input className="input" value={form.name}
            onChange={(e) => update({ name: e.target.value })} required />
        </div>
      </div>

      <div>
        <label className="label">Subtitle / tagline</label>
        <input className="input"
          placeholder={kind === 'person' ? 'MY COMFORT PERSON' : '(Alizeh, Ansa, +2)'}
          value={form.subtitle}
          onChange={(e) => update({ subtitle: e.target.value })} />
      </div>

      {kind === 'group' && (
        <div>
          <label className="label">Members (comma separated)</label>
          <input className="input"
            value={(form.members ?? []).join(', ')}
            onChange={(e) => update({
              members: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })}
          />
        </div>
      )}
    </form>
  );
}
