const API_URL = 'http://localhost:5000/api';

// Helper to get stored token
const getToken = () => localStorage.getItem('token');
const getUserId = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user)._id : null;
};

// Generic request function
const request = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
    return response.json();
};

// ========== AUTH ==========
export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
    }
    return data.data;
};

export const register = async (name, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
    }
    return data.data;
};

// ========== ENTITIES ==========
export const getEntities = async () => {
    const userId = getUserId();
    if (!userId) throw new Error('No user logged in');
    return request(`/entities/user/${userId}`);
};

export const createEntity = async (data) => {
    return request('/entities', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const updateEntity = async (id, data) => {
    return request(`/entities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

export const deleteEntity = async (id) => {
    return request(`/entities/${id}`, {
        method: 'DELETE'
    });
};

// Group members
export const addMemberToGroup = async (groupId, memberId) => {
    return request(`/entities/${groupId}/members`, {
        method: 'POST',
        body: JSON.stringify({ memberId })
    });
};

export const removeMemberFromGroup = async (groupId, memberId) => {
    return request(`/entities/${groupId}/members/${memberId}`, {
        method: 'DELETE'
    });
};

export const getGroupMembers = async (groupId) => {
    return request(`/entities/${groupId}/members`);
};

// ========== ACTIVITIES ==========
export const getActivitiesForEntity = async (entityId) => {
    return request(`/entities/${entityId}/activities`);
};

export const createActivity = async (data) => {
    const userId = getUserId();
    return request('/activities', {
        method: 'POST',
        body: JSON.stringify({ ...data, userId })
    });
};

export const getUserActivities = async () => {
    const userId = getUserId();
    return request(`/activities/user/${userId}`);
};

// ========== ICONS ==========
export const getIcons = async () => {
    return request('/icons');
};