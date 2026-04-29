import { useState, useEffect } from 'react';
import { getEntities, createEntity, updateEntity, deleteEntity, addMemberToGroup, removeMemberFromGroup, getGroupMembers, getActivitiesForEntity, createActivity, getIcons } from '../services/api';

export default function EntitiesPg() {
    const [entities, setEntities] = useState([]);
    const [icons, setIcons] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedTab, setSelectedTab] = useState('person');
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [newEntity, setNewEntity] = useState({ name: '', type: 'person' });
    const [newActivity, setNewActivity] = useState({ title: '', description: '', date: '', entityId: '' });

    useEffect(() => {
        fetchEntities();
        fetchIcons();
    }, []);

    useEffect(() => {
        if (selectedEntity) {
            fetchActivities(selectedEntity._id);
        }
    }, [selectedEntity]);

    const fetchEntities = async () => {
        try {
            const data = await getEntities();
            setEntities(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchIcons = async () => {
        try {
            const data = await getIcons();
            setIcons(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchActivities = async (entityId) => {
        try {
            const data = await getActivitiesForEntity(entityId);
            setActivities(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateEntity = async () => {
        try {
            await createEntity(newEntity);
            setShowCreateModal(false);
            setNewEntity({ name: '', type: 'person' });
            fetchEntities();
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateActivity = async () => {
        try {
            await createActivity({ ...newActivity, entityId: selectedEntity._id });
            setShowActivityModal(false);
            setNewActivity({ title: '', description: '', date: '', entityId: '' });
            fetchActivities(selectedEntity._id);
        } catch (error) {
            console.error(error);
        }
    };

    const filteredEntities = entities.filter(e => e.type === selectedTab);

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Entities</h1>

            {/* Tabs */}
            <div className="flex mb-4">
                <button
                    className={`px-4 py-2 ${selectedTab === 'person' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setSelectedTab('person')}
                >
                    Person
                </button>
                <button
                    className={`px-4 py-2 ${selectedTab === 'group' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setSelectedTab('group')}
                >
                    Group
                </button>
            </div>

            {/* Create Entity Button */}
            <button
                className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => setShowCreateModal(true)}
            >
                Create {selectedTab === 'person' ? 'Person' : 'Group'}
            </button>

            {/* Entity List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {filteredEntities.map(entity => (
                    <div
                        key={entity._id}
                        className={`p-4 border rounded cursor-pointer ${selectedEntity?._id === entity._id ? 'border-blue-500' : ''}`}
                        onClick={() => setSelectedEntity(entity)}
                    >
                        {/* Icon Placeholder */}
                        <div className="w-16 h-16 bg-gray-200 mb-2 flex items-center justify-center">
                            {entity.faceIcon ? 'SVG Icon' : 'No Icon'}
                        </div>
                        <h3 className="text-lg font-bold">{entity.name}</h3>
                        {/* For person: show groups, for group: show members */}
                        {selectedTab === 'person' && (
                            <div>
                                <p>Groups: {entity.members?.length || 0}</p>
                                {/* Add/Remove group buttons */}
                            </div>
                        )}
                        {selectedTab === 'group' && (
                            <div>
                                <p>Members: {entity.members?.length || 0}</p>
                                {/* Add/Remove member buttons */}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Activities Section */}
            {selectedEntity && (
                <div className="mt-8">
                    <h2 className="text-xl mb-4">Activities for {selectedEntity.name}</h2>
                    <div className="space-y-2">
                        {activities.map(activity => (
                            <div key={activity._id} className="p-2 border rounded">
                                <h4>{activity.title}</h4>
                                <p>{activity.description}</p>
                            </div>
                        ))}
                    </div>
                    {/* Floating + Button */}
                    <button
                        className="fixed bottom-4 right-4 bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        onClick={() => setShowActivityModal(true)}
                    >
                        +
                    </button>
                </div>
            )}

            {/* Create Entity Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded">
                        <h3>Create {selectedTab}</h3>
                        <input
                            type="text"
                            placeholder="Name"
                            value={newEntity.name}
                            onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value, type: selectedTab })}
                            className="border p-2 w-full mb-2"
                        />
                        <button onClick={handleCreateEntity} className="bg-green-500 text-white px-4 py-2">Create</button>
                        <button onClick={() => setShowCreateModal(false)} className="ml-2">Cancel</button>
                    </div>
                </div>
            )}

            {/* Create Activity Modal */}
            {showActivityModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded">
                        <h3>Add Activity</h3>
                        <input
                            type="text"
                            placeholder="Title"
                            value={newActivity.title}
                            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                            className="border p-2 w-full mb-2"
                        />
                        <textarea
                            placeholder="Description"
                            value={newActivity.description}
                            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                            className="border p-2 w-full mb-2"
                        />
                        <input
                            type="datetime-local"
                            value={newActivity.date}
                            onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                            className="border p-2 w-full mb-2"
                        />
                        <button onClick={handleCreateActivity} className="bg-blue-500 text-white px-4 py-2">Add</button>
                        <button onClick={() => setShowActivityModal(false)} className="ml-2">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}