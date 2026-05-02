import EntityRow from './EntityRow';

export default function EntityList({ items, selectedIds, onToggleSelect, emptyLabel }) {
  if (items.length === 0) {
    return <div className="pill" style={{ justifyContent: 'center' }}>{emptyLabel}</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((e) => (
        <EntityRow
          key={e.id}
          entity={e}
          selected={selectedIds.has(e.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
