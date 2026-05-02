export default function Tabs({ tabs, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {tabs.map((t) => (
        <button
          key={t.value}
          className="btn-pill"
          data-active={value === t.value}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
