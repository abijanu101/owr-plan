import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import Toolbar from '../components/Toolbar';
import ActivityList from '../components/ActivityList';
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
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      </div>
    </div>
  );
}