import React from 'react';

export default function EntityCard({ item, type, onRemove }) {
  // `item` should have _id, name, color, etc.
  // Use its color if available, fallback to a default
  const bgColor = item.color || 'var(--color-primary)';

  return (
    <div 
      className="inline-flex items-center justify-between px-4 py-1 rounded-full mr-2 mb-2 text-white font-bold"
      style={{ backgroundColor: bgColor }}
    >
      <span className="mr-2 text-sm drop-shadow-md">{item.name}</span>
      {onRemove && (
        <button 
          onClick={() => onRemove(item._id)}
          className="text-white hover:text-red-200 focus:outline-none ml-1 drop-shadow-md"
          title="Remove"
        >
          &times;
        </button>
      )}
    </div>
  );
}
