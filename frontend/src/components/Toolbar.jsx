import Dropdown from './UI/Dropdown';

const DuplicateIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const TrashIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export default function Toolbar({
  sortOptions, sortValue, onSortChange,
  filterValue, onFilterChange, filterOptions,
  selectedCount,
  onDuplicate, onDelete,
}) {
  const has = selectedCount > 0;

  const getBtnStyle = (type, isDisabled) => {
    const isDelete = type === 'delete';
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: isDisabled ? 'transparent' : 'rgba(249, 111, 102, 0.05)',
      color: isDisabled ? 'var(--text-muted)' : (isDelete ? '#ff5f5f' : 'var(--color-primary)'),
      border: `1.5px solid ${isDisabled ? 'var(--border-subtle)' : (isDelete ? 'rgba(255, 95, 95, 0.3)' : 'rgba(249, 111, 102, 0.3)')}`,
      borderRadius: '12px',
      padding: '8px 18px',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit',
      fontSize: '13px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: isDisabled ? 0.4 : 1,
      boxShadow: isDisabled ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
    };
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '4px 0' }}>
      {/* Left side - Action buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button 
          style={getBtnStyle('duplicate', !has)}
          onClick={has ? onDuplicate : undefined}
          disabled={!has}
          onMouseEnter={(e) => {
            if (!has) return;
            e.currentTarget.style.background = 'rgba(249, 111, 102, 0.15)';
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(249, 111, 102, 0.2)';
          }}
          onMouseLeave={(e) => {
            if (!has) return;
            e.currentTarget.style.background = 'rgba(249, 111, 102, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(249, 111, 102, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
        >
          <DuplicateIcon />
          <span>Duplicate</span>
        </button>

        <button 
          style={getBtnStyle('delete', !has)}
          onClick={has ? onDelete : undefined}
          disabled={!has}
          onMouseEnter={(e) => {
            if (!has) return;
            e.currentTarget.style.background = 'rgba(255, 95, 95, 0.15)';
            e.currentTarget.style.borderColor = '#ff5f5f';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 95, 95, 0.2)';
          }}
          onMouseLeave={(e) => {
            if (!has) return;
            e.currentTarget.style.background = 'rgba(249, 111, 102, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 95, 95, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
        >
          <TrashIcon />
          <span>Delete</span>
        </button>
      </div>

      {/* Right side - Sort */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Dropdown
          value={sortValue}
          onChange={onSortChange}
          options={sortOptions.map(o => ({ value: o.value, label: `Sort by: ${o.label}` }))}
          className="min-w-[190px]"
        />
      </div>
    </div>
  );
}