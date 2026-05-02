import { useEffect, useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import Toolbar from '../components/Toolbar';
import Modal from '../components/Modal';
import ActivityList from '../components/ActivityList';
import ActivityForm from '../components/ActivityForm';
import {
  listActivities,
  createActivity,
  updateActivity,
  deleteActivities,
  duplicateActivities,
} from '../api/activitiesApi';

const SORT = [
  { value: 'recent', label: 'Recently added' },
  { value: 'title', label: 'Title (A–Z)' },
  { value: 'date', label: 'Date' },
];

const FILTER = [
  { value: 'all', label: 'All' },
  { value: 'weekend', label: 'Weekend (Sa/S)' },
  { value: 'weekday', label: 'Weekday (M–F)' },
];

export default function ActivitiesPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('recent');
  const [filterKey, setFilterKey] = useState('all');
  const [selected, setSelected] = useState(new Set());
  const [editor, setEditor] = useState({ open: false, draft: null });
  const [loading, setLoading] = useState(true);

  // ✅ Safe API call (prevents blank screen crash)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await listActivities();
        setItems(data || []);
      } catch (err) {
        console.error('Failed to load activities:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const visible = useMemo(() => {
    let arr = items.filter((a) =>
      a.title.toLowerCase().includes(search.toLowerCase())
    );

    if (filterKey === 'weekend') {
      arr = arr.filter((a) =>
        a.days?.some((d) => d === 'SA' || d === 'S')
      );
    }

    if (filterKey === 'weekday') {
      arr = arr.filter((a) =>
        a.days?.some((d) => ['M', 'T', 'W', 'TH', 'F'].includes(d))
      );
    }

    return [...arr].sort((a, b) => {
      if (sortKey === 'title') return a.title.localeCompare(b.title);
      if (sortKey === 'date') return a.date.localeCompare(b.date);
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [items, search, sortKey, filterKey]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openCreate = () => setEditor({ open: true, draft: null });

  const openEdit = () => {
    if (selected.size !== 1) return;
    const id = [...selected][0];
    const found = items.find((i) => i.id === id);
    setEditor({ open: true, draft: found });
  };

  const onSubmit = async (data) => {
    try {
      if (editor.draft) {
        const updated = await updateActivity(editor.draft.id, data);
        setItems((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i))
        );
      } else {
        const created = await createActivity(data);
        setItems((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error('Save failed:', err);
    }

    setEditor({ open: false, draft: null });
    setSelected(new Set());
  };

  const onDelete = async () => {
    const ids = [...selected];
    try {
      await deleteActivities(ids);
      setItems((prev) => prev.filter((i) => !selected.has(i.id)));
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setSelected(new Set());
  };

  const onDuplicate = async () => {
    const ids = [...selected];
    try {
      const dupes = await duplicateActivities(ids);
      setItems((prev) => [...dupes, ...prev]);
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
    setSelected(new Set());
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading activities...</div>;
  }

  return (
    <div className="stage">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 960, margin: '0 auto' }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search Activity"
          onCreate={openCreate}
        />

        <Toolbar
          sortOptions={SORT}
          sortValue={sortKey}
          onSortChange={setSortKey}
          filterOptions={FILTER}
          filterValue={filterKey}
          onFilterChange={setFilterKey}
          selectedCount={selected.size}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onEdit={openEdit}
        />

        <ActivityList
          items={visible}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
        />
      </div>

      <Modal
        open={editor.open}
        title={editor.draft ? 'Edit activity' : 'Create activity'}
        onClose={() => setEditor({ open: false, draft: null })}
        footer={
          <>
            <button
              className="btn-pill"
              onClick={() => setEditor({ open: false, draft: null })}
            >
              Cancel
            </button>
            <button
              className="btn-pill"
              data-active="true"
              form="activity-form"
              type="submit"
            >
              Save
            </button>
          </>
        }
      >
        <ActivityForm initial={editor.draft} onSubmit={onSubmit} />
      </Modal>
    </div>
  );
}