import React from 'react';
import EntityCard from './EntityCard';

export default function EntityList({ title, items = [], onAdd, onRemove }) {
  return (
    <div className="w-full mt-6">
      {/* Custom hr-like border styling seen in image */}
      <div className="w-full h-[2px] bg-[var(--text-neutral)] mb-4 opacity-50 rounded-full" />
      
      <h2 className="text-2xl mb-4 text-[var(--text-neutral)] capitalize">{title}</h2>
      
      <div className="flex flex-wrap items-center">
        {items.map(item => (
          <EntityCard key={item._id} item={item} onRemove={onRemove} />
        ))}
        
        {/* Add Button */}
        {onAdd && (
          <button 
            onClick={onAdd}
            className="w-8 h-8 rounded-full border-2 border-[var(--text-neutral)] text-[var(--text-neutral)] flex items-center justify-center text-xl hover:bg-[var(--text-muted)] hover:text-white transition-colors mb-2 ml-1"
            title={`Add ${title}`}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
