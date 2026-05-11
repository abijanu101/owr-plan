import { normalizeDates } from '../utils/dateUtils';
import { getActivitiesByEntity, updateActivity } from './activitiesApi';

const normalize = (data) => {
    if (Array.isArray(data)) {
        return data.map(e => ({ ...e, id: e._id || e.id }));
    }
    if (data && typeof data === 'object' && (data._id || data.id)) {
        return { ...data, id: data._id || data.id };
    }
    return data;
};

export const getEntity = async (id) => {
    try {
        const res = await fetch(`/api/entities/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Entity not found');
        const data = await res.json();
        return normalize(data);
    } catch (err) {
        console.error('Failed to get entity:', err);
        throw err;
    }
};

export const listEntities = async (kind) => {
  try {
    // 'all' → no type param, backend returns everything
    const url = kind === 'all' ? `/api/entities` : `/api/entities?type=${kind}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return normalize(data);
  } catch (err) {
    console.error('Failed to list entities:', err);
    return [];
  }
};

export const updateEntity = async (id, data) => {
    try {
        const normalized = normalizeDates(data);
        const res = await fetch(`/api/entities/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(normalized),
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

export const createEntity = async (data) => {
    try {
        const normalized = normalizeDates(data);
        const res = await fetch('/api/entities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(normalized),
            credentials: 'include'
        });
        const result = await res.json();
        return normalize(result);
    } catch (err) {
        console.error('Failed to create entity:', err);
        throw err;
    }
};

export const duplicateEntities = async (ids) => {
    try {
        const results = await Promise.all(ids.map(async (id) => {
            // 1. Get original
            const original = await getEntity(id);
            const { id: oldId, _id, createdAt, updatedAt, ...rest } = original;

            // 2. Prepare data for clone (mapping populated arrays back to IDs)
            const clonedData = {
                ...rest,
                name: `${original.name} Copy`,
                members: (original.members || []).map(m => m.id || m._id || m),
                groups: (original.groups || []).map(g => g.id || g._id || g)
            };

            // 3. Create new entity
            const cloned = await createEntity(clonedData);
            const newId = cloned.id;

            // 4. Sync Bidirectional Entity Relations
            // Update groups this person belongs to
            if (clonedData.groups && clonedData.groups.length > 0) {
                await Promise.all(clonedData.groups.map(async (groupId) => {
                    const group = await getEntity(groupId);
                    const newMembers = [...new Set([...(group.members || []).map(m => m.id || m._id || m), newId])];
                    await updateEntity(groupId, { members: newMembers });
                }));
            }
            // Update members of this group
            if (clonedData.members && clonedData.members.length > 0) {
                await Promise.all(clonedData.members.map(async (memberId) => {
                    const member = await getEntity(memberId);
                    const newGroups = [...new Set([...(member.groups || []).map(g => g.id || g._id || g), newId])];
                    await updateEntity(memberId, { groups: newGroups });
                }));
            }

            // 5. Sync Activity Involvement
            const activities = await getActivitiesByEntity(id);
            await Promise.all(activities.map(async (act) => {
                const actId = act.id || act._id;
                // Add new entity to activity's participants
                const newParticipants = [...new Set([...(act.participants || []).map(p => p.id || p._id || p), newId])];
                await updateActivity(actId, { participants: newParticipants });
            }));

            return cloned;
        }));
        return results;
    } catch (err) {
        console.error('Failed to duplicate entities:', err);
        throw err;
    }
};