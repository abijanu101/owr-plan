const normalize = (data) => {
    if (Array.isArray(data)) {
        return data.map(e => ({ ...e, id: e._id || e.id }));
    }
    if (data && typeof data === 'object' && (data._id || data.id)) {
        return { ...data, id: data._id || data.id };
    }
    return data;
};

export const listEntities = async (kind) => {
    try {
        const res = await fetch(`/api/entities?kind=${kind}`, { credentials: 'include' });
        if (!res.ok) return [];
        const data = await res.json();
        return normalize(data);
    } catch (err) {
        console.error('Failed to list entities:', err);
        return [];
    }
};