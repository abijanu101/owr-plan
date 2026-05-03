import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listActivities } from '../api/activitiesApi';
import { listEntities } from '../api/entitiesApi';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [acts, ents] = await Promise.all([
                    listActivities(),
                    listEntities('')
                ]);
                setActivities(acts || []);
                setEntities(ents || []);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const recentActivities = activities.slice(0, 4);

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#f97766] tracking-wide" style={{ fontFamily: 'cursive' }}>
                        Welcome back, {user?.name?.split(' ')[0] || 'Planner'}!
                    </h1>
                    <p className="text-[#DC8379]/70 mt-2 text-lg font-medium">Ready to organize your next adventure?</p>
                </div>
            </div>

            {/* Quick Stats Grid & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Activities" 
                    value={loading ? '-' : activities.length} 
                    icon={<ActivityIcon />} 
                    color="from-[#f97766]/20 to-[#DC8379]/5" 
                    textColor="text-[#f97766]"
                />
                <ActionCard 
                    title="Create Activity" 
                    desc="Add a new activity to your list" 
                    icon={<AddIcon />} 
                    onClick={() => navigate('/activities/create')} 
                    primary
                />
                <ActionCard 
                    title="Start Planning" 
                    desc="Generate an optimal schedule" 
                    icon={<SparkleIcon />} 
                    onClick={() => navigate('/plan')} 
                />
            </div>

            {/* Visualization Section (Placeholder) */}
            <div className="bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[250px]">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none" />
                <PlanIcon className="w-16 h-16 text-purple-400/50 mb-4" />
                <h2 className="text-2xl text-purple-400 font-bold mb-2 text-center" style={{ fontFamily: 'cursive' }}>Today's Visualizer</h2>
                <p className="text-white/40 text-center max-w-md">
                    Visualizer for the current day will be displayed here.<br/>
                    It will feature the most frequently visualized entities, with the "Self" entity fixed at the top.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities */}
                <div className="bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col h-full">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#DC8379]/5 to-transparent pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between mb-6">
                        <h2 className="text-2xl text-[#f97766] font-bold" style={{ fontFamily: 'cursive' }}>Recent Activities</h2>
                        <Link to="/activities" className="text-[#DC8379] text-sm font-bold hover:text-[#f97766] transition-colors">View All →</Link>
                    </div>
                    
                    <div className="space-y-3 relative z-10 flex-1">
                        {loading ? (
                            <div className="animate-pulse space-y-3">
                                {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl"></div>)}
                            </div>
                        ) : recentActivities.length > 0 ? (
                            recentActivities.map(act => (
                                <div key={act._id || act.id} className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/5 hover:border-[#f97766]/30 transition-all group/item cursor-pointer" onClick={() => navigate(`/activities/${act._id || act.id}/edit`)}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#DC8379]/10 flex items-center justify-center text-[#DC8379] group-hover/item:scale-110 transition-transform">
                                            <ActivityIcon />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white/90 text-sm group-hover/item:text-[#f97766] transition-colors">{act.title}</h3>
                                            <p className="text-white/40 text-xs line-clamp-1">{act.description || 'No description'}</p>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover/item:opacity-100 transition-opacity text-[#f97766]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-white/40 font-medium italic" style={{ fontFamily: 'cursive' }}>
                                No activities yet. Let's create one!
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Entities */}
                <div className="bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97766]/10 blur-3xl rounded-full" />
                    <div className="relative z-10 flex items-center justify-between mb-6">
                        <h2 className="text-2xl text-[#f97766] font-bold" style={{ fontFamily: 'cursive' }}>Frequent Entities</h2>
                        <Link to="/entities" className="text-[#DC8379] text-sm font-bold hover:text-[#f97766] transition-colors">View All →</Link>
                    </div>

                    <div className="space-y-3 relative z-10 flex-1">
                        {loading ? (
                            <div className="animate-pulse space-y-3">
                                {[1,2,3,4].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl"></div>)}
                            </div>
                        ) : entities.length > 0 ? (
                            entities.slice(0, 5).map(ent => (
                                <div key={ent.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group/ent border border-transparent hover:border-white/5">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner border border-white/10 shrink-0 cursor-pointer" style={{ backgroundColor: ent.color || '#333' }} onClick={() => navigate(`/entities/${ent.id}`)}>
                                        {ent.faceIcon || '🧑'}
                                    </div>
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/entities/${ent.id}`)}>
                                        <h4 className="font-bold text-white/80 truncate text-sm">{ent.name}</h4>
                                        <p className="text-xs text-white/40 uppercase tracking-wider">{ent.type}</p>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/activities/create', { state: { entityId: ent.id } });
                                        }}
                                        className="w-8 h-8 rounded-full bg-white/5 text-[#DC8379] flex items-center justify-center hover:bg-[#f97766] hover:text-[#1A0B16] transition-all opacity-0 group-hover/ent:opacity-100 shrink-0"
                                        title={`Add activity for ${ent.name}`}
                                    >
                                        <AddIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-white/40 font-medium italic" style={{ fontFamily: 'cursive' }}>
                                No entities added yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Ledgers (Placeholder) */}
                <div className="bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col h-full">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between mb-6">
                        <h2 className="text-2xl text-blue-400 font-bold" style={{ fontFamily: 'cursive' }}>Recent Ledgers</h2>
                        <span className="text-blue-400/50 text-sm font-bold">Coming Soon</span>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center py-8">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                            <LedgerIcon />
                        </div>
                        <p className="text-white/40 font-medium max-w-[200px] text-sm">
                            Your collection of financial ledgers will appear here.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Subcomponents
function StatCard({ title, value, icon, color, textColor }) {
    return (
        <div className={`bg-gradient-to-br ${color} border border-[var(--border-subtle)] p-6 rounded-3xl flex items-center justify-between shadow-lg hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group h-full min-h-[120px]`}>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-500 pointer-events-none">
                <div className="w-24 h-24">{icon}</div>
            </div>
            <div className="relative z-10">
                <p className="text-white/50 text-sm font-bold uppercase tracking-widest mb-1">{title}</p>
                <h3 className={`text-4xl font-black ${textColor} drop-shadow-sm`}>{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center ${textColor} shadow-inner relative z-10 backdrop-blur-md`}>
                {icon}
            </div>
        </div>
    );
}

function ActionCard({ title, desc, icon, onClick, primary }) {
    return (
        <button 
            onClick={onClick}
            className={`flex-1 p-6 rounded-3xl text-left transition-all duration-300 group shadow-lg border relative overflow-hidden h-full min-h-[120px] ${
                primary 
                ? 'bg-[#f97766] border-[#f97766] hover:bg-[#f97766]/90 hover:shadow-[#f97766]/20 hover:-translate-y-1' 
                : 'bg-[var(--bg-raised)] border-[var(--border-subtle)] hover:border-[#DC8379]/50 hover:bg-white/5 hover:-translate-y-1'
            }`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-2xl rounded-full opacity-20 pointer-events-none transition-transform duration-500 group-hover:scale-150 ${primary ? 'bg-white' : 'bg-[#f97766]'}`} />
            <div className="relative z-10 flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${primary ? 'bg-black/20 text-white' : 'bg-[#DC8379]/10 text-[#DC8379]'}`}>
                    {icon}
                </div>
                <div>
                    <h3 className={`text-xl font-bold mb-1 ${primary ? 'text-white' : 'text-[#f97766]'}`} style={{ fontFamily: 'cursive' }}>{title}</h3>
                    <p className={`text-sm font-medium ${primary ? 'text-white/80' : 'text-white/40'}`}>{desc}</p>
                </div>
            </div>
        </button>
    );
}

// Icons
const ActivityIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const EntityIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const PlanIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const AddIcon = ({ className="w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
);
const SparkleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);
const LedgerIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
