// components/EntityList1.jsx
import EntityCard1 from './EntityCard1';

export default function EntityList({ items, selectedIds, onToggleSelect, emptyLabel, onDelete, onDuplicate }) {
  if (!items || items.length === 0) {
    return (
      <div className="entity-list-empty">
        <div className="empty-icon">📭</div>
        <p className="empty-text">{emptyLabel || 'No items found'}</p>
      </div>
    );
  }

  return (
    <div className="entity-grid">
      {items.map((entity) => (
        <div key={entity.id} style={{ position: 'relative' }}>
          {/* Checkbox - TOP LEFT */}
          <div 
            style={{ 
              position: 'absolute', 
              top: '12px', 
              left: '12px', 
              zIndex: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selectedIds.has(entity.id)}
              onChange={() => onToggleSelect(entity.id)}
              style={{
                width: '22px',
                height: '22px',
                cursor: 'pointer',
                accentColor: '#f97766',
                backgroundColor: selectedIds.has(entity.id) ? '#f97766' : 'transparent',
                border: '2px solid #f97766',
                borderRadius: '4px',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                position: 'relative',
              }}
            />
            {selectedIds.has(entity.id) && (
              <span style={{
                position: 'absolute',
                top: '1px',
                left: '5px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                pointerEvents: 'none',
              }}>
                ✓
              </span>
            )}
          </div>
          <EntityCard1
            item={entity}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        </div>
      ))}
    </div>
  );
}