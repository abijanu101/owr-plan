// api/entitiesApi.js
// DUMMY/MOCK DATA - Replace with real API calls later

let _store = [
  // PEOPLE
  { 
    id: 'p1', kind: 'person', name: 'ALIZEH', 
    emoji: '🧕', 
    color: '#f97766',
    groups: ['GALENTINES', 'SQUAD GANG', 'BESTIES'],
    createdAt: Date.now() - 50000 
  },
  { 
    id: 'p2', kind: 'person', name: 'EMAAN', 
    emoji: '👧', 
    color: '#f97766',
    groups: ['GALENTINES', 'WE BARE BEARS', 'BESTIES', 'NIGHT OWLS'],
    createdAt: Date.now() - 40000 
  },
  { 
    id: 'p3', kind: 'person', name: 'ANSA', 
    emoji: '👩', 
    color: '#f97766',
    groups: ['GALENTINES', 'SQUAD GANG', 'NIGHT OWLS'],
    createdAt: Date.now() - 30000 
  },
  { 
    id: 'p4', kind: 'person', name: 'ZAINAB', 
    emoji: '👩‍🦰', 
    color: '#f97766',
    groups: ['GALENTINES', 'WE BARE BEARS', 'SQUAD GANG', 'BESTIES', 'NIGHT OWLS'],
    createdAt: Date.now() - 20000 
  },
  { 
    id: 'p5', kind: 'person', name: 'SARA', 
    emoji: '👩‍🦱', 
    color: '#f97766',
    groups: ['GALENTINES', 'SQUAD GANG', 'NIGHT OWLS'],
    createdAt: Date.now() - 10000 
  },

  // GROUPS
  { 
    id: 'g1', kind: 'group', name: 'GALENTINES', 
    emoji: '💐', 
    color: '#f97766', 
    members: ['Alizeh', 'Ansa', 'Emaan', 'Zainab', 'Sara', 'Hira', 'Noor'], 
    memberCount: 7, 
    createdAt: Date.now() - 20000 
  },
  { 
    id: 'g2', kind: 'group', name: 'WE BARE BEARS', 
    emoji: '🐻‍❄️', 
    color: '#f97766', 
    members: ['Emaan', 'Zainab', 'Ahmed', 'Ali'], 
    memberCount: 4, 
    createdAt: Date.now() - 15000 
  },
  { 
    id: 'g3', kind: 'group', name: 'SQUAD GANG', 
    emoji: '🔥', 
    color: '#f97766', 
    members: ['Ansa', 'Alizeh', 'Sara', 'Hira', 'Zainab'], 
    memberCount: 5, 
    createdAt: Date.now() - 10000 
  },
  { 
    id: 'g4', kind: 'group', name: 'BESTIES', 
    emoji: '💖', 
    color: '#f97766', 
    members: ['Emaan', 'Alizeh', 'Zainab'], 
    memberCount: 3, 
    createdAt: Date.now() - 5000 
  },
  { 
    id: 'g5', kind: 'group', name: 'NIGHT OWLS', 
    emoji: '🦉', 
    color: '#f97766', 
    members: ['Sara', 'Ansa', 'Hira', 'Emaan', 'Zainab', 'Ahmed'], 
    memberCount: 6, 
    createdAt: Date.now() - 2500 
  },
];

export async function listEntities(kind) {
  return _store.filter((e) => e.kind === kind);
}

export async function createEntity(data) {
  const item = { 
    ...data, 
    id: crypto.randomUUID(), 
    createdAt: Date.now() 
  };
  _store = [item, ..._store];
  return item;
}

export async function updateEntity(id, data) {
  _store = _store.map((e) => (e.id === id ? { ...e, ...data, id } : e));
  return _store.find((e) => e.id === id);
}

export async function deleteEntities(ids) {
  _store = _store.filter((e) => !ids.includes(e.id));
}

export async function duplicateEntities(ids) {
  const dupes = _store
    .filter((e) => ids.includes(e.id))
    .map((e) => ({ 
      ...e, 
      id: crypto.randomUUID(), 
      name: `${e.name} (COPY)`, 
      createdAt: Date.now() 
    }));
  _store = [...dupes, ..._store];
  return dupes;
}