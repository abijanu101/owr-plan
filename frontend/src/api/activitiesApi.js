const OPTS = { credentials: 'include' };

export async function listActivities() {
  const response = await fetch('/api/activities', OPTS);
  if (!response.ok) throw new Error('Failed to fetch activities');
  const result = await response.json();
  return result.data || [];
}

export async function getActivitiesByEntity(entityId) {
  const response = await fetch(`/api/activities/entity/${entityId}`, OPTS);
  if (!response.ok) throw new Error('Failed to fetch activities for entity');
  const result = await response.json();
  return result.data || [];
}

export async function getActivity(id) {
  const response = await fetch(`/api/activities/${id}`, OPTS);
  if (!response.ok) throw new Error('Failed to fetch activity');
  const result = await response.json();
  return result.data?.activity || result.data;
}

export async function createActivity(data) {
  const response = await fetch('/api/activities', {
    ...OPTS,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create activity');
  }
  const result = await response.json();
  return result.data;
}

export async function updateActivity(id, data) {
  const response = await fetch(`/api/activities/${id}`, {
    ...OPTS,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update activity');
  const result = await response.json();
  return result.data;
}

export async function deleteActivities(ids) {
  await fetch('/api/activities/bulk', {
    ...OPTS,
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

export async function duplicateActivities(ids) {
  const response = await fetch('/api/activities/duplicate', {
    ...OPTS,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) throw new Error('Failed to duplicate activities');
  const result = await response.json();
  return result.data;
}
