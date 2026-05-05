// components/ActivityList.jsx
import ActivityCard from './ActivityCard';

export default function ActivityList({ items, selectedIds, onToggleSelect, onDelete, onDuplicate }) {
  if (!items || items.length === 0) {
    return (
      <div className="entity-list-empty">
        <div className="empty-icon">📭</div>
        <p className="empty-text">No activities yet.</p>
      </div>
    );
  }

  return (
    <div className="entity-grid">
      {items.map((activity) => (
        <div key={activity.id} style={{ position: 'relative' }}>
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
              checked={selectedIds.has(activity.id)}
              onChange={() => onToggleSelect(activity.id)}
              style={{
                width: '22px',
                height: '22px',
                cursor: 'pointer',
                accentColor: '#f97766',
                backgroundColor: selectedIds.has(activity.id) ? '#f97766' : 'transparent',
                border: '2px solid #f97766',
                borderRadius: '4px',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                position: 'relative',
              }}
            />
            {selectedIds.has(activity.id) && (
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
          <ActivityCard
            activity={activity}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        </div>
      ))}
    </div>
  );
}