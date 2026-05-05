import { useEffect, useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import Tabs from '../components/Tabs';
import Toolbar from '../components/Toolbar';
import EntityList from '../components/EntityList1';
import EntityModal from '../components/EntityModal';
import { listEntities, createEntity, updateEntity, deleteEntities, duplicateEntities } from '../api/entitiesApi';

const SORT = [
  { value: 'recent', label: 'Recently added' },
  { value: 'name', label: 'Name (A–Z)' },
];

export default function EntitiesPage() {
  const [tab, setTab] = useState('person');
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('recent');
  const [selected, setSelected] = useState(new Set());
  const [editor, setEditor] = useState({ open: false, draft: null });


  useEffect(() => {
    listEntities(tab).then(setItems);
    setSelected(new Set());
  }, [tab]);

  const visible = useMemo(() => {
    return items
      .filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => sortKey === 'name' 
        ? a.name.localeCompare(b.name) 
        : (b.createdAt || 0) - (a.createdAt || 0)
      );
  }, [items, search, sortKey]);


  const toggleSelect = (id) => {
    setSelected(p => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const openCreate = () => setEditor({ open: true, draft: null });
  
  const openEdit = () => {
    if (selected.size !== 1) return;
    const id = [...selected][0];
    setEditor({ open: true, draft: items.find(i => i.id === id) });
  };

  // Called by EntityModal's onSuccess with the saved entity object
  const onModalSuccess = (saved) => {
    if (editor.draft) {
      // Edit mode — replace the existing item
      setItems(p => p.map(i => (i.id === saved.id || i._id === saved._id) ? { ...i, ...saved } : i));
    } else {
      // Create mode — prepend the new item
      setItems(p => [saved, ...p]);
    }
    setEditor({ open: false, draft: null });
    setSelected(new Set());
  };

  const onDelete = async (id) => {
    const ids = id ? [id] : [...selected];
    await deleteEntities(ids);
    setItems(p => p.filter(i => !ids.includes(i.id)));
    if (!id) setSelected(new Set());
  };

  const onDuplicate = async (id) => {
    const ids = id ? [id] : [...selected];
    const dupes = await duplicateEntities(ids);
    setItems(p => [...dupes, ...p]);
    if (!id) setSelected(new Set());
  };

  return (
    <div className="stage">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 960, margin: '0 auto', padding: '20px' }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={`Search ${tab === 'person' ? 'People' : 'Groups'}...`}
          onCreate={openCreate}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs
            tabs={[
              { value: 'person', label: 'People' },
              { value: 'group', label: 'Groups' }
            ]}
            value={tab}
            onChange={setTab}
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
          emptyLabel={`No ${tab === 'person' ? 'people' : 'groups'} yet.`}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      </div>

      <EntityModal
        isOpen={editor.open}
        onClose={() => setEditor({ open: false, draft: null })}
        entityType={tab}
        editingEntity={editor.draft ?? null}
        onSuccess={onModalSuccess}
      />
    </div>
  );
}