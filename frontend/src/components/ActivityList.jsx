import ActivityRow from './ActivityRow';

export default function ActivityList({ items, selectedIds, onToggleSelect }) {
  if (items.length === 0) {
    return <div className="pill" style={{ justifyContent: 'center' }}>No activities yet.</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((a) => (
        <ActivityRow
          key={a.id}
          activity={a}
          selected={selectedIds.has(a.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
