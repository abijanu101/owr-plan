import { useEffect, useState } from 'react';

// ── Local asset maps (Vite glob — no DB needed) ───────────────────────────────
const faceModules = import.meta.glob('../assets/avatar/face/*.svg', {
    eager: true,
    query: '?url',
    import: 'default'
});
const accessoryModules = import.meta.glob('../assets/avatar/accessories/*.svg', {
    eager: true,
    query: '?url',
    import: 'default'
});
const addonModules = import.meta.glob('../assets/avatar/addon/*.svg', {
    eager: true,
    query: '?url',
    import: 'default'
});
const baseUrl = new URL('../assets/avatar/Base.svg', import.meta.url).href;

const toList = (modules) =>
    Object.entries(modules)
        .map(([path, url]) => ({
            name: path.split('/').pop().replace('.svg', ''),
            filename: path.replace(/^\.\.\/assets\/avatar\//, ''),
            url,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

const FACES = toList(faceModules);
const ACCESSORIES = toList(accessoryModules);
const ADDONS = toList(addonModules);

const ArrowLeft = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const ArrowRight = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const TABS = ['Face', 'Accessory', 'Addons'];

export default function AddEntityModal({
    open,
    type,
    entityData,
    setEntityData,
    onCreate,
    onClose,
    error,
    existingEntities = [],
}) {
    const [activeTab, setActiveTab] = useState(0);
    const [faceIdx, setFaceIdx] = useState(0);
    const [accIdx, setAccIdx] = useState(0); // 0 = none
    const [checkedAddons, setChecked] = useState([]);
    const [nameError, setNameError] = useState('');

    useEffect(() => {
        if (!open) return;
        const defaultFaceIdx = FACES.findIndex((f) => f.name.toLowerCase() === 'happy');
        const startFace = defaultFaceIdx >= 0 ? defaultFaceIdx : 0;
        setFaceIdx(startFace);
        setAccIdx(0);
        setChecked([]);
        setActiveTab(0);
        setNameError('');
        setEntityData((prev) => ({
            ...prev,
            name: '',
            faceIcon: FACES[startFace]?.filename || '',
            accessory: '',
            addons: [],
        }));
    }, [open]);

    if (!open) return null;

    const goFace = (dir) => {
        const next = (faceIdx + dir + FACES.length) % FACES.length;
        setFaceIdx(next);
        setEntityData((prev) => ({ ...prev, faceIcon: FACES[next]?.filename || '' }));
    };

    const goAcc = (dir) => {
        const total = ACCESSORIES.length + 1;
        const next = (accIdx + dir + total) % total;
        setAccIdx(next);
        setEntityData((prev) => ({
            ...prev,
            accessory: next === 0 ? '' : ACCESSORIES[next - 1]?.filename || '',
        }));
    };

    const toggleAddon = (filename) => {
        setChecked((prev) => {
            const next = prev.includes(filename) ? prev.filter((f) => f !== filename) : [...prev, filename];
            setEntityData((ed) => ({ ...ed, addons: next }));
            return next;
        });
    };

    const previewFaceUrl = FACES[faceIdx]?.url || null;
    const previewAccessoryUrl = accIdx === 0 ? null : ACCESSORIES[accIdx - 1]?.url || null;
    const previewAddonUrls = ADDONS.filter((a) => checkedAddons.includes(a.filename)).map((a) => a.url);
    const currentFaceName = FACES[faceIdx]?.name || '';
    const currentAccName = accIdx === 0 ? 'None' : ACCESSORIES[accIdx - 1]?.name || '';

    const handleCreate = () => {
        const trimmed = entityData.name.trim();
        if (!trimmed) {
            setNameError('Name is required.');
            return;
        }
        const dupe = existingEntities.some(
            (e) =>
                e.type === type &&
                e.name.trim().toLowerCase() === trimmed.toLowerCase()
        );
        if (dupe) {
            setNameError(`A ${type} named "${trimmed}" already exists.`);
            return;
        }
        setNameError('');
        onCreate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#1a0d1a] shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Create {type}</p>
                        <h2 className="text-xl font-semibold text-white">
                            New {type === 'person' ? 'Person' : 'Group'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex min-h-0 flex-col sm:flex-row">
                    <div className="flex flex-col items-center justify-center gap-4 border-b border-white/10 bg-white/5 p-8 sm:w-56 sm:border-b-0 sm:border-r">
                        <div
                            className="relative overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-xl shadow-black/40"
                            style={{ width: 120, height: 120 }}
                        >
                            <img src={baseUrl} alt="base" className="absolute inset-0 h-full w-full object-contain" />
                            {previewFaceUrl && (
                                <img src={previewFaceUrl} alt="face" className="absolute inset-0 h-full w-full object-contain" />
                            )}
                            {previewAccessoryUrl && (
                                <img src={previewAccessoryUrl} alt="accessory" className="absolute inset-0 h-full w-full object-contain" />
                            )}
                            {previewAddonUrls.map((url, i) => (
                                <img key={i} src={url} alt={`addon-${i}`} className="absolute inset-0 h-full w-full object-contain" />
                            ))}
                            <span className="absolute inset-0 rounded-full ring-1 ring-white/10" />
                        </div>
                        <p className="text-center text-sm font-semibold text-white">
                            {entityData.name.trim() || <span className="text-white/25">Name…</span>}
                        </p>
                        <p className="text-xs uppercase tracking-widest text-white/30">{type}</p>
                    </div>

                    <div className="flex flex-1 flex-col overflow-y-auto">
                        <div className="border-b border-white/10 px-6 py-4">
                            <span className="text-xs uppercase tracking-widest text-white/40">Name</span>
                            <input
                                value={entityData.name}
                                onChange={(e) => {
                                    setEntityData({ ...entityData, name: e.target.value });
                                    setNameError('');
                                }}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 outline-none focus:border-pink-400/50 focus:bg-white/10 transition"
                                placeholder={type === 'person' ? 'Person name' : 'Group name'}
                            />
                            {nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
                        </div>

                        <div className="flex border-b border-white/10 px-6">
                            {TABS.map((tab, i) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(i)}
                                    className={`mr-4 border-b-2 py-3 text-sm font-medium transition ${
                                        activeTab === i
                                            ? 'border-pink-400 text-pink-300'
                                            : 'border-transparent text-white/40 hover:text-white/70'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 px-6 py-6">
                            {activeTab === 0 && (
                                <div className="flex flex-col items-center gap-4">
                                    <p className="text-xs uppercase tracking-widest text-white/40">Choose a face</p>
                                    <div className="flex items-center gap-6">
                                        <button
                                            type="button"
                                            onClick={() => goFace(-1)}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                                        >
                                            <ArrowLeft />
                                        </button>
                                        <div
                                            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                                            style={{ width: 90, height: 90 }}
                                        >
                                            <img src={baseUrl} alt="base" className="absolute inset-0 h-full w-full object-contain opacity-30" />
                                            {previewFaceUrl && (
                                                <img src={previewFaceUrl} alt={currentFaceName} className="absolute inset-0 h-full w-full object-contain" />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => goFace(1)}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                                        >
                                            <ArrowRight />
                                        </button>
                                    </div>
                                    <p className="text-sm font-medium capitalize text-white">{currentFaceName}</p>
                                    <div className="flex gap-2">
                                        {FACES.map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    setFaceIdx(i);
                                                    setEntityData((prev) => ({ ...prev, faceIcon: FACES[i]?.filename || '' }));
                                                }}
                                                className={`h-2 rounded-full transition-all ${
                                                    i === faceIdx ? 'w-5 bg-pink-400' : 'w-2 bg-white/20 hover:bg-white/40'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 1 && (
                                <div className="flex flex-col items-center gap-4">
                                    <p className="text-xs uppercase tracking-widest text-white/40">Choose an accessory</p>
                                    <div className="flex items-center gap-6">
                                        <button
                                            type="button"
                                            onClick={() => goAcc(-1)}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                                        >
                                            <ArrowLeft />
                                        </button>
                                        <div
                                            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                                            style={{ width: 90, height: 90 }}
                                        >
                                            <img src={baseUrl} alt="base" className="absolute inset-0 h-full w-full object-contain opacity-30" />
                                            {previewFaceUrl && (
                                                <img src={previewFaceUrl} alt="face" className="absolute inset-0 h-full w-full object-contain" />
                                            )}
                                            {previewAccessoryUrl && (
                                                <img src={previewAccessoryUrl} alt={currentAccName} className="absolute inset-0 h-full w-full object-contain" />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => goAcc(1)}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                                        >
                                            <ArrowRight />
                                        </button>
                                    </div>
                                    <p className="text-sm font-medium capitalize text-white">{currentAccName}</p>
                                    <div className="flex gap-2">
                                        {[null, ...ACCESSORIES].map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    setAccIdx(i);
                                                    setEntityData((prev) => ({
                                                        ...prev,
                                                        accessory: i === 0 ? '' : ACCESSORIES[i - 1]?.filename || '',
                                                    }));
                                                }}
                                                className={`h-2 rounded-full transition-all ${
                                                    i === accIdx ? 'w-5 bg-pink-400' : 'w-2 bg-white/20 hover:bg-white/40'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 2 && (
                                <div className="flex flex-col gap-3">
                                    <p className="text-xs uppercase tracking-widest text-white/40">Toggle addons — pick any combination</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {ADDONS.map((addon) => {
                                            const checked = checkedAddons.includes(addon.filename);
                                            return (
                                                <button
                                                    key={addon.filename}
                                                    type="button"
                                                    onClick={() => toggleAddon(addon.filename)}
                                                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                                                        checked
                                                            ? 'border-pink-400/50 bg-pink-400/10 text-white'
                                                            : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                                                    }`}
                                                >
                                                    <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition ${
                                                        checked ? 'border-pink-400 bg-pink-400' : 'border-white/20'
                                                    }`}>
                                                        {checked && (
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-white/10">
                                                        <img src={baseUrl} alt="" className="absolute inset-0 h-full w-full object-contain opacity-20" />
                                                        <img src={addon.url} alt={addon.name} className="absolute inset-0 h-full w-full object-contain" />
                                                    </div>
                                                    <span className="text-sm font-medium capitalize text-white">{addon.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-t border-white/10 px-6 py-4">
                    {error && <p className="flex-1 text-sm text-red-400">{error}</p>}
                    <div className="ml-auto flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/60 hover:bg-white/10 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="rounded-2xl bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 hover:bg-pink-600 transition"
                        >
                            Create {type === 'person' ? 'Person' : 'Group'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
