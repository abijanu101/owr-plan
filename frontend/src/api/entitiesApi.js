// BACKEND: replace in-memory stubs with real API calls.
// `kind` is 'person' or 'group'.

let _store = [
  { id: 'p1', kind: 'person', name: 'ALIZEH', subtitle: 'MY COMFORT PERSON', emoji: '🧕', createdAt: Date.now() - 30000 },
  { id: 'p2', kind: 'person', name: 'EMAAN',  subtitle: 'My HOMIE.',         emoji: '👧', createdAt: Date.now() - 20000 },
  { id: 'p3', kind: 'person', name: 'ANSA',   subtitle: 'FIT CHECK PARTNER.',emoji: '👩', createdAt: Date.now() - 10000 },
  { id: 'g1', kind: 'group',  name: 'GALENTINES',  subtitle: '(Alizeh, Ansa, +5)', emoji: '💐', members: ['Alizeh','Ansa'], createdAt: Date.now() - 30000 },
  { id: 'g2', kind: 'group',  name: 'HAHA',        subtitle: '(Alizeh, Ansa, +2)', emoji: '🦊', members: ['Alizeh','Ansa'], createdAt: Date.now() - 20000 },
  { id: 'g3', kind: 'group',  name: 'WE BARE BEARS', subtitle: '(Eman, Zainab, +4)', emoji: '🐻‍❄️', members: ['Eman','Zainab'], createdAt: Date.now() - 10000 },
];

// BACKEND: GET /api/entities?kind=person|group
export async function listEntities(kind) { return _store.filter((e) => e.kind === kind); }

// BACKEND: POST /api/entities
export async function createEntity(data) {
  const item = { ...data, id: crypto.randomUUID(), createdAt: Date.now() };
  _store = [item, ..._store];
  return item;
}

// BACKEND: PUT /api/entities/:id
export async function updateEntity(id, data) {
  _store = _store.map((e) => (e.id === id ? { ...e, ...data, id } : e));
  return _store.find((e) => e.id === id);
}

// BACKEND: DELETE /api/entities  (bulk)
export async function deleteEntities(ids) {
  _store = _store.filter((e) => !ids.includes(e.id));
}

// BACKEND: POST /api/entities/duplicate
export async function duplicateEntities(ids) {
  const dupes = _store
    .filter((e) => ids.includes(e.id))
    .map((e) => ({ ...e, id: crypto.randomUUID(), name: `${e.name} (COPY)`, createdAt: Date.now() }));
  _store = [...dupes, ..._store];
  return dupes;
}
