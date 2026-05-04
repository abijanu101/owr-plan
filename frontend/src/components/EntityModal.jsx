import { useState, useEffect, useCallback } from "react";
import Avatar from "./avatar";

/* ─── constants ─────────────────────────────────────────────── */

const FACES = [
  "face/happy.svg",
  "face/sassy.svg",
  "face/naughty.svg",
];

const FACES_GROUP = [
  "face/happy-g.svg",
  "face/sassy-g.svg",
  "face/naughty-g.svg",
];

const ACCESSORIES = [
  "accessories/crown.svg",
  "accessories/glasses.svg",
  "accessories/flower.svg",
  "accessories/blush.svg",
];

const ACCESSORIES_GROUP = [
  "accessories/glasses-g.svg",
];

const COLORS = [
  "#f97766", "#ff8a75", "#ff6b5a", "#ff7f6a", "#ff9a7a", "#ffad8a",
  "#ff8f70", "#f56c8b", "#ff7a9c", "#e85d75", "#ff9f43", "#ffa552",
  "#ffb36b", "#e85c4a", "#d94f3d", "#c94433",
];

const DEFAULT_COLOR = COLORS[0];
const DEFAULT_FACE  = "face/happy.svg";

/* ─── sub-components ────────────────────────────────────────── */

function Carousel({ src, onPrev, onNext, toggleBtn }) {
  return (
    // wrapper has padding-bottom so the + button never gets clipped
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div className="entity-modal-face-swiper">
        <button onClick={onPrev} className="entity-modal-arrow-btn">&#8249;</button>
        <div className="entity-modal-preview-box" style={{ position: "relative" }}>
          <img src={src} alt="" />
          {toggleBtn && (
            <div style={{ position: "absolute", bottom: -10, right: -10 }}>
              {toggleBtn}
            </div>
          )}
        </div>
        <button onClick={onNext} className="entity-modal-arrow-btn">&#8250;</button>
      </div>
    </div>
  );
}

const DARK_COLORS =
[
  "#200412", "#4c0e36", "#3a0b2a", "#1a040f",
  "#3b0d1a", "#4a1a1f", "#5a1f2a", "#34121a",
  "#3c0f0f", "#3a1410", "#1f0606", "#4a0f24",
  "#5c1a2f", "#1d050b", "#32101f",
  "#1f2a1e",
];
function ColorGrid({ colors, current, onChange }) {
  const [dark, setDark] = useState(false);
  const palette = dark ? DARK_COLORS : colors;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      {/* Dark mode toggle — pill checkbox, top-right */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
        <label style={{
          display: "flex", alignItems: "center", gap: 6,
          cursor: "pointer",
          color: "var(--text-muted)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          <span>Dark</span>
          {/* custom pill toggle */}
          <span
            onClick={() => setDark(d => !d)}
            style={{
              display: "inline-flex",
              width: 36, height: 20,
              borderRadius: 9999,
              background: dark ? "var(--color-primary)" : "var(--bg-accent)",
              border: "2px solid var(--text-muted)",
              position: "relative",
              transition: "background 0.2s",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <span style={{
              position: "absolute",
              top: 1, left: dark ? 17 : 1,
              width: 14, height: 14,
              borderRadius: "50%",
              background: dark ? "var(--bg-primary)" : "var(--text-muted)",
              transition: "left 0.2s",
            }} />
          </span>
        </label>
      </div>

      <div className="entity-modal-color-grid">
        {palette.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            title={c}
            className={`entity-modal-color-btn ${current === c ? "active" : ""}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── shells ─────────────────────────────────────────────────── */

function MobileShell({ onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="entity-modal" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function DesktopShell({ onClose, borderColor, children }) {
  return (
    // z-[100] puts this above the navbar (typically z-10–z-50)
    <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
      {/* blurred backdrop covers everything including navbar */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "none", cursor: "pointer",
        }}
      />

      {/* centred modal card */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px 16px",
        pointerEvents: "none",
      }}>
        <div
          style={{
            pointerEvents: "auto",
            position: "relative",
            width: "min(640px, 96vw)",
            maxHeight: "88vh",
            borderRadius: "2rem",
            background: "var(--bg-primary)",
            border: `4px solid ${borderColor || "var(--bg-accent)"}`,
            boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* ✕ close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 12, right: 12,
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--bg-accent)",
              color: "var(--text-neutral)",
              border: "none", cursor: "pointer",
              fontWeight: "bold", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 10,
            }}
          >
            ✕
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────── */

export default function EntityModal({
  isOpen,
  onClose,
  entityType = "person",
  editingEntity = null,
  onSuccess,
}) {
  const isEditMode = Boolean(editingEntity);
  const isGroup    = (editingEntity?.type ?? entityType) === "group";
  const faceList   = isGroup ? FACES_GROUP : FACES;
  const accList    = isGroup ? ACCESSORIES_GROUP : ACCESSORIES;

  const [tab,         setTab]         = useState("face");
  const [name,        setName]        = useState("");
  const [faceIndex,   setFaceIndex]   = useState(0);
  const [addonIndex,  setAddonIndex]  = useState(0);
  const [accessories, setAccessories] = useState([]);
  const [color,       setColor]       = useState(DEFAULT_COLOR);

  useEffect(() => {
    if (!isOpen) return;
    setTab("face");
    setAddonIndex(0);
    if (isEditMode && editingEntity) {
      setName(editingEntity.name ?? "");
      const raw  = editingEntity.faceIcon?.replace(/^\/avatar\//, "") ?? DEFAULT_FACE;
      const fIdx = faceList.indexOf(raw);
      setFaceIndex(fIdx !== -1 ? fIdx : 0);
      setAccessories(Array.isArray(editingEntity.accessories) ? editingEntity.accessories : []);
      setColor(editingEntity.color ?? DEFAULT_COLOR);
    } else {
      setName("");
      setFaceIndex(0);
      setAccessories([]);
      setColor(DEFAULT_COLOR);
    }
  }, [isOpen, isEditMode, editingEntity]);

  const prevFace  = () => setFaceIndex(i => (i - 1 + faceList.length) % faceList.length);
  const nextFace  = () => setFaceIndex(i => (i + 1) % faceList.length);
  const prevAddon = () => setAddonIndex(i => (i - 1 + accList.length) % accList.length);
  const nextAddon = () => setAddonIndex(i => (i + 1) % accList.length);

  const currentAddon         = accList[addonIndex];
  const isCurrentAddonActive = accessories.includes(currentAddon);

  const toggleAddon = useCallback(() => {
    setAccessories(prev =>
      prev.includes(currentAddon)
        ? prev.filter(a => a !== currentAddon)
        : [...prev, currentAddon]
    );
  }, [currentAddon]);

  const handleSubmit = async () => {
    const payload = {
      name,
      type:     isGroup ? "group" : "person",
      faceIcon: faceList[faceIndex],
      face:     faceList[faceIndex],
      accessories,
      color,
    };
    try {
      const url    = isEditMode ? `/api/entities/${editingEntity._id}` : "/api/entities";
      const method = isEditMode ? "PUT" : "POST";
      const token  = localStorage.getItem("token");
      let res;
      try {
        res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
      } catch (networkErr) {
        if (import.meta.env.MODE === "development") {
          console.log("Mock Submit (backend unreachable):", method, payload);
          onSuccess?.({ ...(editingEntity || {}), ...payload });
          onClose();
          return;
        }
        throw networkErr;
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Submission failed");
      }
      const data = await res.json();
      onSuccess?.(data);
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (!isOpen) return null;

  const isDesktop = window.innerWidth >= 768;

  /* ── shared pieces ── */

  const avatarNode = (
    <Avatar
      face={faceList[faceIndex]}
      accessories={accessories}
      size={isDesktop ? 190 : 140}
      isGroup={isGroup}
      bgColor={color}
      shape="rounded"
    />
  );

  // Tab bar — same visual for both layouts, just uses CSS class
  const tabBar = (
    <div style={{
      display: "flex",
      borderBottom: "2px solid var(--text-muted)",
      flexShrink: 0,
    }}>
      {[
        { key: "face",   label: "Face"    },
        { key: "addons", label: "Add-ons" },
        { key: "color",  label: "Color"   },
      ].map(t => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className="entity-modal-tab-btn"
          style={tab === t.key ? {
            color: "var(--color-primary)",
            borderBottom: "2px solid var(--color-primary)",
            marginBottom: -2,
          } : {}}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  const faceCarousel = (
    <Carousel src={`/avatar/${faceList[faceIndex]}`} onPrev={prevFace} onNext={nextFace} />
  );

  const addonToggleBtn = (
    <button
      onClick={toggleAddon}
      style={{
        width: 40, height: 40, borderRadius: "50%",
        border: "none", cursor: "pointer",
        fontWeight: "bold", fontSize: 22,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isCurrentAddonActive ? "var(--color-primary)" : "var(--bg-accent)",
        color: isCurrentAddonActive ? "var(--bg-primary)" : "var(--text-neutral)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        border: "2px solid var(--text-muted)",
        transition: "background 0.15s",
        zIndex: 20, 
      }}
    >
      {isCurrentAddonActive ? "−" : "+"}
    </button>
  );

  const addonCarousel = (
    <Carousel
      src={`/avatar/${currentAddon}`}
      onPrev={prevAddon}
      onNext={nextAddon}
      toggleBtn={addonToggleBtn}
    />
  );

  const colorGrid = (
    <ColorGrid colors={COLORS} current={color} onChange={setColor} />
  );

  /* ── action buttons — identical for both layouts ── */
  const actionButtons = (
    <div style={{
      display: "flex",
      justifyContent: "center",
      gap: 12,
      padding: "16px 24px",
      flexShrink: 0,
      borderTop: isDesktop ? "1px solid var(--border-subtle)" : "none",
      background: isDesktop ? "var(--bg-primary)" : "transparent",
    }}>
      <button
        onClick={handleSubmit}
        className="btn-pill"
        data-active="true"
        style={{ minWidth: 110 }}
      >
        {isEditMode ? "Save" : "Create"}
      </button>
      <button
        onClick={onClose}
        className="btn-pill"
        style={{ minWidth: 110 }}
      >
        Cancel
      </button>
    </div>
  );

  /* ════════════════════════════════════════
     DESKTOP render
     Left col: avatar (centred)
     Right col: carousel / color grid (centred)
  ════════════════════════════════════════ */
  if (isDesktop) {
    return (
      <DesktopShell onClose={onClose} borderColor={color}>

        {/* Title */}
        <div style={{
          textAlign: "center",
          padding: "20px 48px 0",
          color: "var(--color-primary)",
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          flexShrink: 0,
        }}>
          {isEditMode ? "Edit Profile" : `Create ${isGroup ? "Group" : "Person"}`}
        </div>

        {/* Name input */}
        <div style={{ padding: "12px 48px 0", flexShrink: 0 }}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
            style={{
              width: "100%",
              textAlign: "center",
              background: "transparent",
              border: "none",
              borderBottom: "2px solid var(--text-muted)",
              color: "var(--text-neutral)",
              fontFamily: "inherit",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.08em",
              outline: "none",
              padding: "8px 0",
            }}
          />
        </div>

        {/* Tabs */}
        <div style={{ padding: "16px 0 0", flexShrink: 0 }}>
          {tabBar}
        </div>

        {/* Body: two equal columns */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          justifyItems: "center",
          gap: 24,
          padding: "28px 40px 24px",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          background: "var(--bg-raised)",
        }}>
          {/* Left: live avatar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {avatarNode}
          </div>

          {/* Right: tab content */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}>
            {tab === "face"   && faceCarousel}
            {tab === "addons" && addonCarousel}
            {tab === "color"  && (
              // On desktop give the color grid a fixed width so it
              // centres cleanly in its column
              <div style={{ width: "100%", maxWidth: 220 }}>
                {colorGrid}
              </div>
            )}
          </div>
        </div>

        {actionButtons}
      </DesktopShell>
    );
  }

  /* ════════════════════════════════════════
     MOBILE render  (unchanged from original EntityModal)
  ════════════════════════════════════════ */
  return (
    <MobileShell onClose={onClose}>
      <div className="entity-modal-preview">
        {avatarNode}
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={isEditMode ? "" : "Name..."}
          className="entity-modal-name-input"
        />
      </div>

      {tabBar}

      <div className="entity-modal-tab-content">
        {tab === "face"   && faceCarousel}
        {tab === "addons" && addonCarousel}
        {tab === "color"  && colorGrid}
      </div>

      {actionButtons}
    </MobileShell>
  );
}