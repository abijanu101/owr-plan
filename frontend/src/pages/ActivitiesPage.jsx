import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import Toolbar from '../components/Toolbar';
import ActivityList from '../components/ActivityList';
import Tabs from '../components/Tabs';
import Toast from '../components/UI/Toast';
import {
  listActivities,
  deleteActivities,
  duplicateActivities,
} from '../api/activitiesApi';

const SORT = [
  { value: 'recent', label: 'Recently added' },
  { value: 'title',  label: 'Title (A–Z)' },
];

const FILTER = [
  { value: 'all',           label: 'All' },
  { value: 'recurring',     label: 'Recurring' },
  { value: 'non-recurring', label: 'Non-Recurring' },
];

export default function ActivitiesPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('recent');
  const [filterKey, setFilterKey] = useState('all');
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [toastConfig, setToastConfig] = useState(null);
  const navigate = useNavigate();

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

    if (filterKey === 'recurring')     arr = arr.filter(a => a.activityType === 'recurring');
    if (filterKey === 'non-recurring') arr = arr.filter(a => a.activityType === 'non-recurring');

    return [...arr].sort((a, b) => {
      if (sortKey === 'title') return a.title.localeCompare(b.title);
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

  const openCreate = () => navigate('/activities/create');

  const openEdit = () => {
    if (selected.size !== 1) return;
    const id = [...selected][0];
    navigate(`/activities/${id}/edit`);
  };

  const onDelete = async () => {
    const ids = [...selected];
    const itemsToDelete = items.filter(i => ids.includes(i.id) || ids.includes(i._id));

    // Optimistic UI update
    setItems((prev) => prev.filter((i) => !selected.has(i.id) && !selected.has(i._id)));
    setSelected(new Set());

    let isUndone = false;

    setToastConfig({
      message: `Deleted ${ids.length} activity${ids.length > 1 ? 'ies' : ''}`,
      type: 'warning',
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          isUndone = true;
          setItems(prev => [...itemsToDelete, ...prev]);
        }
      },
      onClose: () => {
        if (!isUndone) {
          deleteActivities(ids).catch(err => console.error('Delete failed:', err));
        }
        setToastConfig(null);
      }
    });
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
    return (
      <div className="stage">
        <div style={{ padding: 40, color: 'var(--text-neutral)', textAlign: 'center' }}>
          Loading activities...
        </div>
      </div>
    );
  }

  return (
    <div className="stage">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 960, margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 24 }}>
          <Tabs
            tabs={FILTER}
            value={filterKey}
            onChange={setFilterKey}
            variant="tab"
          />
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search Activity"
            onCreate={openCreate}
            connected
          />
        </div>

        <Toolbar
          sortOptions={SORT}
          sortValue={sortKey}
          onSortChange={setSortKey}
          selectedCount={selected.size}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onEdit={openEdit}
        />

        <ActivityList
          items={visible}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      </div>
      {toastConfig && <Toast {...toastConfig} />}
    </div>
  );
}