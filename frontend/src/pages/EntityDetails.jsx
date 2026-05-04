import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Avatar from '../components/avatar';
import EntityModal from '../components/EntityModal';
import EntityChip from '../components/EntitySelector/EntityChip';
import SelectionOverlay from '../components/EntitySelector/SelectionOverlay';
import Button from '../components/UI/Button';

// ─── Mock Data ────────────────────────────────────────────────
const MOCK_ENTITIES = {
  "123": {
    _id: "123", name: "Zoha", type: "person",
    color: "#f97766",
    face: "face/happy.svg",
    accessories: ["accessories/crown.svg"],
    groups: [{ _id: "678", name: "Dev Team", color: "#488845" }],
    members: [],
  },
  "456": {
    _id: "456", name: "Alizeh", type: "person",
    color: "#dc8379",
    face: "face/sassy.svg",
    accessories: [],
    groups: [{ _id: "678", name: "Dev Team", color: "#488845" }],
    members: [],
  },
  "678": {
    _id: "678", name: "Dev Team", type: "group",
    color: "#488845",
    face: "face/happy-g.svg",
    accessories: [],
    groups: [],
    members: [
      { _id: "123", name: "Zoha", color: "#f97766" },
      { _id: "456", name: "Alizeh", color: "#dc8379" },
    ],
  },
};

const MOCK_ACTIVITIES = [
  {
    _id: "a1", title: "Ca Class University",
    participants: ["123", "456"],
    slots: [
      { day: "Monday", startTime: "09:00 AM", endTime: "11:30 AM" },
      { day: "Monday", startTime: "02:00 PM", endTime: "03:30 PM" },
    ],
  },
  {
    _id: "a2", title: "Meeting",
    participants: ["123", "678"],
    slots: [{ day: "Monday", startTime: "04:00 PM", endTime: "05:00 PM" }],
  },
  {
    _id: "a3", title: "Gym Session",
    participants: ["456"],
    slots: [
      { day: "Monday", startTime: "06:00 AM", endTime: "07:30 AM" },
      { day: "Tuesday", startTime: "06:00 AM", endTime: "07:30 AM" },
    ],
  },
];

// All mock entities as a flat array for the SelectionOverlay
const ALL_MOCK_ENTITIES_LIST = Object.values(MOCK_ENTITIES).map(e => ({
  id: e._id,
  name: e.name,
  type: e.type,
  color: e.color,
}));

// ─── CollapsibleSection ───────────────────────────────────────
// Reusable collapsible section with a divider line, bold heading,
// and an animated inverted triangle toggle.
// The `action` prop lets you slot in a button (like +) next to the heading.
function CollapsibleSection({ title, children, defaultOpen = true, action }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 28 }}>
      {/* Divider line above heading */}
      <div style={{
        width: "100%", height: 1,
        background: "var(--text-muted)",
        opacity: 0.35,
        marginBottom: 10,
      }} />

      {/* Heading row: title + optional action + toggle arrow */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        marginBottom: open ? 14 : 0,
      }}>
        {/* Left: title + optional action (e.g. + button) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{
            color: "var(--color-primary)",
            fontFamily: "inherit",
            fontWeight: 900,
            fontSize: 18,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0,
          }}>
            {title}
          </h2>
          {/* + button slotted in next to heading */}
          {action}
        </div>

        {/* Right: triangle toggle */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 4, display: "flex", alignItems: "center",
          }}
        >
          <svg
            style={{
              width: 20, height: 20,
              color: "var(--text-muted)",
              transform: open ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.2s ease",
            }}
            fill="currentColor" viewBox="0 0 24 24"
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
      </div>

      {/* Collapsible content */}
      {open && children}
    </div>
  );
}

// ─── AddButton ───────────────────────────────────────────────
// Small circular + button placed next to section headings.
// Opens the SelectionOverlay to add members or groups.
function AddButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Add"
      style={{
        width: 24, height: 24,
        borderRadius: "50%",
        border: "2px solid var(--color-primary)",
        background: "none",
        color: "var(--color-primary)",
        fontFamily: "inherit",
        fontWeight: 900,
        fontSize: 16,
        lineHeight: 1,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "var(--color-primary)";
        e.currentTarget.style.color = "var(--bg-primary)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "none";
        e.currentTarget.style.color = "var(--color-primary)";
      }}
    >
      +
    </button>
  );
}

// ─── ActivityRow ──────────────────────────────────────────────
// A single activity card. Shows first slot inline; clicking the
// triangle expands all slots beneath a divider.
function ActivityRow({ activity }) {
  const [expanded, setExpanded] = useState(false);
  const slots = activity.slots || [];
  const firstSlot = slots[0];

  return (
    <div style={{
      borderRadius: 14,
      border: "1px solid var(--text-muted)",
      overflow: "hidden",
      marginBottom: 10,
    }}>
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(o => !o)}
        style={{
          width: "100%", background: "none", border: "none",
          cursor: "pointer", padding: "12px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span style={{
          color: "var(--text-neutral)",
          fontFamily: "inherit", fontWeight: 700,
          fontSize: 15, textAlign: "left",
        }}>
          {activity.title}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {firstSlot && (
            <div style={{
              textAlign: "right", color: "var(--text-muted)",
              fontSize: 12, lineHeight: 1.5, fontFamily: "inherit",
            }}>
              <div>{firstSlot.startTime} – {firstSlot.endTime}</div>
              <div>{firstSlot.day}</div>
              {slots.length > 1 && (
                <div style={{ color: "var(--color-primary)", fontSize: 11 }}>
                  +{slots.length - 1} more
                </div>
              )}
            </div>
          )}
          <svg
            style={{
              width: 18, height: 18, color: "var(--text-muted)",
              transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.2s ease", flexShrink: 0,
            }}
            fill="currentColor" viewBox="0 0 24 24"
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
      </button>

      {/* Expanded: all slots */}
      {expanded && (
        <div style={{
          borderTop: "1px solid var(--text-muted)",
          padding: "10px 16px",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          {slots.map((slot, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              color: "var(--text-muted)", fontSize: 13, fontFamily: "inherit",
            }}>
              <span style={{ fontWeight: 700 }}>{slot.day}</span>
              <span>{slot.startTime} – {slot.endTime}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function EntityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entity, setEntity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // SelectionOverlay state — tracks which items are selected
  // and which "mode" we're adding (members vs groups)
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorMode, setSelectorMode] = useState(null); // "members" | "groups"

  // ── Fetch entity + activities ──
  useEffect(() => {
    setLoading(true);
    const found = MOCK_ENTITIES[id];
    if (found) {
      setEntity(found);
      setActivities(MOCK_ACTIVITIES.filter(a => a.participants.includes(id)));
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('token');
    Promise.all([
      fetch(`/api/entities/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`/api/entities/${id}/activities`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
    ])
      .then(([entityData, activityData]) => {
        setEntity(entityData);
        setActivities(Array.isArray(activityData) ? activityData : []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Save from edit modal ──
  const handleSave = (saved) => setEntity(prev => ({ ...prev, ...saved }));

  // ── Open selector in the right mode ──
  const openSelector = (mode) => {
    setSelectorMode(mode);
    setSelectorOpen(true);
  };

  // ── Handle selection from overlay ──
  // The overlay calls onToggle with an array of selected IDs.
  // We find the full entity objects from MOCK_ENTITIES and patch
  // the entity's members or groups list.
  const handleSelectionChange = (newIds) => {
    if (!entity) return;
    const resolved = newIds.map(sid => {
      const e = MOCK_ENTITIES[sid];
      if (!e) return null;
      return { _id: e._id, name: e.name, color: e.color };
    }).filter(Boolean);

    if (selectorMode === "members") {
      setEntity(prev => ({ ...prev, members: resolved }));
    } else {
      setEntity(prev => ({ ...prev, groups: resolved }));
    }
  };

  // Current selected IDs for the overlay (pre-tick the already-added items)
  const currentSelectedIds = selectorMode === "members"
    ? (entity?.members || []).map(m => m._id)
    : (entity?.groups || []).map(g => g._id);

  // ── Loading / error states ──
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 32 }}>
      <div style={{ color: "var(--text-muted)", fontSize: 20, fontFamily: "inherit" }} className="animate-pulse">
        Loading...
      </div>
    </div>
  );

  if (error || !entity) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 32 }}>
      <div style={{ color: "var(--color-error)", fontSize: 18, fontFamily: "inherit" }}>
        {error || "Entity not found"}
      </div>
    </div>
  );

  const isGroup = entity.type === "group";
  const listItems = isGroup ? (entity.members || []) : (entity.groups || []);
  const listTitle = isGroup ? "Members" : "Groups";
  const selectorModeForSection = isGroup ? "members" : "groups";

  return (
    <div style={{
      width: "100%", minHeight: "100%",
      padding: "32px 24px", boxSizing: "border-box",
      overflowY: "auto",
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* ── Avatar + Name ── */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 16, marginBottom: 36,
        }}>
          <div style={{ position: "relative" }}>
            <Avatar
              face={entity.face}
              accessories={entity.accessories || []}
              color={entity.color}
              size={180}
              isGroup={isGroup}
              bgColor={entity.color + "22"}
              rounded="24px"
            />
            {/* Edit button overlaid on avatar corner */}
            <button
              onClick={() => setIsEditOpen(true)}
              title="Edit"
              style={{
                position: "absolute", bottom: 8, right: 8,
                width: 32, height: 32, borderRadius: "50%",
                background: "var(--bg-raised)",
                border: "2px solid var(--text-muted)",
                color: "var(--text-neutral)",
                cursor: "pointer", fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✎
            </button>
          </div>

          {/* Name badge */}
          <div style={{
            padding: "8px 28px", borderRadius: 9999,
            background: entity.color || "var(--color-primary)",
            color: "#fff", fontFamily: "inherit",
            fontWeight: 900, fontSize: 22,
            letterSpacing: "0.15em", textTransform: "uppercase",
            boxShadow: `0 4px 20px ${entity.color}55`,
          }}>
            {entity.name}
          </div>
        </div>

        {/* ── Groups / Members ── */}
        {/* 
          CollapsibleSection receives an `action` prop = the + button.
          Clicking + opens SelectionOverlay in the right mode.
          Items render as EntityChip (your existing component) — 
          isSelected=true so they show the filled chip style,
          and clicking navigates to that entity's details page.
        */}
        <CollapsibleSection
          title={listTitle}
          defaultOpen={true}
          action={
            <AddButton onClick={() => openSelector(selectorModeForSection)} />
          }
        >
          {listItems.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontFamily: "inherit", fontSize: 13, margin: 0 }}>
              No {listTitle.toLowerCase()} yet. Hit + to add.
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {listItems.map(item => (
                <EntityChip
                  key={item._id}
                  name={item.name}
                  color={item.color}
                  isSelected={true}
                  isGroup={isGroup}
                  onClick={() => navigate(`/entities/${item._id}`)}
                />
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* ── Activities ── */}
        {/*
          Activities filtered from MOCK_ACTIVITIES by participant ID.
          "Schedule New Activity" uses your existing Button component
          from components/UI/Button.jsx — no custom inline button.
        */}
        <CollapsibleSection title="Activities" defaultOpen={true}>
          {activities.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontFamily: "inherit", fontSize: 13, margin: "0 0 12px" }}>
              No activities yet.
            </p>
          ) : (
            <div style={{ marginBottom: 12 }}>
              {activities.map(a => (
                <ActivityRow key={a._id} activity={a} />
              ))}
            </div>
          )}

          {/* Uses your reusable Button component */}
          <Button
            onClick={() => navigate('/activities/create')}
            variant="outline"
          >
            + Schedule New Activity
          </Button>
        </CollapsibleSection>

      </div>

      {/* ── Edit Modal ── */}
      <EntityModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        mode="edit"
        entityType={entity.type}
        initial={{
          name: entity.name,
          face: entity.face,
          accessories: entity.accessories || [],
          color: entity.color,
        }}
        onSave={handleSave}
      />

      {/* ── Selection Overlay ── */}
      {/*
        SelectionOverlay is a portal that renders over everything.
        We pass ALL_MOCK_ENTITIES_LIST as the entities pool.
        currentSelectedIds pre-ticks whatever is already in the list.
        onToggle receives a new array of IDs and we resolve them
        back to full objects to update entity state.
      */}
      <SelectionOverlay
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        selectedIds={currentSelectedIds}
        onToggle={handleSelectionChange}
        entities={ALL_MOCK_ENTITIES_LIST}
      />
    </div>
  );
}
