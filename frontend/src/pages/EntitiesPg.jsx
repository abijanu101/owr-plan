import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEntities, createEntity, getIcons } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import EntityCard from '../components/EntityCard';
import AddEntityModal from '../components/AddEntityModal';
export default function EntitiesPg() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [entities, setEntities] = useState([]);
    const [icons, setIcons] = useState([]);
    const [selectedTab, setSelectedTab] = useState('person');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newEntity, setNewEntity] = useState({ name: '', type: 'person', faceIcon: '', accessory: '', addons: [] });
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchEntities();
        fetchIcons();
    }, [user, navigate]);

    const fetchEntities = async () => {
        try {
            const response = await getEntities();
            setEntities(response.data || []);
            setError('');
        } catch (error) {
            console.error(error);
            setError('Failed to load entities. Please try again.');
        }
    };

    const fetchIcons = async () => {
        try {
            const response = await getIcons();
            setIcons(response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateEntity = async () => {
        try {
            const entityData = {
                ...newEntity,
                type: selectedTab,
                faceIcon: newEntity.faceIcon || null,
                accessory: newEntity.accessory || null,
                addons: Array.isArray(newEntity.addons) ? newEntity.addons : []
            };
            await createEntity(entityData);
            setShowCreateModal(false);
            setNewEntity({ name: '', type: 'person', faceIcon: '', accessory: '', addons: [] });
            fetchEntities();
        } catch (error) {
            console.error(error);
            setError('Failed to create entity.');
        }
    };

    if (!user) {
        return <div>Please log in to access this page.</div>;
    }

    const faceIcons = icons.filter(icon => icon.type === 'face');
    const accessoryIcons = icons.filter(icon => icon.type === 'accessory');
    const addonIcons = icons.filter(icon => icon.type === 'addon');

    const filteredEntities = entities.filter((entity) => entity.type === selectedTab);

    return (
        <div className="p-4">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-muted">Entities</p>
                    <h1 className="text-3xl font-semibold">People and Groups</h1>
                </div>
                <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-3 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600"
                >
                    + New {selectedTab === 'person' ? 'Person' : 'Group'}
                </button>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => setSelectedTab('person')}
                    className={`rounded-full px-4 py-2 transition ${selectedTab === 'person' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                >
                    People
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedTab('group')}
                    className={`rounded-full px-4 py-2 transition ${selectedTab === 'group' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                >
                    Groups
                </button>
            </div>

            {error && <div className="mb-4 rounded-3xl border border-red-200 bg-red-100/70 p-4 text-red-700">{error}</div>}

            {filteredEntities.length === 0 ? (
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-center text-muted">
                    No {selectedTab === 'person' ? 'people' : 'groups'} added yet. Click + to add one.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredEntities.map((entity) => (
                        <EntityCard
                            key={entity._id}
                            entity={entity}
                            onClick={() => navigate(`/entities/${entity._id}`)}
                        />
                    ))}
                </div>
            )}

            <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="fixed bottom-6 right-6 z-10 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-3xl text-white shadow-2xl shadow-blue-500/20"
            >
                +
            </button>

            <AddEntityModal
                open={showCreateModal}
                type={selectedTab}
                faceIcons={faceIcons}
                accessoryIcons={accessoryIcons}
                addonIcons={addonIcons}
                entityData={newEntity}
                setEntityData={setNewEntity}
                onCreate={handleCreateEntity}
                onClose={() => setShowCreateModal(false)}
                error={error}
                existingEntities={entities}
            />
        </div>
    );
}