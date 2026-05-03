// components/ActivityCard.jsx
import { useNavigate } from 'react-router-dom';

const ClockIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CalendarIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const RecurringIcon = ({ color }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

export default function ActivityCard({ activity, onDelete, onDuplicate }) {
  const navigate = useNavigate();
  const color = activity.color || '#f97766';
  const isRecurring = activity.days && activity.days.length > 0;
  const isExpiring = activity.date && activity.date.startsWith('Expires');

  return (
    <div 
      className="entity-card"
      onClick={() => navigate(`/activities/${activity.id}`)}
      style={{ 
        borderColor: `${color}40`,
        borderRadius: '20px',
        paddingLeft: '40px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title + Recurring Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-neutral)',
            margin: 0,
          }}>
            {activity.title}
          </h3>
          {isRecurring && (
            <span style={{
              backgroundColor: `${color}20`,
              color: color,
              border: `1px solid ${color}40`,
              borderRadius: '12px',
              padding: '2px 10px',
              fontSize: '10px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <RecurringIcon color={color} />
              RECURRING
            </span>
          )}
        </div>
        
        {/* Colored divider */}
        <div style={{
          height: '2px',
          background: `${color}30`,
          margin: '0 0 10px 0',
          borderRadius: '1px',
        }}></div>
        
        {/* Time/Duration */}
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ClockIcon color={color} />
          <span style={{
            fontSize: '13px',
            color: 'var(--text-neutral)',
            fontWeight: 600,
          }}>
            {activity.timeRange}
          </span>
        </div>
        
        {/* Date/Expiry */}
        {activity.date && (
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarIcon color={isExpiring ? '#f97766' : color} />
            <span style={{
              fontSize: '12px',
              color: isExpiring ? '#f97766' : 'var(--text-muted)',
              fontWeight: isExpiring ? 600 : 400,
            }}>
              {activity.date}
            </span>
          </div>
        )}
        
        {/* Members */}
        {activity.participants && activity.participants.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {activity.participants.slice(0, 3).map((participant, idx) => (
              <span key={idx} style={{
                backgroundColor: `${color}20`,
                color: color,
                border: `2px solid ${color}40`,
                borderRadius: '20px',
                padding: '3px 12px',
                fontSize: '11px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                {participant}
              </span>
            ))}
            {activity.participants.length > 3 && (
              <span style={{
                backgroundColor: `${color}20`,
                color: color,
                border: `2px solid ${color}40`,
                borderRadius: '20px',
                padding: '3px 12px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                +{activity.participants.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}