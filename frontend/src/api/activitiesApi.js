// api/activitiesApi.js
let _store = [
  { 
    id: 'a1', title: 'Study Session', 
    emoji: '📚',
    timeRange: '2pm-4pm', 
    date: 'Expires: 30 May 2026',
    days: ['M', 'T', 'SA'], 
    participants: ['Alizeh', 'Ansa', 'Emaan', 'Zainab', 'Sara'], 
    color: '#f97766',
    createdAt: Date.now() - 30000 
  },
  { 
    id: 'a2', title: 'Park Picnic', 
    emoji: '🧺',
    timeRange: '1pm-4pm', 
    date: '12 March 2026',
    days: ['F', 'SA'], 
    participants: ['Alizeh', 'Ansa', 'Hira'], 
    color: '#ff6b8a',
    createdAt: Date.now() - 20000 
  },
  { 
    id: 'a3', title: 'Movie Night', 
    emoji: '🎬',
    timeRange: '12pm-3pm', 
    date: '30 May 2026',
    days: ['T'], 
    participants: ['Haleema', 'Emaan'], 
    color: '#ff85a2',
    createdAt: Date.now() - 10000 
  },
  { 
    id: 'a4', title: 'AI Lab', 
    emoji: '🤖',
    timeRange: '10am-12pm', 
    date: 'Every Monday',
    days: ['M'], 
    participants: ['Sara', 'Ahmed', 'Ali', 'Zainab'], 
    color: '#ff9eb5',
    createdAt: Date.now() - 5000 
  },
  { 
    id: 'a5', title: 'SE Workshop', 
    emoji: '💻',
    timeRange: '3pm-5pm', 
    date: 'Every Mon & Wed',
    days: ['M', 'W'], 
    participants: ['Ansa', 'Emaan', 'Hira'], 
    color: '#ffb3c6',
    createdAt: Date.now() - 2500 
  },
  { 
    id: 'a6', title: 'Trip to Hills', 
    emoji: '🏔️',
    timeRange: '05/03/26 - 08/03/26', 
    date: '5-8 March 2026',
    days: [], 
    participants: ['Alizeh', 'Ansa', 'Emaan', 'Zainab', 'Sara', 'Hira'], 
    color: '#f97766',
    createdAt: Date.now() - 1000 
  },
];

export async function listActivities() { return [..._store]; }

export async function createActivity(data) {
  const item = { ...data, id: crypto.randomUUID(), createdAt: Date.now() };
  _store = [item, ..._store];
  return item;
}

export async function updateActivity(id, data) {
  _store = _store.map((a) => (a.id === id ? { ...a, ...data, id } : a));
  return _store.find((a) => a.id === id);
}

export async function deleteActivities(ids) {
  _store = _store.filter((a) => !ids.includes(a.id));
}

export async function duplicateActivities(ids) {
  const dupes = _store
    .filter((a) => ids.includes(a.id))
    .map((a) => ({ ...a, id: crypto.randomUUID(), title: `${a.title} (copy)`, createdAt: Date.now() }));
  _store = [...dupes, ..._store];
  return dupes;
}