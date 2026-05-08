import { useNavigate } from 'react-router-dom';

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const RepeatIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const ExpiryIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

function ParticipantChips({ participants, color }) {
  const shown = participants.slice(0, 3);
  const rest  = participants.length - 3;
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {shown.map((p, i) => (
        <span key={i} className="text-[11px] font-semibold px-3 py-0.5 rounded-full border"
          style={{ color, borderColor: `${color}50`, background: `${color}15` }}>
          {p}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-[11px] font-semibold px-3 py-0.5 rounded-full border"
          style={{ color, borderColor: `${color}50`, background: `${color}15` }}>
          +{rest}
        </span>
      )}
    </div>
  );
}

// ─── Non-Recurring Card ───────────────────────────────────────────────────────
function NonRecurringCard({ activity, color, onClick }) {
  return (
    <div onClick={onClick} className="entity-card cursor-pointer hover:scale-[1.01] transition-transform"
      style={{ borderColor: `${color}35`, borderRadius: 20, paddingLeft: 40 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title */}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-neutral)', margin: '0 0 8px 0' }}>
          {activity.title}
        </h3>
        <div style={{ height: 2, background: `${color}25`, marginBottom: 10, borderRadius: 1 }} />

        {/* Time range */}
        {activity.timeRange && (
          <div className="flex items-center gap-1.5 mb-2" style={{ color }}>
            <ClockIcon />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-neutral)' }}>
              {activity.timeRange}
            </span>
          </div>
        )}

        {/* Date */}
        {activity.dateLabel && (
          <div className="flex items-center gap-1.5 mb-1" style={{ color }}>
            <CalendarIcon />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {activity.dateLabel}
            </span>
          </div>
        )}

        {!activity.timeRange && !activity.dateLabel && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No date set</span>
        )}

        {activity.participants?.length > 0 && (
          <ParticipantChips participants={activity.participants} color={color} />
        )}
      </div>
    </div>
  );
}

// ─── Recurring Card ───────────────────────────────────────────────────────────
function RecurringCard({ activity, color, onClick }) {
  return (
    <div onClick={onClick} className="entity-card cursor-pointer hover:scale-[1.01] transition-transform"
      style={{ borderColor: `${color}35`, borderRadius: 20, paddingLeft: 40 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title + badge */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-neutral)', margin: 0 }}>
            {activity.title}
          </h3>
          <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}>
            <RepeatIcon /> RECURRING
          </span>
        </div>
        <div style={{ height: 2, background: `${color}25`, marginBottom: 10, borderRadius: 1 }} />

        {/* Time window */}
        {activity.timeRange && (
          <div className="flex items-center gap-1.5 mb-2" style={{ color }}>
            <ClockIcon />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-neutral)' }}>
              {activity.timeRange}
            </span>
          </div>
        )}

        {/* Schedule */}
        <div className="flex items-center gap-1.5 mb-1.5" style={{ color }}>
          <RepeatIcon />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
            {activity.scheduleStr}
          </span>
        </div>

        {/* Expiry */}
        <div className="flex items-center gap-1.5" style={{ color: activity.expiryStr === 'No expiry' ? `${color}70` : '#f97766' }}>
          <ExpiryIcon />
          <span style={{ fontSize: 11, fontWeight: 500, color: activity.expiryStr === 'No expiry' ? 'var(--text-muted)' : '#f97766' }}>
            {activity.expiryStr}
          </span>
        </div>

        {activity.participants?.length > 0 && (
          <ParticipantChips participants={activity.participants} color={color} />
        )}
      </div>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
export default function ActivityCard({ activity }) {
  const navigate = useNavigate();
  const color = '#f97766';
  const onClick = () => navigate(`/activities/${activity.id}`);

  if (activity.activityType === 'recurring') {
    return <RecurringCard activity={activity} color={color} onClick={onClick} />;
  }
  return <NonRecurringCard activity={activity} color={color} onClick={onClick} />;
}