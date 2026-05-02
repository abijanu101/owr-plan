import Pill from './Pill';
import Checkbox from './Checkbox';

export default function EntityRow({ entity, selected, onToggleSelect }) {
  return (
    <Pill selected={selected} onClick={() => onToggleSelect(entity.id)}>
      <Checkbox checked={selected} onChange={() => onToggleSelect(entity.id)} />
      <div style={{
        width: 40, height: 40, borderRadius: 9999,
        background: 'var(--bg-accent)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>
        {entity.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, letterSpacing: 0.5 }}>{entity.name}</div>
        <div className="text-muted" style={{ fontSize: 13 }}>{entity.subtitle}</div>
      </div>
    </Pill>
  );
}
