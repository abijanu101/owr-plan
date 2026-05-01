import React, { useState, useEffect } from 'react';
import { clamp, cssFilterForColor, resolveToRgb, rgbToHex } from '../utils/cssColorFilter';

const FACES = [
  'face/happy.svg',
  'face/sassy.svg',
  'face/naughty.svg'
];

const ACCESSORIES = [
  'accessories/crown.svg',
  'accessories/flower.svg',
  'accessories/glasses.svg',
  'accessories/blush.svg'
];

const defaultValues = {
  name: "",
  type: "person",
  color: "var(--color-primary)",
  faceIcon: "face/happy.svg",
  accessories: []
};

function hsvToRgb(h, s, v) {
  // h: 0..360, s/v: 0..1
  const c = v * s;
  const hh = (h % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;

  if (hh >= 0 && hh < 1) [r1, g1, b1] = [c, x, 0];
  else if (hh >= 1 && hh < 2) [r1, g1, b1] = [x, c, 0];
  else if (hh >= 2 && hh < 3) [r1, g1, b1] = [0, c, x];
  else if (hh >= 3 && hh < 4) [r1, g1, b1] = [0, x, c];
  else if (hh >= 4 && hh < 5) [r1, g1, b1] = [x, 0, c];
  else[r1, g1, b1] = [c, 0, x];

  const m = v - c;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255)
  };
}

function ColorWheel({ value, onChange, size = 160 }) {
  const canvasRef = React.useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const pxSize = Math.floor(size * dpr);
    canvas.width = pxSize;
    canvas.height = pxSize;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const r = pxSize / 2;
    const img = ctx.createImageData(pxSize, pxSize);
    const data = img.data;

    // Flat wheel: hue by angle, saturation by radius, value fixed at 1.
    for (let y = 0; y < pxSize; y++) {
      for (let x = 0; x < pxSize; x++) {
        const dx = x - r;
        const dy = y - r;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idx = (y * pxSize + x) * 4;
        if (dist > r) {
          data[idx + 3] = 0;
          continue;
        }
        const sat = Math.min(dist / r, 1);
        const hue = (Math.atan2(dy, dx) * 180) / Math.PI + 180;
        const { r: rr, g: gg, b: bb } = hsvToRgb(hue, sat, 1);
        data[idx] = rr;
        data[idx + 1] = gg;
        data[idx + 2] = bb;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
  }, [size]);

  const getColorAtEvent = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left), 0, rect.width);
    const y = clamp((e.clientY - rect.top), 0, rect.height);
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > rect.width / 2) return null;
    const sat = Math.min(dist / (rect.width / 2), 1);
    const hue = (Math.atan2(dy, dx) * 180) / Math.PI + 180;
    const rgb = hsvToRgb(hue, sat, 1);
    return rgbToHex(rgb);
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    const next = getColorAtEvent(e);
    if (next) onChange(next);
    setIsDragging(true);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const next = getColorAtEvent(e);
    if (next) onChange(next);
  };

  const onPointerUp = () => setIsDragging(false);

  return (
    <div
      className="relative select-none touch-none"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full shadow-inner"
        onPointerDown={onPointerDown}
      />
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--bg-primary)] shadow-md" style={{ backgroundColor: value }} />
        <div className="text-xs text-[var(--bg-primary)] font-bold">{value}</div>
      </div>
    </div>
  );
}

function AvatarStack({ type, color, faceIcon, accessories }) {
  const isGroup = type === 'group';
  const filter = cssFilterForColor(color);

  const baseSrc = isGroup ? '/avatar/base-g.svg' : '/avatar/base.svg';
  const faceSrc = faceIcon
    ? `/avatar/${isGroup ? faceIcon.replace('.svg', '-g.svg') : faceIcon}`
    : null;

  const accSrcs = Array.isArray(accessories) ? accessories : [];

  return (
    <div
      className="w-full h-full rounded-[2rem] border-4 flex items-center justify-center overflow-hidden relative bg-white shadow-lg"
      style={{ borderColor: color || 'var(--text-muted)' }}
    >
      <div className="absolute inset-0" style={filter ? { filter } : undefined}>
        <img
          src={baseSrc}
          alt=""
          className="w-full h-full object-cover absolute top-0 left-0 z-0"
          draggable={false}
        />
        {faceSrc && (
          <img
            src={faceSrc}
            alt=""
            className="w-full h-full object-cover absolute top-0 left-0 z-10"
            draggable={false}
          />
        )}

        {accSrcs.map((acc, i) => (
          <img
            key={`${acc}-${i}`}
            src={`/avatar/${isGroup ? acc.replace('.svg', '-g.svg') : acc}`}
            alt=""
            className="w-full h-full object-cover absolute top-0 left-0 z-20"
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
}

export default function EditEntityModal({ isOpen, onClose, editingEntity, onSuccess }) {
  const [form, setForm] = useState(defaultValues);
  const [activeTab, setActiveTab] = useState('face'); // face, addons, color
  const [faceIndex, setFaceIndex] = useState(0);
  const [addonIndex, setAddonIndex] = useState(0);
  const [colorHex, setColorHex] = useState('#f97766');

  useEffect(() => {
    if (isOpen) {
      if (editingEntity) {
        setForm(editingEntity);

        // Find indexes if they exist
        const fIdx = FACES.indexOf(editingEntity.faceIcon);
        if (fIdx !== -1) setFaceIndex(fIdx);
      } else {
        setForm(defaultValues);
        setFaceIndex(0);
      }
      setAddonIndex(0);
      setActiveTab('face');

      const rgb = resolveToRgb((editingEntity?.color ?? defaultValues.color));
      if (rgb) setColorHex(rgbToHex(rgb));
    }
  }, [isOpen, editingEntity]);

  if (!isOpen) return null;

  const handleNextFace = () => {
    const newIdx = (faceIndex + 1) % FACES.length;
    setFaceIndex(newIdx);
    setForm({ ...form, faceIcon: FACES[newIdx] });
  };

  const handlePrevFace = () => {
    const newIdx = (faceIndex - 1 + FACES.length) % FACES.length;
    setFaceIndex(newIdx);
    setForm({ ...form, faceIcon: FACES[newIdx] });
  };

  const handleNextAddon = () => {
    setAddonIndex((addonIndex + 1) % ACCESSORIES.length);
  };

  const handlePrevAddon = () => {
    setAddonIndex((addonIndex - 1 + ACCESSORIES.length) % ACCESSORIES.length);
  };

  const toggleAddon = () => {
    const currentAddon = ACCESSORIES[addonIndex];
    if (form.accessories.includes(currentAddon)) {
      setForm({
        ...form,
        accessories: form.accessories.filter(a => a !== currentAddon)
      });
    } else {
      setForm({
        ...form,
        accessories: [...form.accessories, currentAddon]
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingEntity ? `/api/entities/${editingEntity._id}` : "/api/entities";
      const method = editingEntity ? "PUT" : "POST";

      const token = localStorage.getItem('token');
      let res;
      try {
        res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(form)
        });
      } catch (networkErr) {
        // Dev-mode fallback: if backend isn't reachable, allow mock submit for UI testing.
        if (import.meta.env.MODE === 'development') {
          console.log("Mock Submit (backend unreachable):", method, form);
          onSuccess({ ...(editingEntity || {}), ...form });
          onClose();
          return;
        }
        throw networkErr;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      const data = await res.json();
      onSuccess(data);
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const isCurrentAddonSelected = form.accessories.includes(ACCESSORIES[addonIndex]);
  const tintFilter = cssFilterForColor(form.color);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop (blur only the page behind) */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-md"
      />

      {/* Modal shell */}
      <div className="absolute inset-0 flex items-center justify-center px-4 py-6">
        <div
          className="entity-modal-shell w-full rounded-[2rem] bg-default overflow-hidden shadow-2xl relative border-4 flex flex-col"
          style={{ borderColor: form.color || 'var(--bg-accent)' }}
        >

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-accent text-neutral flex items-center justify-center font-bold z-10 shadow-lg hover:brightness-125 transition-all"
          >
            ✕
          </button>

          {/* Header */}
          <div className="shrink-0 text-center pt-6 pb-2 text-primary font-bold text-xl uppercase tracking-widest">
            {editingEntity ? "Edit Profile" : `Create ${form.type}`}
          </div>

          {/* Name Input */}
          <div className="shrink-0 px-8 pb-4">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="w-full text-center bg-transparent border-b-2 text-neutral border-[var(--border-subtle)] focus:outline-none focus:border-[var(--color-primary)] text-2xl py-2 font-cursive placeholder:text-muted"
            />
          </div>

          {/* Tabs Header */}
          <div className="shrink-0 flex w-full mt-2">
            {[
              { key: 'face', label: 'Face' },
              { key: 'addons', label: 'Add-ons' },
              { key: 'color', label: 'Color' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 font-bold text-sm tracking-widest uppercase transition-all
                ${activeTab === tab.key
                    ? 'bg-raised text-primary border-b-2 border-[var(--color-primary)]'
                    : 'bg-default text-muted hover:text-neutral'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="entity-modal-body bg-raised p-5 relative flex flex-col items-center flex-1 min-h-0 overflow-y-auto">

            {/* Main Avatar Preview */}
            <div className="w-56 h-56 mb-3 relative justify-self-end">
              <AvatarStack
                type={form.type}
                color={form.color}
                faceIcon={form.faceIcon}
                accessories={form.accessories}
              />
            </div>

            {/* Carousel Area based on Active Tab */}
            {activeTab === 'face' && (
              <div className="w-full max-w-[200px] h-32 bg-accent/40 rounded-xl relative flex items-center justify-center shadow-inner border border-[var(--border-subtle)]">
                <button onClick={handlePrevFace} className="absolute left-2 text-4xl text-neutral hover:text-primary hover:scale-110 font-bold opacity-70 hover:opacity-100 transition-all">&lt;</button>
                <img
                  src={`/avatar/${form.type === 'group' ? FACES[faceIndex].replace('.svg', '-g.svg') : FACES[faceIndex]}`}
                  className="w-24 h-24 object-contain"
                  alt="face selection"
                />
                <button onClick={handleNextFace} className="absolute right-2 text-4xl text-neutral hover:text-primary hover:scale-110 font-bold opacity-70 hover:opacity-100 transition-all">&gt;</button>
              </div>
            )}

            {activeTab === 'addons' && (
              <div className="w-full max-w-[200px] h-32 bg-accent/40 rounded-xl relative flex items-center justify-center shadow-inner border border-[var(--border-subtle)]">
                <button onClick={handlePrevAddon} className="absolute left-2 text-4xl text-neutral hover:text-primary hover:scale-110 font-bold opacity-70 hover:opacity-100 transition-all">&lt;</button>
                <img
                  src={`/avatar/${form.type === 'group' ? ACCESSORIES[addonIndex].replace('.svg', '-g.svg') : ACCESSORIES[addonIndex]}`}
                  className="w-24 h-24 object-contain"
                  alt="addon selection"
                />
                <button onClick={handleNextAddon} className="absolute right-2 text-4xl text-neutral hover:text-primary hover:scale-110 font-bold opacity-70 hover:opacity-100 transition-all">&gt;</button>

                {/* +/- Toggle Button */}
                <button
                  onClick={toggleAddon}
                  className={`absolute -bottom-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg transition-all
                  ${isCurrentAddonSelected
                      ? 'bg-primary text-[var(--bg-primary)]'
                      : 'bg-accent text-neutral hover:brightness-125'
                    }`}
                >
                  {isCurrentAddonSelected ? '−' : '+'}
                </button>
              </div>
            )}

            {activeTab === 'color' && (
              <div className="w-full max-w-[260px] bg-accent/40 rounded-xl p-4 shadow-inner border border-[var(--border-subtle)] flex flex-col items-center gap-3">
                <div className="text-muted font-bold text-xs tracking-widest uppercase">
                  Pick a Color
                </div>

                <ColorWheel
                  value={colorHex}
                  onChange={(next) => {
                    setColorHex(next);
                    setForm(prev => ({ ...prev, color: next }));
                  }}
                  size={160}
                />
              </div>
            )}

          </div>

          {/* Footer: Cancel + Save/Create */}
          <div className="shrink-0 bg-default px-6 py-4 flex flex-row flex-nowrap justify-center gap-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded-full border border-[var(--border-subtle)] text-muted hover:text-neutral hover:border-[var(--text-neutral)] transition-all font-bold tracking-widest uppercase text-sm"
            >
              {editingEntity ? 'Save' : 'Create'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full border border-[var(--border-subtle)] text-muted hover:text-neutral hover:border-[var(--text-neutral)] transition-all font-bold tracking-widest uppercase text-sm"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
