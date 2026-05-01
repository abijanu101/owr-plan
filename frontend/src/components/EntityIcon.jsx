const avatarIcons = import.meta.glob('../assets/avatar/**/*.svg', {
    eager: true,
    query: '?url',
    import: 'default'
});

const buildIconMap = () => {
    return Object.entries(avatarIcons).reduce((map, [path, url]) => {
        const normalized = path.replace(/^\.\.\/assets\/avatar\//, '');
        const basename = normalized.split('/').pop();
        map[normalized] = url;
        if (basename) {
            map[basename] = url;
        }
        return map;
    }, {});
};

const iconMap = buildIconMap();
const baseUrl = iconMap['Base.svg'];

const getIconUrl = (filename) => {
    if (!filename) return null;
    const normalized = filename.replace(/^.*\/avatar\//, '').replace(/^\//, '');
    return iconMap[normalized] || iconMap[`${normalized}.svg`] || null;
};

export default function EntityIcon({ faceSvg = '', accessory = '', addons = [], size = 72, className = '' }) {
    const faceUrl = getIconUrl(faceSvg);
    const accessoryUrl = getIconUrl(accessory);
    const addonUrls = Array.isArray(addons)
        ? addons.map((name) => getIconUrl(name)).filter(Boolean)
        : [];
    const hasIcon = Boolean(faceUrl || accessoryUrl || addonUrls.length);

    return (
        <div
            className={`relative inline-flex items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-lg shadow-black/20 overflow-hidden ${className}`}
            style={{ width: size, height: size }}
        >
            {(!hasIcon || !baseUrl) && (
                <div className="flex h-full w-full items-center justify-center text-center px-3 text-[0.72rem] text-muted">
                    No icon
                </div>
            )}

            {baseUrl && (
                <img
                    src={baseUrl}
                    alt="avatar base"
                    className="absolute inset-0 h-full w-full object-contain"
                />
            )}

            {faceUrl && (
                <img
                    src={faceUrl}
                    alt="avatar face"
                    className="absolute inset-0 h-full w-full object-contain"
                />
            )}

            {accessoryUrl && (
                <img
                    src={accessoryUrl}
                    alt="avatar accessory"
                    className="absolute inset-0 h-full w-full object-contain"
                />
            )}

            {addonUrls.map((url, index) => (
                <img
                    key={index}
                    src={url}
                    alt={`avatar addon ${index + 1}`}
                    className="absolute inset-0 h-full w-full object-contain"
                />
            ))}

            <span className="absolute inset-0 rounded-full ring-1 ring-white/10" />
        </div>
    );
}
