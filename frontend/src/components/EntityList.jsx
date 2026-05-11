// components/EntityList.jsx
import { useNavigate } from 'react-router-dom';
import EntityCard from './EntityCard';

export default function EntityList({ items, selectedIds, onToggleSelect, emptyLabel, onDelete, onDuplicate, onRelationsChange }) {
  const navigate = useNavigate();

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
      {items.map((entity) => {
        const id = String(entity.id || entity._id);
        return (
          <EntityCard
            key={id}
            item={entity}
            isSelected={selectedIds.has(id)}
            onSelect={() => onToggleSelect(id)}
            onRelationsChange={(type, ids) => onRelationsChange?.(id, type, ids)}
            onClick={() => {
              if (selectedIds.size > 0) {
                onToggleSelect(id);
              } else {
                navigate(`/entities/${id}`);
              }
            }}
          />
        );
      })}
    </div>
  );
}