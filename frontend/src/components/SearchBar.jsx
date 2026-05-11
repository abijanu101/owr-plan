export default function SearchBar({ value, onChange, placeholder = 'Search', onCreate, connected = false }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          className="input"
          style={{ 
            paddingRight: 40, 
            height: 52, 
            borderRadius: connected ? '0 20px 20px 20px' : 9999,
            background: 'var(--bg-raised)',
            border: '1.5px solid rgba(249, 111, 102, 0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <div style={{
          position: 'absolute', right: 16, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--color-primary)',
          pointerEvents: 'none',
          display: 'flex', alignItems: 'center'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
      </div>
      {onCreate && (
        <button
          type="button"
          onClick={onCreate}
          aria-label="Create"
          className="pulse"
          style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'var(--color-primary)', color: 'var(--bg-primary)',
            border: 'none', cursor: 'pointer', fontSize: 28, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 14px rgba(249, 111, 102, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05) rotate(90deg)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(249, 111, 102, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(249, 111, 102, 0.4)';
          }}
        >+</button>
      )}
    </div>
  );
}
