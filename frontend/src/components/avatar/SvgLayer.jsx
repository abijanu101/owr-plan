export default function SvgLayer({ src, filter }) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt=""
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        pointerEvents: "none",
        display: "block",
        ...(filter ? { filter } : {}),
      }}
    />
  );
}
