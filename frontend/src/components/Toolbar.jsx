import IconButton from './IconButton';

export default function Toolbar({
  sortOptions, sortValue, onSortChange,
  filterValue, onFilterChange, filterOptions,
  selectedCount,
  onDuplicate, onDelete, onEdit,
}) {
  const has = selectedCount > 0;
  const oneSelected = selectedCount === 1;

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
      <select
        className="btn-pill"
        value={sortValue}
        onChange={(e) => onSortChange(e.target.value)}
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>Sort by: {o.label}</option>
        ))}
      </select>

      {filterOptions && (
        <select
          className="btn-pill"
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          {filterOptions.map((o) => (
            <option key={o.value} value={o.value}>Filter: {o.label}</option>
          ))}
        </select>
      )}

      <IconButton label="Duplicate" onClick={onDuplicate} disabled={!has}>⎘</IconButton>
      <IconButton label="Delete" onClick={onDelete} disabled={!has}>🗑</IconButton>
      <IconButton label="Edit" onClick={onEdit} disabled={!oneSelected}>✎</IconButton>
    </div>
  );
}
