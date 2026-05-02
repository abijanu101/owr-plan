import React, { useState, useEffect } from 'react';
import EntityChip from './EntityChip';
import SelectionOverlay from './SelectionOverlay';
import { useAuth } from '../../context/AuthContext';

export default function EntitySelector({
    selectedIds = [],
    onChange,
    variant = 'standalone',
    maxVisible = 4
}) {
    const { user } = useAuth();
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const [entities, setEntities] = useState([]);
    const [loadingEntities, setLoadingEntities] = useState(false);

    useEffect(() => {
        if (!user?._id) return;
        const fetchEntities = async () => {
            setLoadingEntities(true);
            try {
                const res = await fetch(`/api/entities/user/${user._id}`, { credentials: 'include' });
                const data = await res.json();
                if (data.success) {
                    // Normalize fields: backend uses `faceIcon`, frontend chip uses `color`
                    setEntities((data.data?.entities || []).map(e => ({
                        id: e._id,
                        name: e.name,
                        type: e.type,
                        color: e.color || 'var(--color-primary)',
                    })));
                }
            } catch { /* keep empty */ }
            finally { setLoadingEntities(false); }
        };
        fetchEntities();
    }, [user?._id]);



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

    const selectedEntities = entities.filter(e => selectedIds.includes(e.id));
    const visibleEntities = selectedEntities.slice(0, maxVisible);
    const remainingCount = Math.max(0, selectedEntities.length - maxVisible);

    return (
        <>
            <div
                onClick={() => setIsOverlayOpen(true)}
                className={`
                    cursor-pointer transition-all duration-300 flex items-center
                    ${variant === 'table'
                        ? 'p-0 py-0 border border-transparent hover:bg-white/5 rounded-xl'
                        : 'w-full bg-[var(--bg-raised)] rounded-[2rem] p-4 sm:p-5 border border-[var(--border-subtle)] shadow-xl hover:bg-black/30 min-h-[80px]'}
                `}
            >
                {selectedEntities.length === 0 ? (
                    <div className="w-full text-center text-[#DC8379]/40 italic font-normal tracking-wide py-2 text-[16px] sm:text-[18px]" style={{ fontFamily: 'cursive' }}>
                        Click to choose entities
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2 w-full">
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
                            <span className="text-muted font-bold text-xs pl-1 self-center">
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
                entities={entities}
            />
        </>
    );
}
