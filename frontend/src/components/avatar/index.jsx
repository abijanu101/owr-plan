import SvgLayer from "./SvgLayer";

// ─── Theme-aware asset manifests (Vite import.meta.glob) ─────
// Reads all SVGs from both /public/avatar/dark/ and /public/avatar/light/
// at build time. Adding files is reflected on next dev restart.

const _darkFace  = import.meta.glob("/public/avatar/dark/face/*.svg",        { eager: true, query: "?url", import: "default" });
const _darkAcc   = import.meta.glob("/public/avatar/dark/accessories/*.svg", { eager: true, query: "?url", import: "default" });
const _lightFace = import.meta.glob("/public/avatar/light/face/*.svg",       { eager: true, query: "?url", import: "default" });
const _lightAcc  = import.meta.glob("/public/avatar/light/accessories/*.svg",{ eager: true, query: "?url", import: "default" });

function stripPublic(url) {
  return typeof url === "string" ? url.replace(/^\/public/, "") : url;
}

// Convert glob results → relative filenames only (e.g. "happy.svg")
function toFilenames(raw) {
  return Object.values(raw)
    .map(stripPublic)
    .map(u => u.split("/").pop())
    .sort();
}

const DARK_FACES  = toFilenames(_darkFace);
const DARK_ACC    = toFilenames(_darkAcc);
const LIGHT_FACES = toFilenames(_lightFace);
const LIGHT_ACC   = toFilenames(_lightAcc);

// Split by type: group files end in "-g.svg"
export const facesFor = (isGroup, theme = "dark") => {
  const all = theme === "light" ? LIGHT_FACES : DARK_FACES;
  return isGroup
    ? all.filter(f => f.endsWith("-g.svg"))
    : all.filter(f => !f.endsWith("-g.svg"));
};

export const accessoriesFor = (isGroup, theme = "dark") => {
  const all = theme === "light" ? LIGHT_ACC : DARK_ACC;
  return isGroup
    ? all.filter(f => f.endsWith("-g.svg"))
    : all.filter(f => !f.endsWith("-g.svg"));
};

// ─── Avatar component ─────────────────────────────────────────

const SHAPE_RADIUS = {
  circle:       "50%",
  rectangle:    "0px",
  rounded:      "20px",
  "rounded-sm": "8px",
  "rounded-lg": "32px",
};

const COLOR_FILTER = "saturate(2.2) brightness(1.35)";
const BUST = import.meta.env.DEV ? `?v=${Date.now()}` : "";

/**
 * Avatar
 *
 * Props:
 *   face        — filename only, e.g. "happy.svg"  (no path, no theme)
 *   accessories — array of filenames e.g. ["crown.svg"]
 *   theme       — "dark" | "light"          default: "dark"
 *   size        — number (px) or CSS string  default: 128
 *   isGroup     — boolean                   default: false
 *   shape       — "circle"|"rounded"|etc or raw CSS border-radius
 *   bgColor     — container background color
 *   style / className
 */
export default function Avatar({
  face,
  accessories = [],
  theme = "dark",
  size = 128,
  isGroup = false,
  shape = "rounded",
  bgColor = "#4C0E36",
  style = {},
  className = "",
}) {
  const base         = isGroup ? "base-g.svg" : "base.svg";
  const borderRadius = SHAPE_RADIUS[shape] ?? shape;
  const resolvedSize = typeof size === "number" ? `${size}px` : size;
  const themeBase    = `/avatar/${theme}`;

  // Helper: if a -g variant doesn't exist, fall back to non-g version
  const resolveFile = (folder, filename) => {
    if (!filename) return null;
    return `${themeBase}/${folder}/${filename}${BUST}`;
  };

  return (
    <div
      className={className}
      style={{
        position:        "relative",
        width:           resolvedSize,
        height:          resolvedSize,
        backgroundColor: bgColor,
        borderRadius,
        overflow:        "hidden",
        flexShrink:      0,
        // Outline matching the shape
        outline:         `3px solid ${bgColor}`,
        outlineOffset:   "2px",
        ...style,
      }}
    >
      {/* Layer 1: BG */}
      <SvgLayer src={`${themeBase}/bg.svg${BUST}`} filter={COLOR_FILTER} />

      {/* Layer 2: BASE */}
      <SvgLayer src={`${themeBase}/${base}${BUST}`} filter={COLOR_FILTER} />

      {/* Layer 3: FACE */}
      {face && <SvgLayer src={resolveFile("face", face)} filter={COLOR_FILTER} />}

      {/* Layer 4: ACCESSORIES */}
      {accessories.map(acc => (
        <SvgLayer key={acc} src={resolveFile("accessories", acc)} filter={COLOR_FILTER} />
      ))}
    </div>
  );
}