import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './avatar/index.jsx';
import EntitySelector from './EntitySelector';

// ─── Mini stacked avatars (bottom-right of card) ──────────────
function AvatarStack({ items, color }) {
  if (!items || items.length === 0) return null;

  const shown   = items.slice(0, 4);
  const overflow = items.length - shown.length;
  const OVERLAP  = 14; // px each chip slides left

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((item, idx) => (
        <div
          key={item._id || item.id || idx}
          title={item.name}
          style={{
            marginLeft: idx === 0 ? 0 : -OVERLAP,
            zIndex: shown.length - idx,
            position: 'relative',
            borderRadius: '50%',
            boxShadow: `0 0 0 2px var(--bg-primary)`,
          }}
        >
          <Avatar
            face={(item.faceIcon || item.face || '').split('/').pop() || undefined}
            accessories={[]}
            size={26}
            isGroup={item.type === 'group'}
            theme={item.theme || 'dark'}
            bgColor={item.color || color}
            shape="circle"
          />
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            marginLeft: -OVERLAP,
            zIndex: 0,
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: `${color}25`,
            border: `2px solid ${color}60`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 800,
            color,
            boxShadow: `0 0 0 2px var(--bg-primary)`,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

// ─── EntityCard ───────────────────────────────────────────────
export default function EntityCard({ item, isSelected, onSelect, onClick, onRelationsChange }) {
  const [isHovered, setIsHovered] = useState(false);
  const color    = item.color || '#f97766';
  const isGroup  = item.kind === 'group' || item.type === 'group';
  console.log('EntityCard isGroup:', isGroup, 'item name:', item.name);

  // Resolve face filename — handles full paths or plain filenames
  const faceFile = (item.faceIcon || item.face || '').split('/').pop() || undefined;

  // Related entities: groups show their members, people show their groups
  const related = isGroup ? (item.members || []) : (item.groups || []);
  const relatedIds = related.map(r => String(r._id || r.id || r));

  return (
    <div
      className="entity-card"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderColor:   `${color}40`,
        borderRadius:  '14px',
        paddingLeft:   '12px',
        paddingRight:  '12px',
        paddingTop:    '10px',
        paddingBottom: '10px',
        display:       'flex',
        alignItems:    'center',
        gap:           16,
        position:      'relative',
        backgroundColor: isHovered ? `${color}1A` : `${color}0D`,
        boxShadow:       isHovered ? `0 10px 40px ${color}35` : `0 4px 20px rgba(0,0,0,0.2)`,
        transform:       isHovered ? 'translateY(-5px) scale(1.01)' : 'translateY(0) scale(1)',
        transition:      'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
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
            top: '10px', 
            right: '10px', 
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
            width: '20px',
            height: '20px',
            borderRadius: '6px',
            border: `2px solid ${isSelected ? color : `${color}60`}`,
            background: isSelected ? color : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isSelected ? `0 0 10px ${color}40` : 'none',
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

      {/* Avatar — larger and on the left */}
      <div style={{ flexShrink: 0 }}>
        <Avatar
          face={faceFile}
          accessories={(item.accessories || []).map(a =>
            typeof a === 'string' ? a.split('/').pop() : a
          )}
          size={64}
          isGroup={isGroup}
          theme={item.theme || 'dark'}
          bgColor={color}
          shape="rounded"
        />
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontSize:   '15px',
          fontWeight: 700,
          color:      'var(--text-neutral)',
          margin:     '0 0 6px 0',
          overflow:   'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {item.name}
        </h3>

        <div style={{
          height:     '1.5px',
          background: `${color}30`,
          margin:     '0 0 8px 0',
          borderRadius: '1px',
        }} />

        {/* Inline Entity Selector for related items */}
        {related.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <EntitySelector
              variant="inline"
              selectedIds={relatedIds}
              filterType={isGroup ? 'people' : 'groups'}
              onChange={(newIds) => onRelationsChange?.(isGroup ? 'members' : 'groups', newIds)}
              bubbleColor={color}
            />
          </div>
        )}
      </div>
    </div>
  );
}