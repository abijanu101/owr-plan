export default function Checkbox({ checked, onChange }) {
  return (
    <span
      role="checkbox"
      aria-checked={checked}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      style={{
        width: 18, height: 18, borderRadius: 999,
        border: '2px solid var(--text-muted)',
        background: checked ? 'var(--color-primary)' : 'transparent',
        display: 'inline-block', flexShrink: 0, cursor: 'pointer',
      }}
    />
  );
}
