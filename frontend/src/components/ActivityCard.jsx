import React from 'react';
import { useNavigate } from 'react-router-dom';
import EntitySelector from './EntitySelector';

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const RepeatIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
const ExpiryIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);


export default function ActivityCard({ activity, isSelected, onSelect, onClick }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const color = '#f97766';

  const CardContent = activity.activityType === 'recurring' ? RecurringCard : NonRecurringCard;

  return (
    <div
      className="entity-card group"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderColor: `${color}35`,
        borderRadius: '24px',
        padding: '16px 20px',
        position: 'relative',
        backgroundColor: isHovered ? `${color}1A` : `${color}0D`,
        boxShadow: isHovered ? `0 12px 40px ${color}35` : `0 4px 20px rgba(0,0,0,0.15)`,
        transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 40,
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '8px',
            border: `2px solid ${isSelected ? color : `${color}60`}`,
            background: isSelected ? color : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isSelected ? `0 0 12px ${color}40` : 'none',
          }}>
            {isSelected && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: '14px', height: '14px' }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>
      )}

      <CardContent activity={activity} color={color} />
    </div>
  );
}

// Update the internal cards to be just content providers (no padding or onClick)
function NonRecurringCard({ activity, color }) {
  const start = activity.rangeStart ? new Date(activity.rangeStart) : null;
  const end = activity.rangeEnd ? new Date(activity.rangeEnd) : null;

  const fmtDate = (d) => d ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const fmtTime = (d) => d ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '';

  const timeRange = start && end ? `${fmtTime(start)} – ${fmtTime(end)}` : (activity.timeRange || '');
  const dateLabel = start ? fmtDate(start) : (activity.dateLabel || '');

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-neutral)', margin: '0 0 8px 0' }}>
        {activity.title}
      </h3>
      <div style={{ height: 2, background: `${color}25`, marginBottom: 12, borderRadius: 1 }} />

      {timeRange && (
        <div className="flex items-center gap-1.5 mb-2.5" style={{ color }}>
          <ClockIcon />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-neutral)' }}>{timeRange}</span>
        </div>
      )}

      {dateLabel && (
        <div className="flex items-center gap-1.5 mb-1" style={{ color }}>
          <CalendarIcon />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dateLabel}</span>
        </div>
      )}

      {activity.participants?.length > 0 && (
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          <EntitySelector
            variant="inline"
            selectedIds={(activity.participants || []).map(p => typeof p === 'object' ? String(p._id || p.id) : String(p))}
            onChange={() => { }}
            bubbleColor={color}
          />
        </div>
      )}
    </div>
  );
}

function RecurringCard({ activity, color }) {
  const timeRange = activity.timeRange || (
    (activity.recurringStartTime || activity.recurringEndTime)
      ? `${activity.recurringStartTime || ''} – ${activity.recurringEndTime || ''}`
      : ''
  );

  const scheduleStr = activity.scheduleStr;
  const expiryStr = activity.expiryStr;

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="flex items-center gap-2 mb-2 flex-wrap pr-8">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-neutral)', margin: 0 }}>
          {activity.title}
        </h3>
        <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full"
          style={{ color, background: `${color}18`, border: `1px solid ${color}40`, letterSpacing: '0.05em' }}>
          <RepeatIcon /> RECURRING
        </span>
      </div>
      <div style={{ height: 2, background: `${color}25`, marginBottom: 12, borderRadius: 1 }} />

      {timeRange && (
        <div className="flex items-center gap-1.5 mb-2.5" style={{ color }}>
          <ClockIcon />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-neutral)' }}>{timeRange}</span>
        </div>
      )}

      {scheduleStr && (
        <div className="flex items-center gap-1.5 mb-2" style={{ color }}>
          <RepeatIcon />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{scheduleStr}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5" style={{ color: expiryStr === 'No expiry' ? `${color}70` : '#ff5f5f' }}>
        <ExpiryIcon />
        <span style={{ fontSize: 11, fontWeight: 500, color: expiryStr === 'No expiry' ? 'var(--text-muted)' : '#ff5f5f' }}>{expiryStr}</span>
      </div>

      {activity.participants?.length > 0 && (
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          <EntitySelector
            variant="inline"
            selectedIds={(activity.participants || []).map(p => typeof p === 'object' ? String(p._id || p.id) : String(p))}
            onChange={() => { }}
            bubbleColor={color}
          />
        </div>
      )}
    </div>
  );
}