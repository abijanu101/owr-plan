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
export default function EntityCard({ item, onDelete, onDuplicate }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const color    = item.color || '#f97766';
  const isGroup  = item.kind === 'group' || item.type === 'group';

  // Resolve face filename — handles full paths or plain filenames
  const faceFile = (item.faceIcon || item.face || '').split('/').pop() || undefined;

  // Related entities: groups show their members, people show their groups
  const related = isGroup ? (item.members || []) : (item.groups || []);
  const relatedIds = related.map(r => String(r._id || r.id || r));

  return (
    <div
      className="entity-card"
      onClick={() => navigate(`/entities/${item.id || item._id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderColor:   `${color}40`,
        borderRadius:  '20px',
        paddingLeft:   '16px',
        paddingRight:  '16px',
        paddingTop:    '14px',
        paddingBottom: '14px',
        display:       'flex',
        alignItems:    'center',
        gap:           16,
        position:      'relative',
        backgroundColor: isHovered ? `${color}1A` : `${color}0D`,
        transition:    'background-color 0.3s ease, transform 0.2s ease',
      }}
    >
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
              onChange={() => {}}
              bubbleColor={color}
            />
          </div>
        )}
      </div>
    </div>
  );
}