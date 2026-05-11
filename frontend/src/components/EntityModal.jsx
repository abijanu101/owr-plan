import { useState, useEffect, useCallback, useRef } from "react";
import Avatar, { facesFor, accessoriesFor } from "./avatar";

/* ─── Color palettes ─────────────────────────────────────────── */
const LIGHT_COLORS = [
  // Reds
  "#ff4d6d",
  "#ff6b6b",

  // Oranges
  "#ff922b",
  "#ff7f50",

  // Yellows
  "#ffd43b",
  "#ffe066",

  // Greens
  "#69db7c",
  "#38d9a9",

  // Teals
  "#3bc9db",
  "#66d9e8",

  // Blues
  "#4dabf7",
  "#74c0fc",

  // Purples
  "#9775fa",
  "#b197fc",

  // Pinks
  "#f06595",
  "#ff8fab",

  // Extra vibrant shades
  "#f783ac",
  "#faa2c1"
];

const DARK_COLORS = [
  // Deep Reds
  "#c9184a",
  "#a4133c",

  // Deep Oranges
  "#d9480f",
  "#bc6c25",

  // Deep Yellows / Golds
  "#e09f3e",
  "#c99700",

  // Deep Greens
  "#2b9348",
  "#1b7f5a",

  // Deep Teals
  "#0f766e",
  "#006d77",

  // Deep Blues
  "#1d4ed8",
  "#1e3a8a",

  // Deep Purples
  "#6a00f4",
  "#7b2cbf",

  // Deep Pinks
  "#c2255c",
  "#9d174d",

  // Extra rich tones
  "#5f0f40",
  "#3a0ca3"
];

const DEFAULT_LIGHT_COLOR = LIGHT_COLORS[0];
const DEFAULT_DARK_COLOR  = DARK_COLORS[1]; // #4c0e36

/* ─── Carousel ───────────────────────────────────────────────── */
function Carousel({ src, onPrev, onNext, toggleBtn, label }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
      <div className="entity-modal-face-swiper">
        <button onClick={onPrev} className="entity-modal-arrow-btn">&#8249;</button>
        <div className="entity-modal-preview-box" style={{ position:"relative" }}>
          <img src={src} alt={label||""} />
          {toggleBtn && (
            <div style={{ position:"absolute", bottom:-10, right:-10 }}>{toggleBtn}</div>
          )}
        </div>
        <button onClick={onNext} className="entity-modal-arrow-btn">&#8250;</button>
      </div>
      {label && (
        <span style={{ fontSize:11, color:"var(--text-muted)", letterSpacing:"0.05em" }}>{label}</span>
      )}
    </div>
  );
}

/* ─── ColorGrid ─────────────────────────────────────────────── */
// Grid of color swatches + < > arrows to cycle. Changes name pill color only.
// Has its own dark/light toggle (independent of avatar theme toggle).
// Replace the two separate palettes + toggle with:
const ALL_COLORS = [...LIGHT_COLORS, ...DARK_COLORS]; // 32 swatches total

function ColorGrid({ current, onChange }) {
  const [page, setPage] = useState(0); // 0 = light page, 1 = dark page
  const palette = page === 0 ? LIGHT_COLORS : DARK_COLORS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {page === 0 ? "Light tones" : "Dark tones"}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setPage(0)} className="entity-modal-arrow-btn" disabled={page === 0}>&#8249;</button>
          <button onClick={() => setPage(1)} className="entity-modal-arrow-btn" disabled={page === 1}>&#8250;</button>
        </div>
      </div>
      <div className="entity-modal-color-grid">
        {palette.map(c => (
          <button key={c} onClick={() => onChange(c)} title={c}
            className={`entity-modal-color-btn ${current === c ? "active" : ""}`}
            style={{ backgroundColor: c }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Shells ─────────────────────────────────────────────────── */
function MobileShell({ onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="entity-modal"
        onClick={e=>e.stopPropagation()}
        style={{ display:"flex", flexDirection:"column", maxHeight:"92vh", overflow:"hidden" }}
      >
        {children}
      </div>
    </div>
  );
}

function DesktopShell({ onClose, borderColor, children }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:100 }}>
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        style={{
          position:"absolute", inset:0, width:"100%", height:"100%",
          background:"rgba(0,0,0,0.65)",
          backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
          border:"none", cursor:"pointer",
        }}
      />
      <div style={{
        position:"absolute", inset:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"24px 16px", pointerEvents:"none",
      }}>
        <div style={{
          pointerEvents:"auto", position:"relative",
          width:"min(660px,96vw)", maxHeight:"88vh",
          borderRadius:"2rem",
          background:"var(--bg-primary)",
          border:`4px solid ${borderColor||"var(--bg-accent)"}`,
          boxShadow:"0 25px 60px rgba(0,0,0,0.6)",
          display:"flex", flexDirection:"column", overflow:"hidden",
        }}>
          <button
            onClick={onClose}
            style={{
              position:"absolute", top:12, right:12,
              width:36, height:36, borderRadius:"50%",
              background:"var(--bg-accent)", color:"var(--text-neutral)",
              border:"none", cursor:"pointer", fontWeight:"bold", fontSize:16,
              display:"flex", alignItems:"center", justifyContent:"center", zIndex:10,
            }}
          >✕</button>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export default function EntityModal({
  isOpen,
  onClose,
  entityType = "person",
  editingEntity = null,
  onSuccess,
  // Optional: pass all existing names for uniqueness check
  existingNames = [],
}) {
  const isEditMode = Boolean(editingEntity);
  const isGroup    = (editingEntity?.type ?? entityType) === "group";

  // ── Theme toggle: controls avatar source folder ONLY ──
  const [theme, setTheme] = useState("dark");

  // ── Face/accessory lists come from the selected theme ──
  const faceList = facesFor(isGroup, theme);
  const accList  = accessoriesFor(isGroup, theme);

  // ── State ──
  const [tab,         setTab]         = useState("face");
  const [name,        setName]        = useState("");
  const [nameError,   setNameError]   = useState("");
  const [faceIndex,   setFaceIndex]   = useState(0);
  const [addonIndex,  setAddonIndex]  = useState(0);
  const [accessories, setAccessories] = useState([]);
  const [color,       setColor]       = useState(DEFAULT_LIGHT_COLOR);

  // ── Sync on open ──
  useEffect(() => {
    if (!isOpen) return;
    setTab("face");
    setAddonIndex(0);
    setNameError("");

    const initTheme = editingEntity?.theme || "dark";
    setTheme(initTheme);

    if (isEditMode && editingEntity) {
      setName(editingEntity.name ?? "");

      // Face stored as filename only (e.g. "happy.svg") or with old path
      const rawFace = (editingEntity.faceIcon || editingEntity.face || "")
        .replace(/^\/avatar\/(dark|light)\/face\//, "")
        .replace(/^\/avatar\/face\//, "")
        .replace(/^\/avatar\//, "")
        .split("/").pop();

      const fl = facesFor(isGroup, initTheme);
      const fIdx = fl.indexOf(rawFace);
      setFaceIndex(fIdx !== -1 ? fIdx : 0);

      const rawAcc = Array.isArray(editingEntity.accessories)
        ? editingEntity.accessories.map(a =>
            typeof a === "string" ? a.split("/").pop() : a
          )
        : [];
      setAccessories(rawAcc);
      setColor(editingEntity.color ?? (initTheme === "dark" ? DEFAULT_DARK_COLOR : DEFAULT_LIGHT_COLOR));
    } else {
      setName("");
      setFaceIndex(0);
      setAccessories([]);
      setColor(DEFAULT_LIGHT_COLOR);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditMode, editingEntity]);

  // When theme changes, clamp face index but preserve accessories (same filenames in both themes)
  useEffect(() => {
    const fl = facesFor(isGroup, theme);
    setFaceIndex(i => Math.min(i, Math.max(0, fl.length - 1)));
    // Don't reset accessories or addonIndex — both light/dark have same filenames
    // Color is independent of theme — don't reset it
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // ── Navigation ──
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

  // ── Name validation ──
  const handleNameChange = (val) => {
    if (val.length > 16) { setNameError("Max 16 characters"); return; }
    setName(val);
    if (!val.trim()) { setNameError("Name is required"); return; }
    const lower = val.trim().toLowerCase();
    const isDupe = existingNames.some(n =>
      n.toLowerCase() === lower && n !== editingEntity?.name
    );
    setNameError(isDupe ? "Name already taken" : "");
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!name.trim())   { setNameError("Name is required"); return; }
    if (nameError)      return;

    const currentFaceList = facesFor(isGroup, theme);
    const payload = {
      name:        name.trim(),
      type:        isGroup ? "group" : "person",
      theme,
      faceIcon:    currentFaceList[faceIndex] ?? "",
      accessories: (accessories || []).map(a => a.split("/").pop()),
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
          console.warn("Mock submit (no backend):", method, payload);
          onSuccess?.({ ...(editingEntity||{}), ...payload });
          onClose();
          return;
        }
        throw networkErr;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${res.status}`);
      }
      const data = await res.json();
      onSuccess?.(data);
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (!isOpen) return null;

  if (faceList.length === 0) {
    return (
      <DesktopShell onClose={onClose} borderColor={color}>
        <div style={{ padding:32, color:"var(--color-error)", textAlign:"center" }}>
          No face SVGs found in <code>/public/avatar/{theme}/face/</code>.<br/>
          Check that the files exist and Vite's glob pattern matches.
        </div>
      </DesktopShell>
    );
  }

  const isDesktop = window.innerWidth >= 768;

  /* ── Theme toggle button ── */
  const themeToggle = (
    <div style={{
      display:"flex", alignItems:"center", gap:8,
      padding: isDesktop ? "0 48px" : "0 16px",
      justifyContent:"flex-end",
      flexShrink:0,
    }}>
      <span style={{ fontSize:12, color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>
        {theme === "dark" ? "Dark" : "Light"}
      </span>
      <span
        onClick={() => setTheme(t => t==="dark" ? "light" : "dark")}
        style={{
          display:"inline-flex", width:44, height:24, borderRadius:9999,
          background: theme==="dark" ? "var(--color-primary)" : "var(--bg-accent)",
          border:"2px solid var(--text-muted)",
          position:"relative", transition:"background 0.2s",
          cursor:"pointer", flexShrink:0,
        }}
      >
        <span style={{
          position:"absolute", top:2,
          left: theme==="dark" ? 21 : 2,
          width:16, height:16, borderRadius:"50%",
          background: theme==="dark" ? "var(--bg-primary)" : "var(--text-muted)",
          transition:"left 0.2s",
        }} />
      </span>
    </div>
  );

  /* ── Name pill preview ── */
  const namePill = (
    <div style={{
      display:"inline-block",
      padding:"6px 22px",
      borderRadius:9999,
      background: color,
      color:"#fff",
      fontFamily:"inherit",
      fontWeight:900,
      fontSize:18,
      letterSpacing:"0.12em",
      boxShadow:`0 2px 12px ${color}66`,
      transition:"background 0.2s, box-shadow 0.2s",
      maxWidth:"100%",
      overflow:"hidden",
      textOverflow:"ellipsis",
      whiteSpace:"nowrap",
    }}>
      {name || (isEditMode ? "…" : "Name")}
    </div>
  );

  /* ── Avatar preview ── */
  // bgColor is the avatar card background — use a fixed dark color, NOT the name pill color
  const avatarNode = (
    <Avatar
      face={faceList[faceIndex]}
      accessories={accessories}
      theme={theme}
      size={isDesktop ? 190 : 130}
      isGroup={isGroup}
      bgColor="var(--bg-accent)"
      shape="rounded"
    />
  );

  /* ── Tab bar ── */
  const tabBar = (
    <div style={{ display:"flex", borderBottom:"2px solid var(--text-muted)", flexShrink:0 }}>
      {[{key:"face",label:"Face"},{key:"addons",label:"Add-ons"},{key:"color",label:"Color"}].map(t => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className="entity-modal-tab-btn"
          style={tab===t.key ? { color:"var(--color-primary)", borderBottom:"2px solid var(--color-primary)", marginBottom:-2 } : {}}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  const faceName  = faceList[faceIndex]?.split("/").pop() ?? "";
  const addonName = currentAddon?.split("/").pop() ?? "";

  const faceCarousel = (
    <Carousel
      src={`/avatar/${theme}/face/${faceList[faceIndex]}`}
      onPrev={prevFace} onNext={nextFace}
      label={`${faceIndex+1} / ${faceList.length}  •  ${faceName}`}
    />
  );

  const addonToggleBtn = accList.length > 0 ? (
    <button
      onClick={toggleAddon}
      style={{
        width:40, height:40, borderRadius:"50%",
        border:"2px solid var(--text-muted)", cursor:"pointer",
        fontWeight:"bold", fontSize:22,
        display:"flex", alignItems:"center", justifyContent:"center",
        background: isCurrentAddonActive ? "var(--color-primary)" : "var(--bg-accent)",
        color:      isCurrentAddonActive ? "var(--bg-primary)"    : "var(--text-neutral)",
        boxShadow:"0 2px 8px rgba(0,0,0,0.5)",
        transition:"background 0.15s", zIndex:20,
      }}
    >
      {isCurrentAddonActive ? "−" : "+"}
    </button>
  ) : null;

  const addonCarousel = accList.length === 0 ? (
    <p style={{ color:"var(--text-muted)", fontSize:13 }}>No accessories for {isGroup?"groups":"people"} in {theme} theme.</p>
  ) : (
    <Carousel
      src={`/avatar/${theme}/accessories/${currentAddon}`}
      onPrev={prevAddon} onNext={nextAddon}
      toggleBtn={addonToggleBtn}
      label={`${addonIndex+1} / ${accList.length}  •  ${addonName}`}
    />
  );

  const colorTab = (
    <ColorGrid current={color} onChange={setColor} />
  );

  /* ── Action buttons ── */
  const actionButtons = (
    <div style={{
      display:"flex", justifyContent:"center", gap:12,
      padding:"16px 24px", flexShrink:0,
      borderTop: isDesktop ? "1px solid var(--border-subtle)" : "none",
      background: isDesktop ? "var(--bg-primary)" : "transparent",
    }}>
      <button onClick={handleSubmit} className="btn-pill" data-active="true" style={{ minWidth:110 }}>
        {isEditMode ? "Save" : "Create"}
      </button>
      <button onClick={onClose} className="btn-pill" style={{ minWidth:110 }}>
        Cancel
      </button>
    </div>
  );

  /* ════════════ DESKTOP ════════════ */
  if (isDesktop) {
    return (
      <DesktopShell onClose={onClose} borderColor={color}>

        {/* Title */}
        <div style={{ textAlign:"center", padding:"20px 48px 0", color:"var(--color-primary)", fontWeight:700, fontSize:20, letterSpacing:"0.15em", textTransform:"uppercase", flexShrink:0 }}>
          {isEditMode ? "Edit Profile" : `Create ${isGroup?"Group":"Person"}`}
        </div>

        {/* Name input + pill preview */}
        <div style={{ padding:"10px 48px 0", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
          <input
            type="text"
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Name"
            maxLength={16}
            style={{
              width:"100%", textAlign:"center",
              background:"transparent", border:"none",
              borderBottom:"2px solid var(--text-muted)",
              color:"var(--text-neutral)", fontFamily:"inherit",
              fontSize:20, fontWeight:700, letterSpacing:"0.08em",
              outline:"none", padding:"6px 0",
            }}
          />
          {nameError && <span style={{ color:"var(--color-error)", fontSize:12 }}>{nameError}</span>}
          {namePill}
        </div>

        {/* Tabs */}
        <div style={{ padding:"14px 0 0", flexShrink:0 }}>{tabBar}</div>

        {/* Body: avatar left, tab content right */}
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr",
          alignItems:"center", justifyItems:"center",
          gap:24, padding:"24px 40px 24px",
          flex:1, minHeight:0, overflowY:"auto",
          background:"var(--bg-raised)",
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
            {avatarNode}
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", width:"100%", gap:12 }}>
            {/* Theme toggle — right under tab line, right-aligned */}
            <div style={{ width:"100%", display:"flex", justifyContent:"flex-end" }}>{themeToggle}</div>
            {tab==="face"   && faceCarousel}
            {tab==="addons" && addonCarousel}
            {tab==="color"  && (
              <div style={{ width:"100%", maxWidth:240, border:"2px solid var(--text-muted)", borderRadius:16, padding:"16px 14px", background:"var(--bg-primary)", boxSizing:"border-box" }}>
                {colorTab}
              </div>
            )}
          </div>
        </div>

        {actionButtons}
      </DesktopShell>
    );
  }

  /* ════════════ MOBILE ════════════ */
  return (
    <MobileShell onClose={onClose}>
      {/* Avatar + name pill */}
      <div className="entity-modal-preview" style={{ flexShrink:0, gap:8 }}>
        {avatarNode}
        {namePill}
        <input
          value={name}
          onChange={e => handleNameChange(e.target.value)}
          placeholder={isEditMode ? "" : "Name..."}
          maxLength={16}
          className="entity-modal-name-input"
        />
        {nameError && <span style={{ color:"var(--color-error)", fontSize:11 }}>{nameError}</span>}
      </div>

      {/* Tab bar */}
      <div style={{ flexShrink:0 }}>{tabBar}</div>

      {/* Tab content */}
      <div style={{
        flex:1, overflowY:"auto",
        padding:"12px 20px 8px",
        display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", gap:12, minHeight:0,
      }}>
        {/* Theme toggle — right under tab line */}
        <div style={{ width:"100%", display:"flex", justifyContent:"flex-end" }}>{themeToggle}</div>
        {tab==="face"   && faceCarousel}
        {tab==="addons" && addonCarousel}
        {tab==="color"  && (
          <div style={{ border:"2px solid var(--text-muted)", borderRadius:14, padding:"14px 12px", background:"var(--bg-primary)", width:"100%", boxSizing:"border-box" }}>
            {colorTab}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ flexShrink:0 }}>{actionButtons}</div>
    </MobileShell>
  );
}