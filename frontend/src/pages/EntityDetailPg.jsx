import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EntityIcon from '../components/EntityIcon';
import { getEntityById, getEntities, getActivitiesForEntity, createActivity } from '../services/api';

export default function EntityDetailPg() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [entity, setEntity] = useState(null);
    const [activities, setActivities] = useState([]);
    const [relatedGroups, setRelatedGroups] = useState([]);
    const [showCreateActivity, setShowCreateActivity] = useState(false);
    const [newActivity, setNewActivity] = useState({ title: '', description: '', date: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadEntity();
    }, [user, id, navigate]);

    const loadEntity = async () => {
        setLoading(true);
        try {
            const response = await getEntityById(id);
            const entityData = response.data || null;
            setEntity(entityData);
            if (entityData) {
                fetchActivities(id);
                if (entityData.type === 'person') {
                    fetchRelatedGroups(entityData._id);
                }
            }
            setError('');
        } catch (error) {
            console.error(error);
            setError('Failed to load entity.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedGroups = async (personId) => {
        try {
            const response = await getEntities();
            const groups = (response.data || []).filter((entityItem) => {
                if (entityItem.type !== 'group') return false;
                return Array.isArray(entityItem.members) && entityItem.members.some((member) => {
                    if (!member) return false;
                    if (typeof member === 'string') return member === personId;
                    return member._id === personId;
                });
            });
            setRelatedGroups(groups);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchActivities = async (entityId) => {
        try {
            const response = await getActivitiesForEntity(entityId);
            setActivities(response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddActivity = async () => {
        if (!entity) return;
        try {
            await createActivity({
                title: newActivity.title,
                description: newActivity.description,
                date: newActivity.date,
                entityId: entity._id
            });
            setShowCreateActivity(false);
            setNewActivity({ title: '', description: '', date: '' });
            fetchActivities(entity._id);
        } catch (error) {
            console.error(error);
            setError('Failed to add activity.');
        }
    };

    if (loading) {
        return <div className="p-4 text-text-muted">Loading entity...</div>;
    }

    if (!entity) {
        return <div className="p-4 text-text-muted">Entity not found.</div>;
    }

    const relatedLabel = entity.type === 'person' ? 'Groups' : 'Members';
    const relationItems = entity.type === 'person' ? relatedGroups : entity.members || [];

    return (
        <div className="p-4">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/entities')}
                        className="text-sm text-muted underline"
                    >
                        ← Back to entities
                    </button>
                    <h1 className="mt-2 text-3xl font-semibold">{entity.name}</h1>
                </div>
                <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-muted ring-1 ring-white/10">
                    {entity.type === 'person' ? 'Person' : 'Group'}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
                <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
                    <div className="flex flex-wrap items-center gap-6">
                            <EntityIcon
                            faceSvg={entity.faceIcon?.filename || entity.faceIcon || ''}
                            accessory={entity.accessory?.filename || entity.accessory || ''}
                            addons={(entity.addons || []).map((addon) => addon.filename || addon)}
                            size={112}
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm text-muted">{entity.type === 'person' ? 'Created for a person' : 'Created for a group'}</p>
                            <h2 className="text-4xl font-semibold text-white">{entity.name}</h2>
                            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
                                <span className="rounded-full bg-blue-500/10 px-3 py-1">Color: {entity.color || 'default'}</span>
                                <span className="rounded-full bg-blue-500/10 px-3 py-1">Created at {new Date(entity.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div id="relation-panel" className="mt-8 rounded-3xl bg-white/5 p-5">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-muted">{relatedLabel}</p>
                                <h3 className="text-xl font-semibold">{relatedLabel} for this {entity.type === 'person' ? 'person' : 'group'}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => document.getElementById('relation-panel')?.scrollIntoView({ behavior: 'smooth' })}
                                className="rounded-full bg-blue-500 px-4 py-2 text-sm text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600"
                            >
                                View {entity.type === 'person' ? 'groups' : 'people'}
                            </button>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {relationItems.length === 0 ? (
                                <p className="text-sm text-muted">No {entity.type === 'person' ? 'groups yet' : 'members yet'}.</p>
                            ) : (
                                relationItems.map((item) => {
                                    const name = item.name || item;
                                    return (
                                        <span key={typeof item === 'string' ? item : item._id} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                                            {name}
                                        </span>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </section>

                <aside className="space-y-6">
                    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-muted">Quick actions</p>
                                <h3 className="text-xl font-semibold">Relationships</h3>
                            </div>
                        </div>
                        <div className="mt-4 space-y-3 text-sm text-muted">
                            <p>{entity.type === 'person'
                                ? 'This person is part of these groups. Use the list to review related families, teams, or circles.'
                                : 'These are the people assigned to this group. Use the add activity button to track shared work.'
                            }</p>
                        </div>
                    </div>

                    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
                        <p className="text-sm uppercase tracking-[0.2em] text-muted">Activity summary</p>
                        <p className="mt-3 text-3xl font-semibold text-white">{activities.length}</p>
                        <p className="mt-2 text-sm text-muted">Total activities linked to this entity.</p>
                    </div>
                </aside>
            </div>

            <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-muted">Activities</p>
                        <h3 className="text-2xl font-semibold">Activity history</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateActivity(true)}
                        className="rounded-full bg-blue-500 px-5 py-3 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600"
                    >
                        + Add activity
                    </button>
                </div>

                {activities.length === 0 ? (
                    <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-muted">
                        No activities yet for this {entity.type}.
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4">
                        {activities.map((activity) => (
                            <div key={activity._id} className="rounded-3xl border border-white/10 bg-white/10 p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <h4 className="text-lg font-semibold text-white">{activity.title}</h4>
                                    <span className="text-sm text-muted">{new Date(activity.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="mt-2 text-sm text-muted">{activity.description || 'No description provided.'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showCreateActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-2xl shadow-black/30">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Add Activity</h2>
                            <button
                                type="button"
                                onClick={() => setShowCreateActivity(false)}
                                className="text-muted hover:text-black"
                            >
                                Close
                            </button>
                        </div>
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-sm text-muted">Title</span>
                                <input
                                    value={newActivity.title}
                                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                                    className="mt-1 w-full rounded-3xl border border-black/10 bg-white p-3 text-black"
                                    placeholder="Activity title"
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm text-muted">Description</span>
                                <textarea
                                    value={newActivity.description}
                                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                    className="mt-1 w-full min-h-[120px] rounded-3xl border border-black/10 bg-white p-3 text-black"
                                    placeholder="Describe what happened"
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm text-muted">Date</span>
                                <input
                                    type="datetime-local"
                                    value={newActivity.date}
                                    onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                                    className="mt-1 w-full rounded-3xl border border-black/10 bg-white p-3 text-black"
                                />
                            </label>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleAddActivity}
                                    className="rounded-3xl bg-blue-500 px-5 py-3 text-white hover:bg-blue-600"
                                >
                                    Save activity
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateActivity(false)}
                                    className="rounded-3xl border border-black/10 bg-white px-5 py-3 text-muted"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
