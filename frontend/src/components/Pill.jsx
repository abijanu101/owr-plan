export default function Pill({ selected, onClick, children }) {
  return (
    <div className="pill" data-selected={selected} onClick={onClick}>
      {children}
    </div>
  );
}
