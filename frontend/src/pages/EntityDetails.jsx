import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PersonIcon, GroupIcon } from '../components/EntityIcons';
import EntityList from '../components/EntityList';
import EditEntityModal from '../components/EditEntityModal';

const MOCK_DATA = {
  "123": {
    _id: "123",
    name: "zoha",
    type: "person",
    color: "var(--color-primary)",
    faceIcon: "/avatar/face/happy.svg",
    accessoryIcon: "/avatar/accessories/crown.svg",
    members: [],
    groups: [
      { _id: "678", name: "Dev Team", color: "var(--color-success)" }
    ]
  },
  "456": {
    _id: "456",
    name: "alizeh",
    type: "person",
    color: "var(--text-neutral)",
    faceIcon: "/avatar/face/sassy.svg",
    accessoryIcon: "/avatar/accessories/flower.svg",
    members: [],
    groups: [
      { _id: "678", name: "Dev Team", color: "var(--color-success)" }
    ]
  },
  "678": {
    _id: "678",
    name: "Dev Team",
    type: "group",
    color: "var(--color-success)",
    faceIcon: "/avatar/face/happy-g.svg",
    accessoryIcon: "/avatar/accessories/glasses-g.svg",
    members: [
      { _id: "123", name: "zoha", color: "var(--color-primary)" },
      { _id: "456", name: "alizeh", color: "var(--text-neutral)" }
    ],
    groups: []
  }
};

export default function EntityDetails() {
  const { id } = useParams();
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const fetchEntity = async () => {
      try {
        setLoading(true);
        
        // Mock data logic
        if (import.meta.env.MODE === 'development' && MOCK_DATA[id]) {
          setEntity(MOCK_DATA[id]);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`/api/entities/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch entity details');
        }

        const data = await response.json();
        setEntity(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEntity();
    }
  }, [id]);

  const toModalEntity = (e) => {
    if (!e) return null;
    const rawFace = e.faceIcon || 'face/happy.svg';
    const faceIcon = rawFace.startsWith('/avatar/') ? rawFace.replace('/avatar/', '') : rawFace;

    // Keep mock data untouched; adapt to modal shape.
    const accessories = Array.isArray(e.accessories)
      ? e.accessories.map(a => (a.startsWith('/avatar/') ? a.replace('/avatar/', '') : a))
      : (e.accessoryIcon
          ? [(e.accessoryIcon.startsWith('/avatar/') ? e.accessoryIcon.replace('/avatar/', '') : e.accessoryIcon)]
          : []);

    return {
      _id: e._id,
      name: e.name ?? '',
      type: e.type ?? 'person',
      color: e.color ?? 'var(--color-primary)',
      faceIcon,
      accessories
    };
  };

  const applySavedEntityToView = (saved) => {
    // Accept either backend response shape (faceIcon like "face/happy.svg")
    // or modal mock shape; convert to the view shape expected here ("/avatar/...").
    const rawFace = saved?.faceIcon || entity?.faceIcon || '/avatar/face/happy.svg';
    const normalizedFace = rawFace.startsWith('/avatar/') ? rawFace : `/avatar/${rawFace}`;

    const normalizedAccessories = Array.isArray(saved?.accessories)
      ? saved.accessories.map(a => (a.startsWith('/avatar/') ? a : `/avatar/${a}`))
      : [];

    setEntity(prev => {
      const next = { ...(prev || {}), ...(saved || {}) };
      next.faceIcon = normalizedFace;

      // For backward compat with existing UI, keep accessoryIcon as the "first accessory".
      next.accessories = normalizedAccessories;
      next.accessoryIcon = normalizedAccessories[0] || null;

      return next;
    });
  };

  // Handlers for Add/Remove
  const handleAddGroup = () => {
    console.log('Add group to person', id);
    // Future API call here
  };

  const handleRemoveGroup = (groupId) => {
    console.log('Remove group', groupId, 'from person', id);
    // Future API call here
    if (entity && entity.groups) {
      setEntity({
        ...entity,
        groups: entity.groups.filter(g => g._id !== groupId)
      });
    }
  };

  const handleAddMember = () => {
    console.log('Add member to group', id);
    // Future API call here
  };

  const handleRemoveMember = (memberId) => {
    console.log('Remove member', memberId, 'from group', id);
    // Future API call here
    if (entity && entity.members) {
      setEntity({
        ...entity,
        members: entity.members.filter(m => m._id !== memberId)
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 text-[var(--text-neutral)]">
        <div className="text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-xl text-[var(--color-error)]">
          {error || 'Entity not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full p-6 md:p-12 flex flex-col items-center">
      
      {/* Responsive layout: column on mobile, row on desktop for header area if needed, 
          but design shows vertical stacked with the avatar centered or aligned left. 
          We'll use flex-col on mobile, md:flex-row if it was complex, but for avatar + list 
          the prompt says "Desktop -> horizontal layout, Mobile -> vertical stacked". 
          We'll wrap the avatar area and the list area. */}
      
      <div className="w-full max-w-4xl flex flex-col md:flex-row md:items-start md:space-x-12">
        
        {/* Left Side (or Top on mobile): Avatar and Name */}
        <div className="flex flex-col items-center mb-8 md:mb-0 md:w-1/3 shrink-0">
          
          <div className="w-48 h-48 sm:w-64 sm:h-64 mb-4 relative group">
            {entity.type === 'person' ? (
              <PersonIcon color={entity.color} faceIcon={entity.faceIcon} accessoryIcon={entity.accessoryIcon} className="w-full h-full shadow-lg" />
            ) : (
              <GroupIcon color={entity.color} faceIcon={entity.faceIcon} accessoryIcon={entity.accessoryIcon} className="w-full h-full shadow-lg" />
            )}
          </div>

          <div className="flex items-center justify-center space-x-3 mt-2">
            <h1 
              className="text-3xl sm:text-4xl text-white px-6 py-2 rounded-full shadow-md drop-shadow text-center"
              style={{ backgroundColor: entity.color || 'var(--bg-accent)' }}
            >
              {entity.name}
            </h1>
            {/* Edit icon pill */}
            <button 
              className="w-10 h-10 rounded-full bg-[var(--bg-accent)] flex items-center justify-center text-[var(--text-neutral)] hover:brightness-125 transition-all shadow-md shrink-0 cursor-pointer"
              onClick={() => setIsEditOpen(true)}
              title="Edit Profile"
            >
              &#9998;
            </button>
          </div>
        </div>

        {/* Right Side (or Bottom on mobile): Lists */}
        <div className="flex-grow w-full md:w-2/3 flex flex-col">
          
          {entity.type === 'person' && (
            <EntityList 
              title="groups" 
              items={entity.groups || []} 
              onAdd={handleAddGroup} 
              onRemove={handleRemoveGroup} 
            />
          )}

          {entity.type === 'group' && (
            <EntityList 
              title="members" 
              items={entity.members || []} 
              onAdd={handleAddMember} 
              onRemove={handleRemoveMember} 
            />
          )}

          {/* Activities Placeholder (as seen in image) */}
          <div className="w-full mt-10">
            <div className="w-full h-[2px] bg-[var(--text-neutral)] mb-4 opacity-50 rounded-full" />
            <h2 className="text-2xl mb-4 text-[var(--text-neutral)] capitalize">Activities</h2>
            
            <div className="space-y-4">
              <div className="w-full rounded-xl border border-[var(--text-neutral)] bg-transparent px-4 py-3 flex justify-between items-center text-[var(--text-neutral)]">
                <span>Activity 11</span>
                <div className="text-right text-sm leading-tight mr-4">
                  <div>2 - 4 pm</div>
                  <div>monday</div>
                  <div>23 feb</div>
                </div>
                <div className="text-2xl opacity-80">&#9660;</div>
              </div>
              
              <div className="w-full rounded-xl border border-[var(--text-neutral)] bg-transparent px-4 py-3 flex justify-between items-center text-[var(--text-neutral)]">
                <span>Activity 11</span>
                <div className="text-right text-sm leading-tight mr-4">
                  <div>2 - 4 pm</div>
                  <div>monday</div>
                  <div>23 feb</div>
                </div>
                <div className="text-2xl opacity-80">&#9660;</div>
              </div>
            </div>

            <button className="mt-6 rounded-full border border-[var(--text-neutral)] px-6 py-2 flex items-center text-[var(--text-neutral)] hover:bg-[var(--text-neutral)] hover:text-[var(--bg-primary)] transition-colors">
              <span className="text-2xl mr-3 leading-none font-bold">+</span> SCHEDULE NEW ACTIVITY
            </button>
          </div>

        </div>

      </div>

      <EditEntityModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        editingEntity={toModalEntity(entity)}
        onSuccess={(saved) => applySavedEntityToView(saved)}
      />
    </div>
  );
}
