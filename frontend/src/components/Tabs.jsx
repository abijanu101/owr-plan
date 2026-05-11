export default function Tabs({ tabs, value, onChange, variant = 'pill' }) {
  const isTab = variant === 'tab';
  return (
    <div style={{ display: 'flex', gap: isTab ? 0 : 8 }}>
      {tabs.map((t) => (
        <button
          key={t.value}
          className={isTab ? "tab-item" : "btn-pill"}
          data-active={value === t.value}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
