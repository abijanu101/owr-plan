import ActivityCard from './ActivityCard';
import { useNavigate } from 'react-router-dom';

export default function ActivityList({ items, selectedIds, onToggleSelect }) {
  const navigate = useNavigate();

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
        <ActivityCard
          key={activity.id}
          activity={activity}
          isSelected={selectedIds.has(activity.id)}
          onSelect={() => onToggleSelect(activity.id)}
          onClick={() => navigate(`/activities/${activity.id}`)}
        />
      ))}
    </div>
  );
}