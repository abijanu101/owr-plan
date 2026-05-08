import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Avatar from '../components/avatar';
import EntityModal from '../components/EntityModal';
import EntityChip from '../components/EntitySelector/EntityChip';
import SelectionOverlayFiltered from '../components/EntitySelector/SelectionOverlayFiltered';
import Modal from '../components/Modal';
import ActivityCard from '../components/ActivityCard';
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

  const convertedActivities = useMemo(() => activities.map(a => ({
    id:          a._id,
    title:       a.title,
    color:       a.color || '#f97766',
    days:        a.slots?.map(s => s.day) || [],
    date:        a.date || null,
    timeRange:   a.slots?.length > 0 ? `${a.slots[0].startTime} – ${a.slots[0].endTime}` : 'No time set',
    participants: a.participants || [],
  })), [activities]);

  const sortedActivities = useMemo(() => {
    const dayOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    return [...convertedActivities].sort((a, b) =>
      dayOrder.indexOf(a.days?.[0] || '') - dayOrder.indexOf(b.days?.[0] || '')
    );
  }, [convertedActivities]);

  const previewActivities = sortedActivities.slice(0, 2);

  return (
    <>
      <CollapsibleSection title="Activities" defaultOpen={true}>
        {activities.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 12px' }}>No activities yet.</p>
        ) : (
          <>
            <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {previewActivities.map(a => <ActivityCard key={a.id} activity={a} />)}
            </div>
            {sortedActivities.length > 2 && (
              <button
                onClick={() => setShowAllModal(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0 12px', color: 'var(--color-primary)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}
              >
                <svg style={{ width: 16, height: 16 }} fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
                View all {sortedActivities.length} activities
              </button>
            )}
          </>
        )}
        <Button onClick={onSchedule} variant="outline">+ Schedule New Activity</Button>
      </CollapsibleSection>

      <Modal open={showAllModal} title="All Activities" onClose={() => setShowAllModal(false)} footer={<Button onClick={() => setShowAllModal(false)} variant="primary">Close</Button>}>
        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingBottom: 16 }}>
          {sortedActivities.map(a => <ActivityCard key={a.id} activity={a} />)}
        </div>
      </Modal>
    </>
  );
}

// ─── MembersGroupsSection ─────────────────────────────────────
function MembersGroupsSection({ entity, onRelationsChange }) {
  const isGroup    = entity.type === 'group';
  const listTitle  = isGroup ? 'Members' : 'Groups';
  const currentItems = isGroup ? (entity.members || []) : (entity.groups || []);

  // FIX 2: selectedIds for overlay derived directly from entity — stays in sync
  // because EntityDetails updates entity state optimistically before backend returns
  const selectedIds = useMemo(() => currentItems.map(i => String(i._id)), [currentItems]);

  const [overlayOpen, setOverlayOpen] = useState(false);

  // FIX 3: handleOverlayToggle now just calls onRelationsChange with newIds array
  // EntityDetails is responsible for optimistic update + backend call
  const handleOverlayToggle = (newIds) => {
    onRelationsChange(isGroup ? 'members' : 'groups', newIds);
  };

  // Page-level chip click: toggle that item directly (remove from list)
  const handleChipClick = (itemId) => {
    const strId = String(itemId);
    const next  = selectedIds.includes(strId)
      ? selectedIds.filter(id => id !== strId)
      : [...selectedIds, strId];
    handleOverlayToggle(next);
  };

  const previewItems = currentItems.slice(0, PREVIEW_COUNT);
  const extraCount   = currentItems.length - PREVIEW_COUNT;

  return (
    <>
      <CollapsibleSection title={listTitle} defaultOpen={true}>
        {currentItems.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>No {listTitle.toLowerCase()} yet.</p>
            <button
              onClick={() => setOverlayOpen(true)}
              style={{ alignSelf: 'flex-start', background: 'none', border: '1.5px dashed var(--color-primary)', borderRadius: 9999, padding: '4px 14px', color: 'var(--color-primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: 0.7 }}
            >
              + Add {listTitle}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {previewItems.map(item => (
              <EntityChip
                key={item._id}
                name={item.name}
                color={item.color}
                isSelected={true}
                isGroup={!isGroup}
                onClick={() => handleChipClick(String(item._id))}
              />
            ))}
            {extraCount > 0 && (
              <button
                onClick={() => setOverlayOpen(true)}
                style={{ padding: '5px 14px', borderRadius: 9999, background: 'var(--bg-raised)', border: '2px solid var(--color-primary)', color: 'var(--color-primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                +{extraCount} more
              </button>
            )}
            <button
              onClick={() => setOverlayOpen(true)}
              title={`Edit ${listTitle}`}
              style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-raised)', border: '2px solid var(--text-muted)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              ✎
            </button>
          </div>
        )}
      </CollapsibleSection>

      <SelectionOverlayFiltered
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        selectedIds={selectedIds}
        onToggle={handleOverlayToggle}
        People={isGroup}
      />
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function EntityDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [entity,     setEntity]     = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [allEntities, setAllEntities] = useState({});

  // Full data fetch — only on mount / id change, NOT after every toggle
  const fetchData = async () => {
    setLoading(true);
    const token   = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [entityRes, activitiesRes, allEntitiesRes] = await Promise.all([
        fetch(`/api/entities/${id}`,           { headers }),
        fetch(`/api/activities/entity/${id}`,  { headers }),
        fetch(`/api/entities`,            { headers }),
      ]);

      if (!entityRes.ok) throw new Error('Entity not found');

      const entityData      = await entityRes.json();
      const activityData    = activitiesRes.ok  ? await activitiesRes.json()  : [];
      const allEntitiesArray = allEntitiesRes.ok ? await allEntitiesRes.json() : [];

      const normalizeEntity = (e) => ({
        ...e,
        _id:         String(e._id),
        type:        e.type || 'person',
        face:        (e.faceIcon || e.face || 'face/happy.svg').replace(/^\/avatar\//, ''),
        accessories: (e.accessories || []).map(a => typeof a === 'string' ? a.replace(/^\/avatar\//, '') : a),
        color:       e.color || '#f97766',
        members: (e.members || []).map(m => ({ _id: String(m._id || m), name: m.name || '', color: m.color || '#f97766', type: m.type || 'person' })),
        groups:  (e.groups  || []).map(g => ({ _id: String(g._id || g), name: g.name || '', color: g.color || '#f97766', type: g.type || 'group'  })),
      });

      const allEntitiesObj = {};
      allEntitiesArray.forEach(e => {
        const n = normalizeEntity(e);
        allEntitiesObj[n._id] = n;
      });

      setEntity(normalizeEntity(entityData));
      setActivities(Array.isArray(activityData) ? activityData : []);
      setAllEntities(allEntitiesObj);
    } catch (err) {
      console.error('Failed to load entity data:', err);
      setEntity(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  // ── FIX 4: updateRelations ────────────────────────────────────────────────
  // Receives field ('members'|'groups') and newIds (string[]).
  // Step 1 — optimistic update: rebuild item objects from allEntities and set
  //          state immediately so page chips and overlay both update instantly.
  // Step 2 — backend PATCH: sends only the changed field, no full entity needed.
  // Step 3 — NO full refetch after success (avoids flicker + overlay close).
  //          Only refetch if backend returns an error.
  const updateRelations = async (field, newIds) => {
    if (!entity) return;

    // Build full item objects for optimistic state
    const updatedItems = newIds
      .map(id => {
        const found = allEntities[String(id)];
        return found
          ? { _id: String(found._id), name: found.name, color: found.color }
          : null;
      })
      .filter(Boolean);

    // Optimistic update — instant, no waiting
    setEntity(prev => ({ ...prev, [field]: updatedItems }));

    // Backend PATCH — only send what changed
    const token   = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    try {
      const res = await fetch(`/api/entities/${entity._id}`, {
        method:  'PATCH',   // PATCH not PUT — only updates specified fields
        headers,
        body:    JSON.stringify({ [field]: newIds }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      // Success — optimistic state is already correct, no refetch needed

    } catch (err) {
      console.error('Error updating entity:', err);
      // Rollback optimistic update by re-fetching
      alert('Failed to save. Refreshing…');
      fetchData();
    }
  };

  const handleSave = (saved) => {
    setEntity(prev => ({ ...prev, ...saved }));
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 32 }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 20 }} className="animate-pulse">Loading...</div>
    </div>
  );

  if (!entity) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 32 }}>
      <div style={{ color: 'var(--color-error)', fontSize: 18 }}>Entity not found.</div>
    </div>
  );

  const isGroup = entity.type === 'group';

  return (
    <div style={{ width: '100%', minHeight: '100%', padding: '32px 24px', boxSizing: 'border-box', overflowY: 'auto' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 48, flexWrap: 'wrap' }}>

        {/* Left: Avatar + Name */}
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
            <div style={{ padding: '8px 22px', borderRadius: 9999, background: entity.color || 'var(--color-primary)', color: '#fff', fontFamily: 'inherit', fontWeight: 900, fontSize: 18, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {entity.name}
            </div>
            <button
              onClick={() => setIsEditOpen(true)}
              title="Edit"
              style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-raised)', border: '2px solid var(--text-muted)', color: 'var(--text-neutral)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✎
            </button>
          </div>
        </div>

        {/* Right: Sections */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <MembersGroupsSection
            entity={entity}
            onRelationsChange={updateRelations}
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