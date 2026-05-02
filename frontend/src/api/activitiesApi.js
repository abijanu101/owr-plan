const API_BASE = 'http://localhost:5000/api';

export async function listActivities() {
  const response = await fetch(`${API_BASE}/activities`);
  if (!response.ok) throw new Error('Failed to fetch activities');
  const result = await response.json();
  return result.data || [];
}

export async function createActivity(data) {
  const response = await fetch(`${API_BASE}/activities`, {
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
  const response = await fetch(`${API_BASE}/activities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update activity');
  const result = await response.json();
  return result.data;
}

export async function deleteActivities(ids) {
  await fetch(`${API_BASE}/activities/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

export async function duplicateActivities(ids) {
  const response = await fetch(`${API_BASE}/activities/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) throw new Error('Failed to duplicate activities');
  const result = await response.json();
  return result.data;
}