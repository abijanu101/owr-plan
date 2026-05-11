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

// ─── SimpleSection ───────────────────────────────────────────
function SimpleSection({ title, children, action, titleAction }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 8px 0' }}>
        <h2 style={{ color: 'var(--color-primary)', fontFamily: 'inherit', fontWeight: 900, fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
          {title}
        </h2>
        {titleAction}
      </div>
      <div style={{ width: '100%', height: 1, background: 'var(--text-muted)', opacity: 0.15, marginBottom: 12 }} />
      {action && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          {action}
        </div>
      )}
      {children}
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
function ActivitiesSection({ activities, onSchedule, entityId, navigate }) {
  const [visibleCount, setVisibleCount] = useState(3);
  const [search, setSearch] = useState('');

  const sorted = useMemo(
    () => [...activities].sort((a, b) => proximityScore(a) - proximityScore(b)),
    [activities]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const lower = search.toLowerCase();
    return sorted.filter(a => (a.title || '').toLowerCase().includes(lower));
  }, [sorted, search]);

  const preview = filtered.slice(0, visibleCount);

  const handleVisualize = () => {
    navigate('/visualize', { state: { selectedEntities: [entityId] } });
  };

  const actions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', justifyContent: 'space-between' }}>
      <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search activities..."
          style={{
            width: '100%',
            background: 'var(--bg-raised)',
            border: '1.2px solid rgba(249, 111, 102, 0.2)',
            borderRadius: 12,
            padding: '8px 12px 8px 38px',
            color: 'var(--text-neutral)',
            fontSize: 13,
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = 'rgba(249, 111, 102, 0.2)'}
        />
        <svg
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--text-muted)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"
        >
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onSchedule}
          title="Schedule New Activity"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'var(--color-primary)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(249, 111, 102, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg style={{ width: 22, height: 22 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          onClick={handleVisualize}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 16px',
            height: 38,
            borderRadius: 10,
            background: 'rgba(249, 111, 102, 0.08)',
            border: '1.5px solid var(--color-primary)',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(249, 111, 102, 0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(249, 111, 102, 0.08)'}
        >
          <svg style={{ width: 14, height: 14 }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
          <span className="hidden sm:inline">Visualize</span>
        </button>
      </div>
    </div>
  );

  return (
    <SimpleSection title="Activities" action={actions}>
      {sorted.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 12px' }}>No activities yet.</p>
      ) : (
        <>
          <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {preview.map((a, idx) => (
              <ActivityCard key={a.id || idx} activity={a} />
            ))}
          </div>
          {visibleCount < sorted.length && (
            <button
              onClick={() => setVisibleCount(prev => prev + 5)}
              style={{
                background: 'none',
                border: `1.5px solid var(--text-muted)`,
                borderRadius: 8,
                padding: '8px 16px',
                color: 'var(--text-muted)',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                marginTop: 8,
                width: '100%',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--text-muted)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              View More ({sorted.length - visibleCount} remaining)
            </button>
          )}
        </>
      )}
    </SimpleSection>
  );
}

// ─── MembersGroupsSection ─────────────────────────────────────
function MembersGroupsSection({ entity, allEntities, onRelationsChange }) {
  const isGroup = entity.type === 'group' || entity.kind === 'group';
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
  const editBtn = (
    <button
      onClick={() => setOverlayOpen(true)}
      title={`Edit ${listTitle}`}
      style={{
        background: 'none',
        border: 'none',
        padding: 4,
        color: 'var(--color-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.2)';
        e.currentTarget.style.opacity = '0.8';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.opacity = '1';
      }}
    >
      <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>
  );

  return (
    <>
      <SimpleSection title={listTitle} titleAction={editBtn}>
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
              variant="grid"
              selectedIds={selectedIds}
              onChange={handleOverlayToggle}
              bubbleColor={entity.color}
              filterType={isGroup ? 'people' : 'groups'}
            />
          </div>
        )}
      </SimpleSection>

      {console.log('EntityDetails overlay filterType:', isGroup ? 'people' : 'groups')}
      <SelectionOverlayFiltered
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        selectedIds={selectedIds}
        onToggle={handleOverlayToggle}
        filterType={isGroup ? 'people' : 'groups'}
        entities={Object.values(allEntities)}
      />
    </>
  );
}

// DELETED ViewAvailabilitySection - integrated into ActivitiesSection


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

        {/* ── Left: Avatar + Name + Groups/Members ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flexShrink: 0, width: 220 }}>
          <div style={{ position: 'relative' }}>
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
            <button
              onClick={() => setIsEditOpen(true)}
              title="Edit Profile"
              style={{
                position: 'absolute',
                top: -12,
                right: -12,
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--bg-raised)',
                border: `3px solid ${entity.color || 'var(--color-primary)'}`,
                color: entity.color || 'var(--color-primary)',
                cursor: 'pointer',
                fontSize: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                transition: 'all 0.2s ease',
                zIndex: 20
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              ✎
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="text-center" style={{ padding: '8px 22px', borderRadius: 9999, background: entity.color || 'var(--color-primary)', color: '#fff', fontFamily: 'inherit', fontWeight: 900, fontSize: 18, letterSpacing: '0.15em' }}>
              {entity.name}
            </div>
          </div>

          <div style={{ width: '100%' }}>
            <MembersGroupsSection
              entity={entity}
              allEntities={allEntities}
              onRelationsChange={updateRelations}
            />
          </div>
        </div>

        {/* ── Right: Activities ── */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <ActivitiesSection
            activities={activities}
            onSchedule={() => navigate('/activities/create')}
            entityId={entity._id}
            navigate={navigate}
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