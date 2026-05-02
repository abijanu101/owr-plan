export const DAYS = ['M', 'T', 'W', 'TH', 'F', 'SA', 'S'];

export default function DayPicker({ value = [], onChange, readOnly = false }) {
  const toggle = (d) => {
    if (readOnly) return;
    onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d]);
  };
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {DAYS.map((d) => (
        <span key={d} className="day" data-on={value.includes(d)} onClick={() => toggle(d)}>
          {d}
        </span>
      ))}
    </div>
  );
}
