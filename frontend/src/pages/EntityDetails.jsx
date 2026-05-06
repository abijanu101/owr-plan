import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Avatar from '../components/avatar';
import EntityModal from '../components/EntityModal';
import EntityChip from '../components/EntitySelector/EntityChip';
import SelectionOverlayFiltered from '../components/EntitySelector/SelectionOverlayFiltered';
import Button from '../components/UI/Button';

// ─── MOCK DATA ────────────────────────────────────────────────
const M = {
  p_ahmed:  { _id: 'p_ahmed',  name: 'Ahmed',  type: 'person', color: '#5E5AB2', face: 'face/happy.svg',   accessories: [] },
  p_alizeh: { _id: 'p_alizeh', name: 'Alizeh', type: 'person', color: '#B23B3B', face: 'face/sassy.svg',   accessories: [] },
  p_zoha:   { _id: 'p_zoha',   name: 'Zoha',   type: 'person', color: '#488845', face: 'face/happy.svg',   accessories: [] },
  p_abi:    { _id: 'p_abi',    name: 'Abi',    type: 'person', color: '#1B7A7A', face: 'face/naughty.svg', accessories: [] },
  p_ansa:   { _id: 'p_ansa',   name: 'Ansa',   type: 'person', color: '#911B7D', face: 'face/happy.svg',   accessories: [] },
  g_secg:   { _id: 'g_secg',   name: 'Section G',   type: 'group', color: '#1B5491', face: 'face/happy-g.svg',   accessories: [] },
  g_aml:    { _id: 'g_aml',    name: 'AML-6A',      type: 'group', color: '#B29B3B', face: 'face/sassy-g.svg',   accessories: [] },
  g_owrplan:{ _id: 'g_owrplan',name: 'owrplan gng', type: 'group', color: '#5E5AB2', face: 'face/naughty-g.svg', accessories: [] },
};

function ref(e) { return { _id: e._id, name: e.name, color: e.color }; }

M.g_secg.members    = [ref(M.p_alizeh), ref(M.p_abi), ref(M.p_ansa), ref(M.p_zoha)];
M.g_aml.members     = [ref(M.p_ahmed),  ref(M.p_alizeh), ref(M.p_zoha)];
M.g_owrplan.members = [ref(M.p_ahmed),  ref(M.p_alizeh), ref(M.p_zoha), ref(M.p_abi), ref(M.p_ansa)];

M.p_ahmed.groups  = [ref(M.g_aml),  ref(M.g_owrplan)];
M.p_alizeh.groups = [ref(M.g_secg), ref(M.g_aml), ref(M.g_owrplan)];
M.p_zoha.groups   = [ref(M.g_aml),  ref(M.g_owrplan)];
M.p_abi.groups    = [ref(M.g_secg), ref(M.g_owrplan)];
M.p_ansa.groups   = [ref(M.g_secg), ref(M.g_owrplan)];

M.g_secg.groups = []; M.g_aml.groups = []; M.g_owrplan.groups = [];
M.p_ahmed.members = []; M.p_alizeh.members = []; M.p_zoha.members = [];
M.p_abi.members = []; M.p_ansa.members = [];

const MOCK_ENTITIES = M;

const MOCK_ACTIVITIES = [
  { _id: 'a1', title: 'Ca Class University', participants: ['p_alizeh', 'p_abi', 'p_ansa'],
    slots: [{ day: 'Monday', startTime: '09:00 AM', endTime: '11:30 AM' }, { day: 'Monday', startTime: '02:00 PM', endTime: '03:30 PM' }] },
  { _id: 'a2', title: 'Meeting', participants: ['p_ahmed', 'p_abi', 'p_ansa'],
    slots: [{ day: 'Monday', startTime: '04:00 PM', endTime: '05:00 PM' }] },
  { _id: 'a3', title: 'Gym Session', participants: ['p_ahmed', 'p_alizeh'],
    slots: [{ day: 'Monday', startTime: '06:00 AM', endTime: '07:30 AM' }, { day: 'Tuesday', startTime: '06:00 AM', endTime: '07:30 AM' }] },
];

const PREVIEW_COUNT = 3;

// ─── CollapsibleSection ───────────────────────────────────────
function CollapsibleSection({ title, children, defaultOpen = true, action }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ width: '100%', height: 1, background: 'var(--text-muted)', opacity: 0.35, marginBottom: 10 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: open ? 14 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ color: 'var(--color-primary)', fontFamily: 'inherit', fontWeight: 900, fontSize: 18, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
            {title}
          </h2>
          {action}
        </div>
        <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <svg style={{ width: 20, height: 20, color: 'var(--text-muted)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
      </div>
      {open && children}
    </div>
  );
}

// ─── ActivityRow ─────────────────────────────────────────────
function ActivityRow({ activity }) {
  const [expanded, setExpanded] = useState(false);
  const slots = activity.slots || [];
  const firstSlot = slots[0];
  return (
    <div style={{ borderRadius: 14, border: '1px solid var(--text-muted)', overflow: 'hidden', marginBottom: 10 }}>
      <button onClick={() => setExpanded(o => !o)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ color: 'var(--text-neutral)', fontFamily: 'inherit', fontWeight: 700, fontSize: 15, textAlign: 'left' }}>{activity.title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {firstSlot && (
            <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5, fontFamily: 'inherit' }}>
              <div>{firstSlot.startTime} – {firstSlot.endTime}</div>
              <div>{firstSlot.day}</div>
              {slots.length > 1 && <div style={{ color: 'var(--color-primary)', fontSize: 11 }}>+{slots.length - 1} more slot{slots.length > 2 ? 's' : ''}</div>}
            </div>
          )}
          <svg style={{ width: 18, height: 18, color: 'var(--text-muted)', transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease', flexShrink: 0 }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
      </button>
      {expanded && slots.length > 1 && (
        <div style={{ borderTop: '1px solid var(--text-muted)', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {slots.map((slot, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'inherit' }}>
              <span style={{ fontWeight: 700 }}>{slot.day}</span>
              <span>{slot.startTime} – {slot.endTime}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ActivitiesSection ────────────────────────────────────────
function ActivitiesSection({ activities, onSchedule }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? activities : activities.slice(0, PREVIEW_COUNT);
  const hidden  = activities.length - PREVIEW_COUNT;
  return (
    <CollapsibleSection title="Activities" defaultOpen={true}>
      {activities.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 13, margin: '0 0 12px' }}>No activities yet.</p>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            {visible.map(a => <ActivityRow key={a._id} activity={a} />)}
          </div>
          {activities.length > PREVIEW_COUNT && (
            <button onClick={() => setShowAll(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0 12px', color: 'var(--color-primary)', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg style={{ width: 16, height: 16, transform: showAll ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z" />
              </svg>
              {showAll ? 'Show less' : `Show all ${activities.length} activities (+${hidden} more)`}
            </button>
          )}
        </>
      )}
      <Button onClick={onSchedule} variant="outline">+ Schedule New Activity</Button>
    </CollapsibleSection>
  );
}

// ─── MembersGroupsSection ─────────────────────────────────────
// Shows 3 preview chips, then a "+N more" button that opens
// SelectionOverlay filtered to only the relevant type.
//
// entity type = 'group'  → shows members (people), overlay shows only people
// entity type = 'person' → shows groups,           overlay shows only groups
// ─────────────────────────────────────────────────────────────
function MembersGroupsSection({ entity, allEntities, onRelationsChange }) {
  const isGroup   = entity.type === 'group';
  const listTitle = isGroup ? 'Members' : 'Groups';

  // The IDs currently associated (members for a group, groups for a person)
  const currentItems = isGroup ? (entity.members || []) : (entity.groups || []);
  const selectedIds  = currentItems.map(i => i._id);

  // Overlay state
  const [overlayOpen, setOverlayOpen] = useState(false);

  // The universe shown in the overlay:
  //   - viewing a group  → show only people  (so you pick members)
  //   - viewing a person → show only groups  (so you pick groups)
  const overlayEntities = useMemo(() => {
    const targetType = isGroup ? 'person' : 'group';
    return Object.values(allEntities)
      .filter(e => e.type === targetType)
      .map(e => ({
        id:      e._id,
        name:    e.name,
        color:   e.color,
        type:    e.type,
        members: (e.members || []).map(m => m._id),
      }));
  }, [allEntities, isGroup]);

  // When the overlay toggles a chip it passes back the full new id array
  const handleOverlayToggle = (newIds) => {
    if (!onRelationsChange) return;

    // Build the updated item list from the full entity pool
    const updatedItems = newIds
      .map(id => {
        const found = allEntities[id];
        return found ? { _id: found._id, name: found.name, color: found.color } : null;
      })
      .filter(Boolean);

    onRelationsChange(isGroup ? 'members' : 'groups', updatedItems);
  };

  // Single chip click toggles directly without opening overlay
  const handleChipClick = (itemId) => {
    const next = selectedIds.includes(itemId)
      ? selectedIds.filter(id => id !== itemId)
      : [...selectedIds, itemId];
    handleOverlayToggle(next);
  };

  // Preview: first 3, rest shown as "+N more" button
  const previewItems = currentItems.slice(0, PREVIEW_COUNT);
  const extraCount   = currentItems.length - PREVIEW_COUNT;

  return (
    <>
      <CollapsibleSection title={listTitle} defaultOpen={true}>
        {currentItems.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 13, margin: 0 }}>
              No {listTitle.toLowerCase()} yet.
            </p>
            <button
              onClick={() => setOverlayOpen(true)}
              style={{
                alignSelf: 'flex-start',
                background: 'none',
                border: '1.5px dashed var(--color-primary)',
                borderRadius: 9999,
                padding: '4px 14px',
                color: 'var(--color-primary)',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                opacity: 0.7,
              }}
            >
              + Add {listTitle}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {/* Preview chips — clicking a chip navigates to it (not toggle, navigate) */}
            {previewItems.map(item => (
              <EntityChip
                key={item._id}
                name={item.name}
                color={item.color}
                isSelected={true}          // always "selected" since they're in the list
                isGroup={!isGroup}         // if parent is group, items are people (not group)
                onClick={() => handleChipClick(item._id)}
              />
            ))}

            {/* "+N more" button opens overlay */}
            {extraCount > 0 && (
              <button
                onClick={() => setOverlayOpen(true)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 9999,
                  background: 'var(--bg-raised)',
                  border: '2px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                +{extraCount} more
              </button>
            )}

            {/* Edit button — always visible, opens overlay */}
            <button
              onClick={() => setOverlayOpen(true)}
              title={`Edit ${listTitle}`}
              style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: 'var(--bg-raised)',
                border: '2px solid var(--text-muted)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ✎
            </button>
          </div>
        )}
      </CollapsibleSection>

      {/* Overlay — filtered to only the relevant type */}
      <SelectionOverlayFiltered
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        selectedIds={selectedIds}
        onToggle={handleOverlayToggle}
        entities={overlayEntities}
        People={isGroup}
      />
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function EntityDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [entity,     setEntity]     = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Keep a local copy of all entities so MembersGroupsSection can build the overlay list
  const [allEntities, setAllEntities] = useState(MOCK_ENTITIES);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const h = { Authorization: `Bearer ${token}` };

    const normalize = (raw) => ({
      ...raw,
      _id:         raw._id || raw.id,
      type:        raw.type || 'person',
      face:        (raw.faceIcon || raw.face || 'face/happy.svg').replace(/^\/avatar\//, ''),
      accessories: (raw.accessories || []).map(a => typeof a === 'string' ? a.replace(/^\/avatar\//, '') : a),
      color:       raw.color || '#ffad8a',
      members:     (raw.members || []).filter(Boolean).map(m => ({ _id: m._id || m.id, name: m.name, color: m.color || '#ffad8a' })),
      groups:      (raw.groups  || []).filter(Boolean).map(g => ({ _id: g._id || g.id, name: g.name, color: g.color || '#ffad8a' })),
    });

    Promise.all([
      fetch(`/api/entities/${id}`, { headers: h }).then(r => r.ok ? r.json() : Promise.reject('Entity not found')),
      fetch(`/api/entities/${id}/activities`, { headers: h }).then(r => r.ok ? r.json() : []).catch(() => []),
    ])
      .then(([entityData, activityData]) => {
        let normalized  = normalize(entityData);
        let acts        = Array.isArray(activityData) ? activityData : [];
        const mockEntity = MOCK_ENTITIES[id];
        if (mockEntity && (!normalized.members?.length || !normalized.groups?.length)) {
          normalized = {
            ...normalized,
            members: normalized.members?.length ? normalized.members : (mockEntity.members || []),
            groups:  normalized.groups?.length  ? normalized.groups  : (mockEntity.groups  || []),
          };
        }
        if (!acts.length && mockEntity) acts = MOCK_ACTIVITIES.filter(a => a.participants.includes(id));
        setEntity(normalized);
        setActivities(acts);
        setLoading(false);
      })
      .catch(() => {
        const found = MOCK_ENTITIES[id];
        if (found) {
          setEntity(found);
          setActivities(MOCK_ACTIVITIES.filter(a => a.participants.includes(id)));
        } else {
          setEntity(null);
        }
        setLoading(false);
      });
  }, [id]);

  const handleSave = (saved) => setEntity(prev => ({ ...prev, ...saved }));

  // Update members or groups on the entity (local state; wire to API as needed)
  const handleRelationsChange = (field, updatedItems) => {
    setEntity(prev => ({ ...prev, [field]: updatedItems }));
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 32 }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 20, fontFamily: 'inherit' }} className="animate-pulse">Loading...</div>
    </div>
  );

  if (!entity) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 32 }}>
      <div style={{ color: 'var(--color-error)', fontSize: 18, fontFamily: 'inherit' }}>
        Entity not found. Try: /entities/p_ahmed, /entities/p_alizeh, /entities/g_secg
      </div>
    </div>
  );

  const isGroup = entity.type === 'group';

  return (
    <div style={{ width: '100%', minHeight: '100%', padding: '32px 24px', boxSizing: 'border-box', overflowY: 'auto' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 48, flexWrap: 'wrap' }}>

        {/* ── LEFT: Avatar + Name ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flexShrink: 0, width: 220 }}>
          <Avatar
            key={entity._id}
            face={entity.face}
            accessories={entity.accessories || []}
            size={220}
            isGroup={isGroup}
            bgColor={entity.color}
            shape="rounded"
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: '8px 22px', borderRadius: 9999, background: entity.color || 'var(--color-primary)', color: '#fff', fontFamily: 'inherit', fontWeight: 900, fontSize: 18, letterSpacing: '0.15em', textTransform: 'uppercase', boxShadow: `0 4px 20px ${entity.color}55` }}>
              {entity.name}
            </div>
            <button
              onClick={() => setIsEditOpen(true)}
              title="Edit"
              style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-raised)', border: '2px solid var(--text-muted)', color: 'var(--text-neutral)', cursor: 'pointer', fontSize: 15, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✎
            </button>
          </div>
        </div>

        {/* ── RIGHT: Sections ── */}
        <div style={{ flex: 1, minWidth: 280 }}>

          {/* Members / Groups section with overlay */}
          <MembersGroupsSection
            entity={entity}
            allEntities={allEntities}
            onRelationsChange={handleRelationsChange}
          />

          <ActivitiesSection
            activities={activities}
            onSchedule={() => navigate('/activities/create')}
          />

        </div>
      </div>

      <EntityModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        editingEntity={{
          _id:         entity._id,
          name:        entity.name,
          type:        entity.type,
          face:        entity.face,
          faceIcon:    entity.face,
          accessories: entity.accessories || [],
          color:       entity.color,
        }}
        onSuccess={handleSave}
      />
    </div>
  );
}
