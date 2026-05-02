import { useEffect, useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import Tabs from '../components/Tabs';
import Toolbar from '../components/Toolbar';
import Modal from '../components/Modal';
import EntityList from '../components/EntityList1';
import EntityForm from '../components/EntityForm';
import {
  listEntities, createEntity, updateEntity,
  deleteEntities, duplicateEntities,
} from '../api/entitiesApi';

const SORT = [
  { value: 'recent', label: 'Recently added' },
  { value: 'name',   label: 'Name (A–Z)' },
];

export default function EntitiesPage() {
  const [tab, setTab] = useState('person'); // 'person' | 'group'
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('recent');
  const [selected, setSelected] = useState(new Set());
  const [editor, setEditor] = useState({ open: false, draft: null });

  // BACKEND: replace with real GET request, filter on server if needed
  useEffect(() => { listEntities(tab).then(setItems); setSelected(new Set()); }, [tab]);

  const visible = useMemo(() => {
    const arr = items.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
    return [...arr].sort((a, b) =>
      sortKey === 'name' ? a.name.localeCompare(b.name) : b.createdAt - a.createdAt);
  }, [items, search, sortKey]);

  const toggleSelect = (id) => setSelected((p) => {
    const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const openCreate = () => setEditor({ open: true, draft: null });
  const openEdit = () => {
    if (selected.size !== 1) return;
    const id = [...selected][0];
    setEditor({ open: true, draft: items.find((i) => i.id === id) });
  };

  const onSubmit = async (data) => {
    if (editor.draft) {
      // BACKEND: PUT /api/entities/:id
      const updated = await updateEntity(editor.draft.id, data);
      setItems((p) => p.map((i) => (i.id === updated.id ? updated : i)));
    } else {
      // BACKEND: POST /api/entities  (then redirect to C8/C9 if needed)
      const created = await createEntity({ ...data, kind: tab });
      setItems((p) => [created, ...p]);
    }
    setEditor({ open: false, draft: null });
    setSelected(new Set());
  };

  const onDelete = async () => {
    const ids = [...selected];
    // BACKEND: DELETE /api/entities (bulk)
    await deleteEntities(ids);
    setItems((p) => p.filter((i) => !selected.has(i.id)));
    setSelected(new Set());
  };

  const onDuplicate = async () => {
    const ids = [...selected];
    // BACKEND: POST /api/entities/duplicate
    const dupes = await duplicateEntities(ids);
    setItems((p) => [...dupes, ...p]);
    setSelected(new Set());
  };

  return (
    <div className="stage">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 960, margin: '0 auto' }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search Group or People"
          onCreate={openCreate}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs
            tabs={[{ value: 'person', label: 'People' }, { value: 'group', label: 'Groups' }]}
            value={tab}
            onChange={setTab}
          />
        </div>
        <Toolbar
          sortOptions={SORT} sortValue={sortKey} onSortChange={setSortKey}
          selectedCount={selected.size}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onEdit={openEdit}
        />
        <EntityList
          items={visible}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          emptyLabel={`No ${tab === 'person' ? 'people' : 'groups'} yet.`}
        />
      </div>

      <Modal
        open={editor.open}
        title={`${editor.draft ? 'Edit' : 'Create'} ${tab}`}
        onClose={() => setEditor({ open: false, draft: null })}
        footer={
          <>
            <button className="btn-pill" onClick={() => setEditor({ open: false, draft: null })}>Cancel</button>
            <button className="btn-pill" data-active="true" form="entity-form" type="submit">Save</button>
          </>
        }
      >
        <EntityForm initial={editor.draft} kind={tab} onSubmit={onSubmit} />
      </Modal>
    </div>
  );
}