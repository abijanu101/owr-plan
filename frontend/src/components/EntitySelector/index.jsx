import React, { useState } from 'react';
import EntityChip from './EntityChip';
import SelectionOverlay from './SelectionOverlay';

// Mock data for demo - in a real app this would come from a prop or context
const MOCK_ENTITIES = [
    { id: '1', name: 'Ahmed', type: 'person', color: '#5E5AB2' },
    { id: '2', name: 'Alizeh', type: 'person', color: '#B23B3B' },
    { id: '3', name: 'Zoha', type: 'person', color: '#488845' },
    { id: '4', name: 'Abi', type: 'person', color: '#1B7A7A' },
    { id: '5', name: 'Haleema', type: 'person', color: '#911B7D' },
    { id: 'g1', name: 'Section G', type: 'group', color: '#1B5491' },
    { id: 'g2', name: 'AML-6A', type: 'group', color: '#B29B3B' },
    { id: 'g3', name: 'owrplan gng', type: 'group', color: '#5E5AB2' },
];

export default function EntitySelector({ 
    selectedIds = [], 
    onChange, 
    variant = 'standalone',
    maxVisible = 4 
}) {
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);

    const handleToggle = (idOrArray) => {
        if (Array.isArray(idOrArray)) {
            onChange?.(idOrArray);
            return;
        }
        const newIds = selectedIds.includes(idOrArray)
            ? selectedIds.filter(i => i !== idOrArray)
            : [...selectedIds, idOrArray];
        onChange?.(newIds);
    };

    const selectedEntities = MOCK_ENTITIES.filter(e => selectedIds.includes(e.id));
    const visibleEntities = selectedEntities.slice(0, maxVisible);
    const remainingCount = Math.max(0, selectedEntities.length - maxVisible);

    return (
        <>
            <div 
                onClick={() => setIsOverlayOpen(true)}
                className={`
                    cursor-pointer transition-all duration-300 rounded-2xl
                    ${variant === 'table' ? 'p-2 border border-transparent hover:bg-white/5' : 'p-4 bg-black/20 border-2 border-dashed border-[var(--border-subtle)] hover:border-primary hover:bg-black/30'}
                    min-h-[60px] flex items-center
                `}
            >
                {selectedEntities.length === 0 ? (
                    <div className="w-full text-center text-muted italic font-medium tracking-wide py-2">
                        Click to choose entities
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3 items-center">
                        {visibleEntities.map(entity => (
                            <EntityChip 
                                key={entity.id}
                                name={entity.name}
                                color={entity.color}
                                isSelected={true}
                                isGroup={entity.type === 'group'}
                            />
                        ))}
                        {remainingCount > 0 && (
                            <span className="text-muted font-bold text-sm pl-2">
                                +{remainingCount} others
                            </span>
                        )}
                    </div>
                )}
            </div>

            <SelectionOverlay 
                isOpen={isOverlayOpen}
                onClose={() => setIsOverlayOpen(false)}
                selectedIds={selectedIds}
                onToggle={handleToggle}
                entities={MOCK_ENTITIES}
            />
        </>
    );
}
