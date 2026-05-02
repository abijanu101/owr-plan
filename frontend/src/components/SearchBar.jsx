export default function SearchBar({ value, onChange, placeholder = 'Search', onCreate }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          className="input"
          style={{ paddingRight: 40, height: 48, borderRadius: 9999 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <span style={{
          position: 'absolute', right: 16, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}>▾</span>
      </div>
      {onCreate && (
        <button
          type="button"
          onClick={onCreate}
          aria-label="Create"
          style={{
            width: 44, height: 44, borderRadius: 9999,
            background: 'var(--color-primary)', color: 'var(--bg-primary)',
            border: 'none', cursor: 'pointer', fontSize: 22, fontWeight: 700,
          }}
        >+</button>
      )}
    </div>
  );
}
