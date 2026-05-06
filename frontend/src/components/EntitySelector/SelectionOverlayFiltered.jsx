import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import EntityChip from './EntityChip';

export default function SelectionOverlayFiltered({ isOpen, onClose, selectedIds, onToggle, entities, People }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expanded, setExpanded] = useState(true);
    const [draggedItem, setDraggedItem] = useState(null);

    const filteredEntities = useMemo(() => {
        return entities.filter(e =>
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (People ? e.type === 'person' : e.type === 'group')
        );
    }, [entities, searchQuery, People]);

    const { selectedEntities, otherEntities } = useMemo(() => {
        const selected = filteredEntities.filter(e => selectedIds.includes(e.id));
        const others = filteredEntities.filter(e => !selectedIds.includes(e.id));
        return { selectedEntities: selected, otherEntities: others };
    }, [filteredEntities, selectedIds]);

    if (!isOpen) return null;

    const toggleSection = () => setExpanded(prev => !prev);

    // Single select‑all / deselect‑all for the whole filtered list
    const handleSelectAll = () => {
        if (filteredEntities.length === 0) return;
        // If there are any entities not selected → select them all
        if (otherEntities.length > 0) {
            const allIds = filteredEntities.map(e => e.id);
            const newIds = [...new Set([...selectedIds, ...allIds])];
            onToggle?.(newIds);
        } else {
            // Otherwise all are already selected → deselect all filtered entities
            const filteredIds = filteredEntities.map(e => e.id);
            const newIds = selectedIds.filter(id => !filteredIds.includes(id));
            onToggle?.(newIds);
        }
    };

    const handleDragStart = (e) => {
        setDraggedItem(0);
        e.dataTransfer.effectAllowed = 'move';
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleDragOver = (e) => e.preventDefault();

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
            <div
                className="relative z-50 w-full max-w-4xl h-fit max-h-[85vh] bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-[30px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                ref={(el) => {
                    if (el) {
                        const handler = (e) => {
                            if (e.target === el.parentElement) onClose();
                        };
                        el.parentElement.addEventListener('mousedown', handler);
                        return () => el.parentElement.removeEventListener('mousedown', handler);
                    }
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-6 text-[#DC8379]/40 hover:text-[#DC8379]/60 transition-all z-20"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="pt-6 pb-2 flex flex-col items-center">
                    <h2 className="text-[28px] sm:text-[42px] font-normal text-[#DC8379] tracking-normal text-center mb-2" style={{ fontFamily: 'cursive' }}>
                        Select {People ? 'People' : 'Groups'}
                    </h2>

                    {/* Search Bar */}
                    <div className="w-full max-w-sm px-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by Name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#1A030C] border-none rounded-full py-1.5 px-6 text-sm text-[#DC8379] focus:outline-none placeholder:text-[#DC8379]/30 italic"
                                style={{ fontFamily: 'cursive' }}
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[#DC8379]/60">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main List – Single Section */}
                <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar space-y-2 pb-6">
                    {filteredEntities.length === 0 && searchQuery ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-[#DC8379]/20 mb-6">
                                <svg className="w-50 h-50" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09V6l-1 1-1 1 1 1-1 1 1 1-1 1 1 1-1 1 1.5V21.35z opacity-50" transform="translate(-2 , 1)" />
                                    <path d="M12.5 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3c-1.74 0-3.41.81-4.5 2.09V6l-1 1-1 1 1 1-1 1 1 1-1 1 1 1-1 1 1.5V21.35z" transform="translate(2, -2) rotate(10)" />
                                </svg>
                            </div>
                            <h3 className="text-2xl text-[#DC8379] font-medium mb-2" style={{ fontFamily: 'cursive' }}>
                                No {People ? 'people' : 'groups'} found
                            </h3>
                            <p className="text-[#DC8379]/40 italic">Try a different name...</p>
                        </div>
                    ) : (
                        <div
                            className={`transition-all duration-300 rounded-[20px] border border-[#DC8379]/10 ${draggedItem === 0 ? 'opacity-30 scale-[0.98]' : ''}`}
                            onDragOver={handleDragOver}
                            onDragEnd={() => setDraggedItem(null)}
                        >
                            {/* Section Header */}
                            <div
                                className="flex items-center gap-4 px-4 py-2 relative cursor-pointer hover:bg-white/5 transition-colors rounded-t-[20px]"
                                onClick={toggleSection}
                            >
                                {/* Drag Handle */}
                                <div
                                    draggable
                                    onDragStart={(e) => {
                                        e.stopPropagation();
                                        handleDragStart(e);
                                    }}
                                    className="text-[#DC8379]/20 cursor-grab active:cursor-grabbing hover:text-[#DC8379]/40 transition-colors p-1"
                                >
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm0 4h2v2H8v-2zm6-8h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                                    </svg>
                                </div>

                                <h3 className="text-[18px] sm:text-[24px] font-normal text-[#DC8379] tracking-wide flex-1" style={{ fontFamily: 'cursive' }}>
                                    {People ? 'People' : 'Groups'}
                                </h3>

                                {/* ∀ Select All button - visible only when expanded (dropped down) */}
                                {expanded && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectAll();
                                        }}
                                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg border border-transparent transition-all active:border-white/40 active:scale-95 bg-[var(--color-primary)] hover:shadow-[0_0_15px_rgba(249,119,102,0.4)]"
                                        title="Select all / Deselect all"
                                    >
                                        <span className="text-lg font-bold leading-none">∀</span>
                                    </button>
                                )}

                                {/* Expand / Collapse Chevron */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSection();
                                    }}
                                    className="text-[#DC8379]/80 hover:text-[#DC8379] transition-all"
                                >
                                    <svg
                                        className={`w-10 h-10 fill-current transition-transform duration-300 ${expanded ? 'rotate-0' : '-rotate-90'}`}
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M7 10l5 5 5-5z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Section Content – only shown when expanded */}
                            {expanded && (
                                <div className="flex flex-col px-3 md:px-8 overflow-hidden transition-all duration-500 rounded-b-[20px] bg-black/20 pt-4 pb-8">
                                    {/* Added / Selected above the line */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-lg font-medium text-[#DC8379]/80">
                                                {People ? 'Added members' : 'Added in groups'}
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2 md:gap-3">
                                            {selectedEntities.length === 0 ? (
                                                <div className="text-[#DC8379]/40 italic text-sm">None added.</div>
                                            ) : (
                                                selectedEntities.map(entity => (
                                                    <EntityChip
                                                        key={entity.id}
                                                        name={entity.name}
                                                        color={entity.color}
                                                        isSelected={true}
                                                        isGroup={entity.type === 'group'}
                                                        onClick={() => {
                                                            const newIds = selectedIds.filter(id => id !== entity.id);
                                                            onToggle(newIds);
                                                        }}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Horizontal line */}
                                    <hr className="border-t border-[#DC8379]/30 my-4" />

                                    {/* Others below the line */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-lg font-medium text-[#DC8379]/80">
                                                Others
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2 md:gap-3">
                                            {otherEntities.length === 0 ? (
                                                <div className="flex flex-col items-center text-[#DC8379]/40 italic text-sm gap-2">
                                                    <span>All {People ? 'people' : 'groups'} are already added.</span>
                                                    <Link
                                                        to="/entities"
                                                        className="inline-block text-primary underline underline-offset-4 hover:text-primary/80 transition-colors not-italic font-bold"
                                                        onClick={onClose}
                                                    >
                                                        Manage {People ? 'People' : 'Groups'} →
                                                    </Link>
                                                </div>
                                            ) : (
                                                otherEntities.map(entity => (
                                                    <EntityChip
                                                        key={entity.id}
                                                        name={entity.name}
                                                        color={entity.color}
                                                        isSelected={false}
                                                        isGroup={entity.type === 'group'}
                                                        onClick={() => {
                                                            const newIds = [...selectedIds, entity.id];
                                                            onToggle(newIds);
                                                        }}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}