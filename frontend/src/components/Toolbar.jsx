export default function Toolbar({
  sortOptions, sortValue, onSortChange,
  filterValue, onFilterChange, filterOptions,
  selectedCount,
  onDuplicate, onDelete,
}) {
  const has = selectedCount > 0;

  const btnStyle = {
    background: 'transparent',
    color: 'var(--text-neutral)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '9999px',
    padding: '6px 16px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      {/* Left side - Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {has && (
          <>
            <button 
              style={btnStyle}
              onClick={onDuplicate}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--bg-accent)';
                e.target.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'var(--border-subtle)';
              }}
            >
              ⎘ Copy
            </button>
            <button 
              style={btnStyle}
              onClick={onDelete}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--bg-accent)';
                e.target.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'var(--border-subtle)';
                
              }}
            >
              🗑 Delete
            </button>
          </>
        )}
      </div>

      {/* Right side - Sort */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <select
          style={btnStyle}
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>Sort by: {o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}