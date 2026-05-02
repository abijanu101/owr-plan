import Pill from './Pill';
import Checkbox from './Checkbox';
import DayPicker from './DayPicker';

export default function ActivityRow({ activity, selected, onToggleSelect }) {
  return (
    <Pill selected={selected} onClick={() => onToggleSelect(activity.id)}>
      <Checkbox checked={selected} onChange={() => onToggleSelect(activity.id)} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{activity.title}</div>
        <div className="text-muted" style={{ fontSize: 13 }}>({activity.timeRange})</div>
      </div>
      <div className="text-muted" style={{ flex: 1, textAlign: 'center', fontSize: 14 }}>
        {activity.date}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <DayPicker value={activity.days} readOnly />
        <div className="text-muted" style={{ fontSize: 13 }}>
          ({activity.participants.join(', ')})
        </div>
      </div>
    </Pill>
  );
}
