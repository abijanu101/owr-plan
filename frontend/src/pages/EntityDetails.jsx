import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Avatar from '../components/avatar';
import EntityModal from '../components/EntityModal';
import EntityChip from '../components/EntitySelector/EntityChip';
import EntitySelector from '../components/EntitySelector';
import SelectionOverlayFiltered from '../components/EntitySelector/SelectionOverlayFiltered';
import Modal from '../components/Modal';
import ActivityCard from '../components/ActivityCard';
import Button from '../components/UI/Button';
import AllActivitiesModal from '../components/AllActivitiesModal';
import { getActivitiesByEntity } from '../api/activitiesApi';
import { listEntities, getEntity } from '../api/entitiesApi';

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

// ─── sortByProximity ─────────────────────────────────────────
function proximityScore(a) {
  const now = Date.now();
  if (a.activityType === 'non-recurring') {
    if (a.rangeStart) return Math.abs(new Date(a.rangeStart).getTime() - now);
    return Infinity;
  }
  if (a.recurringDay) {
    const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    const target = dayMap[a.recurringDay];
    if (target !== undefined) {
      const today = new Date();
      const current = today.getDay();
      const diff = (target - current + 7) % 7;
      const next = new Date(today);
      next.setDate(today.getDate() + diff);
      return Math.abs(next.getTime() - now);
    }
  }
  return Math.abs((a.createdAt || 0) - now);
}

// ─── useIsMobile ─────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return mobile;
}

// ─── ActivitiesSection ────────────────────────────────────────
function ActivitiesSection({ activities, onSchedule }) {
  const [showAllModal, setShowAllModal] = useState(false);
  const previewCount = 2;

  const sorted = useMemo(
    () => [...activities].sort((a, b) => proximityScore(a) - proximityScore(b)),
    [activities]
  );

  const preview = sorted.slice(0, previewCount);

  return (
    <>
      <CollapsibleSection title="Activities" defaultOpen={true}>
        {sorted.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 12px' }}>No activities yet.</p>
        ) : (
          <>
            <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {preview.map((a, idx) => (
                <ActivityCard key={a.id || idx} activity={a} />
              ))}
            </div>
            <button
              onClick={() => setShowAllModal(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0 12px', color: 'var(--color-primary)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}
            >
              <svg style={{ width: 16, height: 16 }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
              View all {sorted.length} {sorted.length === 1 ? 'activity' : 'activities'}
            </button>
          </>
        )}
        <Button onClick={onSchedule} variant="outline">+ Schedule New Activity</Button>
      </CollapsibleSection>

      <AllActivitiesModal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        activities={sorted}
      />
    </>
  );
}

// ─── MembersGroupsSection ─────────────────────────────────────
function MembersGroupsSection({ entity, allEntities, onRelationsChange }) {
  const isGroup = entity.type === 'group';
  const listTitle = isGroup ? 'Members' : 'Groups';
  const currentItems = isGroup ? (entity.members || []) : (entity.groups || []);

  const selectedIds = useMemo(() => currentItems.map(i => String(i._id)), [currentItems]);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const handleOverlayToggle = (newIds) => {
    onRelationsChange(isGroup ? 'members' : 'groups', newIds);
  };

  const handleChipClick = (itemId) => {
    const strId = String(itemId);
    const next = selectedIds.includes(strId)
      ? selectedIds.filter(id => id !== strId)
      : [...selectedIds, strId];
    handleOverlayToggle(next);
  };

  const previewItems = currentItems.slice(0, PREVIEW_COUNT);
  const extraCount = currentItems.length - PREVIEW_COUNT;
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
            <EntitySelector
              variant="inline"
              selectedIds={selectedIds}
              onChange={handleOverlayToggle}
              bubbleColor={entity.color}
            />
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
        entities={Object.values(allEntities)}
      />
    </>
  );
}

// ─── ViewAvailabilitySection ──────────────────────────────────
// Sits in the right column with the same divider+heading as Members/Activities.
// The hollow "Visualize" button navigates to /visualize and passes the entity
// as a full object in location.state.entities so BlockVisualization pre-selects it.
function ViewAvailabilitySection({ entity, navigate }) {
  const handleVisualize = () => {
    // BlockVisualization reads initialState.selectedEntities (array of entity IDs).
    // EntitySelector expects an array of ID strings to auto-select.
    navigate('/visualize', {
      state: {
        selectedEntities: [entity._id],
      },
    });
  };

  return (
    <CollapsibleSection title="View Availability" defaultOpen={true}>
      <button
        onClick={handleVisualize}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 24px',
          borderRadius: 12,
          background: 'transparent',
          // same colour as the section headings — not the entity's dynamic color
          border: '2px solid var(--color-primary)',
          color: 'var(--color-primary)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 10%, transparent)';
          e.currentTarget.style.boxShadow = '0 4px 14px color-mix(in srgb, var(--color-primary) 25%, transparent)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
        Visualize
      </button>
    </CollapsibleSection>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function EntityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entity, setEntity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [allEntities, setAllEntities] = useState({});
  const isMobile = useIsMobile(); // ← must be here with all other hooks, never after early returns

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entityData, rawActivities, allEntitiesArray] = await Promise.all([
        getEntity(id),
        getActivitiesByEntity(id),
        listEntities('all'),
      ]);

      const normalizeEntity = (e) => ({
        ...e,
        _id: String(e.id || e._id),
        type: e.type || 'person',
        face: (e.faceIcon || e.face || '').split('/').pop() || 'happy.svg',
        accessories: (e.accessories || []).map(a => typeof a === 'string' ? a.split('/').pop() : a),
        color: e.color || '#f97766',
        theme: e.theme || 'dark',
        members: (e.members || []).map(m => ({ _id: String(m._id || m), name: m.name || '', color: m.color || '#f97766', type: m.type || 'person' })),
        groups: (e.groups || []).map(g => ({ _id: String(g._id || g), name: g.name || '', color: g.color || '#f97766', type: g.type || 'group' })),
      });

      const allEntitiesObj = {};
      allEntitiesArray.forEach(e => {
        const n = normalizeEntity(e);
        allEntitiesObj[n._id] = n;
      });

      setEntity(normalizeEntity(entityData));
      setActivities(rawActivities);
      setAllEntities(allEntitiesObj);
    } catch (err) {
      console.error('Failed to load entity data:', err);
      setEntity(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const updateRelations = async (field, newIds) => {
    if (!entity) return;

    const updatedItems = newIds
      .map(id => {
        const found = allEntities[String(id)];
        return found ? { _id: String(found._id), name: found.name, color: found.color, type: found.type } : null;
      })
      .filter(Boolean);

    setEntity(prev => ({ ...prev, [field]: updatedItems }));

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    try {
      const res = await fetch(`/api/entities/${entity._id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ [field]: newIds }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
    } catch (err) {
      console.error('Error updating entity:', err);
      alert('Failed to save. Refreshing…');
      fetchData();
    }
  };

  const handleSave = (saved) => {
    setEntity(prev => ({
      ...prev,
      ...saved,
      face: (saved.faceIcon || saved.face || prev.face || '').split('/').pop() || prev.face,
      accessories: (saved.accessories || []).map(a => typeof a === 'string' ? a.split('/').pop() : a),
      theme: saved.theme || prev.theme || 'dark',
    }));
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

        {/* ── Left: Avatar + Name + (desktop) View Availability ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flexShrink: 0, width: 220 }}>
          <Avatar
            key={entity._id}
            face={entity.face}
            accessories={entity.accessories || []}
            theme={entity.theme || 'dark'}
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

          {/* Desktop only: View Availability sits under the name tag in the left column */}
          {!isMobile && (
            <div style={{ width: '100%' }}>
              <ViewAvailabilitySection entity={entity} navigate={navigate} />
            </div>
          )}
        </div>

        {/* ── Right: Sections ── */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <MembersGroupsSection
            entity={entity}
            allEntities={allEntities}
            onRelationsChange={updateRelations}
          />

          {/* Mobile only: View Availability sits above Activities */}
          {isMobile && (
            <ViewAvailabilitySection entity={entity} navigate={navigate} />
          )}

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
          _id: entity._id,
          name: entity.name,
          type: entity.type,
          theme: entity.theme || 'dark',
          face: entity.face,
          faceIcon: entity.face,
          accessories: entity.accessories || [],
          color: entity.color,
        }}
        existingNames={Object.values(allEntities).map(e => e.name)}
        onSuccess={handleSave}
      />
    </div>
  );
}