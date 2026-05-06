import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Avatar from '../components/avatar';
import EntityModal from '../components/EntityModal';
import EntityChip from '../components/EntitySelector/EntityChip';
import SelectionOverlayFiltered from '../components/EntitySelector/SelectionOverlayFiltered';
import Modal from '../components/Modal';
import ActivityCard from '../components/ActivityCard';
import ActivityList from '../components/ActivityList';
import Button from '../components/UI/Button';

const PREVIEW_COUNT = 2;

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

// ─── ActivitiesSection ────────────────────────────────────────
function ActivitiesSection({ activities, onSchedule }) {
  const [showAllModal, setShowAllModal] = useState(false);

  // Convert activities from EntityDetails format to ActivityCard format
  const convertedActivities = useMemo(() => {
    return activities.map(a => ({
      id: a._id,
      title: a.title,
      color: a.color || '#f97766',
      days: a.slots?.map(s => s.day) || [],
      date: a.date || null,
      timeRange: a.slots?.length > 0 
        ? `${a.slots[0].startTime} – ${a.slots[0].endTime}`
        : 'No time set',
      participants: a.participants || [],
    }));
  }, [activities]);

  // Sort by date (latest first) - using first slot's day as reference
  const sortedActivities = useMemo(() => {
    return [...convertedActivities].sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const aIndex = dayOrder.indexOf(a.days?.[0] || '');
      const bIndex = dayOrder.indexOf(b.days?.[0] || '');
      return bIndex - aIndex; // Latest first
    });
  }, [convertedActivities]);

  // Preview: first 2 activities
  const previewActivities = sortedActivities.slice(0, 2);
  const totalActivities = sortedActivities.length;

  return (
    <>
      <CollapsibleSection title="Activities" defaultOpen={true}>
        {activities.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 13, margin: '0 0 12px' }}>No activities yet.</p>
        ) : (
          <>
            <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {previewActivities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                />
              ))}
            </div>

            {totalActivities > 2 && (
              <button 
                onClick={() => setShowAllModal(true)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '8px 0 12px', 
                  color: 'var(--color-primary)', 
                  fontFamily: 'inherit', 
                  fontWeight: 700, 
                  fontSize: 13, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  marginBottom: 12
                }}
              >
                <svg style={{ width: 16, height: 16 }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
                View all {totalActivities} activities
              </button>
            )}
          </>
        )}
        <Button onClick={onSchedule} variant="outline">+ Schedule New Activity</Button>
      </CollapsibleSection>

      {/* Modal for viewing all activities */}
      <Modal
        open={showAllModal}
        title="All Activities"
        onClose={() => setShowAllModal(false)}
        footer={
          <Button 
            onClick={() => setShowAllModal(false)}
            variant="primary"
            style={{ padding: '8px 16px' }}
          >
            Close
          </Button>
        }
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingBottom: 16 }}>
          {sortedActivities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
              No activities found.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sortedActivities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
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
  const [allEntities, setAllEntities] = useState({});

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
      fetch(`/api/activities/entity/${id}`, { headers: h }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`/api/entities/user`, { headers: h })
        .then(res => res.ok ? res.json() : [])
        .then(data => setAllEntities(data))
        .catch(err => console.error('Failed to fetch all entities:', err)),
        
    ])
      .then(([entityData, activityData, allEntitiesData]) => {
        let normalized = normalize(entityData);
        let acts = Array.isArray(activityData) ? activityData : [];
        let allEntitiesNormalized = {};
        
        if (allEntitiesData && typeof allEntitiesData === 'object') {
          Object.values(allEntitiesData).forEach(e => {
            if (e && e._id) {
              allEntitiesNormalized[e._id] = normalize(e);
            }
          });
        }
        
        setEntity(normalized);
        setActivities(acts);
        setAllEntities(allEntitiesNormalized);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load entity data:', error);
        setEntity(null);
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
        Entity not found.
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