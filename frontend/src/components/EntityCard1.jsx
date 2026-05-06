// components/EntityCard1.jsx
import { useNavigate } from 'react-router-dom';
import Avatar from './avatar/index.jsx';

export default function EntityCard1({ item, onDelete, onDuplicate }) {
  const navigate = useNavigate();
  const color = item.color || '#f97766';

  return (
    <div 
      className="entity-card"
      onClick={() => navigate(`/entities/${item.id}`)}
      style={{ 
        borderColor: `${color}40`,
        borderRadius: '20px',
        paddingLeft: '10px',
      }}
    >

      <Avatar
        face={item.faceIcon}     
        accessories={item.accessories || []}
        size={28}
        shape="circle"
        bgColor={item.color}
      />
      <div style={{ flex: 1, minWidth: 0 }}></div>


      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--text-neutral)',
          margin: '0 0 10px 0',
        }}>
          {item.name}
        </h3>
        
        <div style={{
          height: '2px',
          background: `${color}30`,
          margin: '0 0 10px 0',
          borderRadius: '1px',
        }}></div>
        
        {item.kind === 'group' && item.members && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {item.members.slice(0, 3).map((member, idx) => (
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
                {member}
              </span>
            ))}
            {item.memberCount > 3 && (
              <span style={{
                backgroundColor: `${color}20`,
                color: color,
                border: `2px solid ${color}40`,
                borderRadius: '20px',
                padding: '3px 12px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                +{item.memberCount - 3}
              </span>
            )}
          </div>
        )}
        
        {item.kind === 'person' && item.groups && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {item.groups.slice(0, 2).map((group, idx) => (
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
                {group}
              </span>
            ))}
            {item.groups.length > 2 && (
              <span style={{
                backgroundColor: `${color}20`,
                color: color,
                border: `2px solid ${color}40`,
                borderRadius: '20px',
                padding: '3px 12px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                +{item.groups.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}