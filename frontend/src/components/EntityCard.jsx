import EntityIcon from './EntityIcon';

export default function EntityCard({ entity, onClick, selected = false }) {
    const faceSvg = entity.faceIcon?.filename || '';
    const accessory = entity.accessory?.filename || entity.accessory || '';
    const addonSvgs = Array.isArray(entity.addons)
        ? entity.addons.map((addon) => addon.filename || addon)
        : [];

    const metaLabel = entity.type === 'group' ? 'Group' : 'Person';
    const countLabel = entity.type === 'group'
        ? `${entity.members?.length || 0} member${entity.members?.length === 1 ? '' : 's'}`
        : `${entity.members?.length || 0} group${entity.members?.length === 1 ? '' : 's'}`;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`entity-card group w-full text-left rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10 transition-transform duration-200 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/10 ${selected ? 'ring-2 ring-blue-400/40' : ''}`}
        >
            <div className="flex items-center gap-4">
                <EntityIcon faceSvg={faceSvg} accessory={accessory} addons={addonSvgs} size={72} />
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-blue-200">
                            {metaLabel}
                        </span>
                        <span className="text-xs text-muted">{countLabel}</span>
                    </div>
                    <h3 className="truncate text-lg font-semibold text-white">{entity.name || 'Untitled'}</h3>
                </div>
            </div>
        </button>
    );
}
