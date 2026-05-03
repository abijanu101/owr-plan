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

export const createEntity = async (data) => {
    try {
        const res = await fetch('/api/entities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        const result = await res.json();
        return normalize(result);
    } catch (err) {
        console.error('Failed to create entity:', err);
        throw err;
    }
};

export const updateEntity = async (id, data) => {
    try {
        const res = await fetch(`/api/entities/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        const result = await res.json();
        return normalize(result);
    } catch (err) {
        console.error('Failed to update entity:', err);
        throw err;
    }
};

export const deleteEntities = async (ids) => {
    try {
        // Bulk delete might need a specific endpoint or multiple calls
        // For now, assuming the backend supports a single DELETE with ID (not bulk)
        // or a bulk endpoint. Let's do one by one if not bulk.
        await Promise.all(ids.map(id => 
            fetch(`/api/entities/${id}`, { method: 'DELETE', credentials: 'include' })
        ));
    } catch (err) {
        console.error('Failed to delete entities:', err);
        throw err;
    }
};

export const duplicateEntities = async (ids) => {
    try {
        // Placeholder for duplication logic
        return [];
    } catch (err) {
        console.error('Failed to duplicate entities:', err);
        return [];
    }
};
