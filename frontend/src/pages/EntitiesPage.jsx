import { useEffect, useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import Tabs from '../components/Tabs';
import Toolbar from '../components/Toolbar';
import EntityList from '../components/EntityList';
import EntityModal from '../components/EntityModal';
import Toast from '../components/UI/Toast';
import { listEntities, deleteEntities, duplicateEntities, updateEntity } from '../api/entitiesApi';

const SORT = [
  { value: 'recent', label: 'Recently added' },
  { value: 'name', label: 'Name (A–Z)' },
];

// Tab definitions — 'all' fetches both types and merges
const TABS = [
  { value: 'person', label: 'People' },
  { value: 'group', label: 'Groups' },
  { value: 'all', label: 'All' },
];

export default function EntitiesPage() {
  const [tab, setTab] = useState('person');
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('recent');
  const [selected, setSelected] = useState(new Set());
  const [editor, setEditor] = useState({ open: false, draft: null });
  const [toastConfig, setToastConfig] = useState(null);
  // ── Fetch ──
  useEffect(() => {
    setSelected(new Set());

    if (tab === 'all') {
      // Fetch both types concurrently and merge
      Promise.all([listEntities('person'), listEntities('group')])
        .then(([people, groups]) => setItems([...people, ...groups]));
    } else {
      listEntities(tab).then(setItems);
    }
  }, [tab]);

  // ── Filtered + sorted list ──
  const visible = useMemo(() => {
    return items
      .filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) =>
        sortKey === 'name'
          ? a.name.localeCompare(b.name)
          : (b.createdAt || 0) - (a.createdAt || 0)
      );
  }, [items, search, sortKey]);

  // ── Selection ──
  const toggleSelect = (id) => {
    setSelected(p => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // ── Modal ──
  const openCreate = () => setEditor({ open: true, draft: null });

  const openEdit = () => {
    if (selected.size !== 1) return;
    const id = [...selected][0];
    setEditor({ open: true, draft: items.find(i => (i.id || i._id) === id) });
  };

  const onModalSuccess = (saved) => {
    if (editor.draft) {
      setItems(p => p.map(i =>
        (i.id === saved.id || i._id === saved._id) ? { ...i, ...saved } : i
      ));
    } else {
      setItems(p => [saved, ...p]);
    }
    setEditor({ open: false, draft: null });
    setSelected(new Set());
  };

  // ── Actions ──
  const onDelete = (id) => {
    const ids = id ? [String(id)] : [...selected];
    const itemsToDelete = items.filter(i => ids.includes(String(i.id || i._id)));

    // Optimistic update: remove from UI immediately
    setItems(p => p.filter(i => !ids.includes(String(i.id || i._id))));
    if (!id) setSelected(new Set());

    let isUndone = false;

    setToastConfig({
      message: `Deleted ${ids.length} item${ids.length > 1 ? 's' : ''}`,
      type: 'warning',
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          isUndone = true;
          // Restore items to state
          setItems(p => [...itemsToDelete, ...p]);
        }
      },
      onClose: () => {
        // Only call backend if not undone
        if (!isUndone) {
          deleteEntities(ids).catch(err => console.error("Delete failed:", err));
        }
        setToastConfig(null);
      }
    });
  };

  const onDuplicate = async (id) => {
    const ids = id ? [String(id)] : [...selected];
    const dupes = await duplicateEntities(ids);
    setItems(p => [...dupes, ...p]);
    if (!id) setSelected(new Set());
  };

  const updateRelations = async (id, type, ids) => {
    try {
      const updated = await updateEntity(id, { [type]: ids });
      setItems(p => p.map(i => (i.id === id || i._id === id) ? { ...i, ...updated } : i));
    } catch (err) {
      console.error('Failed to update relations:', err);
    }
  };

  // ── Label helpers ──
  const tabLabel = tab === 'person' ? 'People' : tab === 'group' ? 'Groups' : 'Entities';
  const searchPlaceholder = `Search ${tabLabel}...`;
  const emptyLabel = `No ${tabLabel.toLowerCase()} yet.`;

  // When creating from the "All" tab, default to person
  const createType = tab === 'all' ? 'person' : tab;
  // When editing, use the existing entity's type; fall back to createType
  const modalType = editor.draft?.type ?? editor.draft?.kind ?? createType;

  return (
    <div className="stage">
      <div className="page-container">

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 24 }}>
          <Tabs
            tabs={TABS}
            value={tab}
            onChange={(newTab) => { setTab(newTab); setSearch(''); }}
            variant="tab"
          />
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={`Search ${tab === 'all' ? 'entities' : tab}...`}
            onCreate={openCreate}
            connected
          />
        </div>

        <Toolbar
          sortOptions={SORT}
          sortValue={sortKey}
          onSortChange={setSortKey}
          selectedCount={selected.size}
          onDuplicate={() => onDuplicate()}
          onDelete={() => onDelete()}
          onEdit={openEdit}
        />

        <EntityList
          items={visible}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onRelationsChange={updateRelations}
          emptyLabel={emptyLabel}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      </div>

      <EntityModal
        isOpen={editor.open}
        onClose={() => setEditor({ open: false, draft: null })}
        entityType={modalType}
        editingEntity={editor.draft ?? null}
        onSuccess={onModalSuccess}
      />
      {toastConfig && <Toast {...toastConfig} />}
    </div>
  );
}