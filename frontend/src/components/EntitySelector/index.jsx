import React, { useState, useEffect } from 'react';
import EntityChip from './EntityChip';
import SelectionOverlay from './SelectionOverlay';
import { useAuth } from '../../context/AuthContext';
import { listEntities } from '../../api/entitiesApi';

export default function EntitySelector({
    selectedIds = [],
    onChange,
    variant = 'standalone',
    maxVisible = 4,
    individualsOnly = false,
    bubbleColor = 'var(--color-primary)'
}) {
    const { user } = useAuth();
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [entities, setEntities] = useState([]);
    const [loadingEntities, setLoadingEntities] = useState(false);

    // If variant is inline, we only show 2 entities max
    const effectiveMaxVisible = variant === 'inline' ? 2 : maxVisible;

    useEffect(() => {
        if (!user?._id) return;
        const fetchEntities = async () => {
            setLoadingEntities(true);
            try {
                const data = await listEntities('all');

                if (Array.isArray(data)) {
                    setEntities(data.map(e => ({
                        id: String(e._id || e.id || ''),
                        name: e.name,
                        type: e.type || e.kind,
                        color: e.color || 'var(--color-primary)',
                        members: (e.members || []).map(m =>
                            String(m._id || m.id || m)
                        )
                    })));
                }
            } catch (err) {
                console.error("Failed to fetch entities:", err);
            }
            finally { setLoadingEntities(false); }
        };
        fetchEntities();
    }, [user?._id]);

    const handleToggle = (idOrArray) => {
        if (Array.isArray(idOrArray)) {
            let finalIds = idOrArray;
            if (individualsOnly) {
                // If individualsOnly, we should ensure no groups are in the array
                // and if they were meant to be shortcuts, they should have been resolved by the caller
                // but we'll safety filter here just in case.
                finalIds = idOrArray.filter(id => {
                    const ent = entities.find(e => e.id === id);
                    return ent?.type !== 'group';
                });
            }
            onChange?.(finalIds);
            return;
        }

        const entity = entities.find(e => e.id === idOrArray);

        if (individualsOnly && entity?.type === 'group') {
            const memberIds = entity.members || [];
            if (memberIds.length === 0) return;

            // Check if all members are currently selected
            const allSelected = memberIds.every(mid => selectedIds.includes(mid));

            let newIds;
            if (allSelected) {
                // Remove all members
                newIds = selectedIds.filter(id => !memberIds.includes(id));
            } else {
                // Add all members (avoid duplicates)
                newIds = [...new Set([...selectedIds, ...memberIds])];
            }
            onChange?.(newIds);
            return;
        }

        const newIds = selectedIds.includes(idOrArray)
            ? selectedIds.filter(i => i !== idOrArray)
            : [...selectedIds, idOrArray];

        // Final filter for individualsOnly
        const filteredIds = individualsOnly
            ? newIds.filter(id => entities.find(e => e.id === id)?.type !== 'group')
            : newIds;

        onChange?.(filteredIds);
    };

    const selectedEntities = entities.filter(e => selectedIds.includes(e.id));
    const visibleEntities = selectedEntities.slice(0, effectiveMaxVisible);
    const remainingCount = Math.max(0, selectedEntities.length - effectiveMaxVisible);

    const isInline = variant === 'inline';

    return (
        <>
            <div
                onClick={() => setIsOverlayOpen(true)}
                className={`
                    cursor-pointer transition-all duration-300 flex items-center
                    ${variant === 'table'
                        ? 'p-0 py-0 border border-transparent hover:bg-white/5 rounded-xl'
                        : isInline
                            ? 'flex-wrap gap-1.5'
                            : 'w-full bg-[var(--bg-raised)] rounded-[2rem] p-4 sm:p-5 border border-[var(--border-subtle)] shadow-xl hover:bg-black/30 min-h-[80px]'}
                `}
            >
                {selectedEntities.length === 0 ? (
                    !isInline && (
                        <div className="w-full text-center text-[#DC8379]/40 italic font-normal tracking-wide py-2 text-[16px] sm:text-[18px]" style={{ fontFamily: 'cursive' }}>
                            Click to choose entities
                        </div>
                    )
                ) : (
                    <div className={`flex ${isInline ? 'flex-nowrap overflow-hidden' : 'flex-wrap w-full'} gap-1.5 items-center`}>
                        {visibleEntities.map(entity => (
                            <EntityChip
                                key={entity.id}
                                name={entity.name}
                                color={entity.color}
                                isSelected={true}
                                isGroup={entity.type === 'group'}
                                small={isInline}
                            />
                        ))}
                        {remainingCount > 0 && (
                            <span
                                className={`font-semibold rounded-full border flex items-center justify-center flex-shrink-0 ${isInline ? 'text-[9px] px-1.5 py-0' : 'text-muted text-xs px-3 py-1'}`}
                                style={{
                                    color: bubbleColor,
                                    borderColor: `${bubbleColor}50`,
                                    background: isInline ? `${bubbleColor}15` : 'transparent'
                                }}
                            >
                                +{remainingCount}
                            </span>
                        )}
                    </div>
                )}
                {isInline && selectedEntities.length === 0 && (
                    <span className="text-[11px] text-muted italic">No entities</span>
                )}
            </div>

            <SelectionOverlay
                isOpen={isOverlayOpen}
                onClose={() => setIsOverlayOpen(false)}
                selectedIds={selectedIds}
                onToggle={handleToggle}
                entities={entities}
                individualsOnly={individualsOnly}
            />
        </>
    );
}
