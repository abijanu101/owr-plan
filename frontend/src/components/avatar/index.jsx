import SvgLayer from "./SvgLayer";

const BASE_PATH = "/avatar/";

function toRelative(path) {
  if (!path) return null;
  return path.replace(/^\/avatar\//, "");
}

// Tints the baked-in #A35D5D PNG palette toward your app's coral #FF8370
const COLOR_FILTER = "saturate(2.2) brightness(1.35)";

// Shape → border-radius mapping
const SHAPE_RADIUS = {
  circle: "50%",
  rectangle: "0px",
  rounded: "20px",
  "rounded-sm": "8px",
  "rounded-lg": "32px",
};

/**
 * Avatar
 *
 * Props:
 *   face        — path to face SVG layer        e.g. "/avatar/face1.svg"
 *   accessories — array of accessory SVG paths  e.g. ["/avatar/crown.svg"]
 *   size        — number (px) or CSS string     default: 128
 *   isGroup     — boolean, base.svg → base-g.svg
 *   shape       — "circle" | "rectangle" | "rounded" | "rounded-sm" | "rounded-lg"
 *                 OR any raw CSS border-radius  default: "rounded"
 *   bgColor     — container background color    default: "#4C0E36"
 *   style       — extra styles on the container
 *   className   — extra class names
 */
export default function Avatar({
  face,
  accessories = [],
  size = 128,
  isGroup = false,
  shape = "rounded",
  bgColor = "#4C0E36",
  style = {},
  className = "",
}) {
  const base = isGroup ? "base-g.svg" : "base.svg";
  const borderRadius = SHAPE_RADIUS[shape] ?? shape;
  const resolvedSize = typeof size === "number" ? `${size}px` : size;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: resolvedSize,
        height: resolvedSize,
        backgroundColor: bgColor,
        borderRadius,
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      <SvgLayer src={`${BASE_PATH}${base}`} filter={COLOR_FILTER} />

      {face && (
        <SvgLayer
          src={`${BASE_PATH}${toRelative(face)}`}
          filter={COLOR_FILTER}
        />
      )}

      {accessories.map((acc) => (
        <SvgLayer
          key={acc}
          src={`${BASE_PATH}${toRelative(acc)}`}
          filter={COLOR_FILTER}
        />
      ))}
    </div>
  );
}
