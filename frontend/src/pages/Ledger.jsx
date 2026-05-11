import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listMyLedgers, deleteLedger } from '../api/ledgerApi';
import { listEntities } from '../api/entitiesApi';

export default function Ledger() {
    const navigate = useNavigate();
    const [ledgers, setLedgers] = useState([]);
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [ledgerData, entityData] = await Promise.all([
                    listMyLedgers(),
                    listEntities('all')
                ]);
                setLedgers(ledgerData);
                setEntities(entityData);
            } catch (err) {
                console.error("Failed to load ledgers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDeleteLedger = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this ledger?')) {
            const success = await deleteLedger(id);
            if (success) {
                setLedgers(ledgers.filter(ledger => (ledger._id || ledger.id) !== id));
            }
        }
    };

    const getParticipantsSummary = (people) => {
        if (!people || people.length === 0) return 'No participants';
        const names = people.map(p => {
            if (typeof p === 'object' && p.name) return p.name;
            const entity = entities.find(e => String(e._id || e.id) === String(p));
            return entity ? entity.name : '...';
        }).filter(name => name !== '...');

        if (names.length === 0) return 'Unknown participants';
        if (names.length === 1) return names[0];
        if (names.length === 2) return `${names[0]}, ${names[1]}`;
        return `${names[0]}, ${names[1]} +${names.length - 2}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'No Date';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
            <div className="text-[#f97766] text-xl animate-pulse font-medium">Loading your ledgers...</div>
        </div>
    );

    return (
        <div className="bg-[var(--bg-primary)] p-4 sm:p-6 md:p-8 md:pt-0 relative min-h-screen">
            <div className="max-w-5xl mx-auto pt-8 sm:pt-12">

                {/* Add Expense Button Trigger */}
                <button
                    onClick={() => navigate('/ledgers/add')}
                    className="flex items-center gap-4 mb-8 group outline-none"
                >
                    <div className="w-10 h-10 rounded-full border border-[#f97766]/60 flex items-center justify-center group-hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(249,119,102,0.2)] group-hover:shadow-[0_0_20px_rgba(249,119,102,0.5)]">
                        <span className="text-[#f97766] text-3xl font-light leading-none mb-1.5">+</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl text-[#f97766] tracking-wide" style={{ fontFamily: 'cursive' }}>
                        Add Expense
                    </h2>
                </button>

                {ledgers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-[#f97766]/20">
                        <p className="text-[#f97766]/60 text-lg mb-4">No expenses found.</p>
                        <button
                            onClick={() => navigate('/ledgers/add')}
                            className="text-[#f97766] hover:underline"
                        >
                            Create your first ledger
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ledgers.map((ledger) => (
                            <div
                                key={ledger._id || ledger.id}
                                onClick={() => navigate(`/ledgers/${ledger._id || ledger.id}`)}
                                className={`relative bg-[#200412] rounded-[2rem] p-6 border-2 shadow-[0_0_15px_rgba(249,119,102,0.1)] transition-all duration-300 cursor-pointer group hover:scale-[1.03] flex flex-col items-center min-h-[220px] ${ledger.status === 'settled' ? 'border-[#4c0e36]/60 hover:border-[#4c0e36]' : 'border-[#f97766]/20 hover:border-[#f97766]/50 hover:shadow-[0_0_25px_rgba(249,119,102,0.25)] hover:bg-[#190410]'}`}
                            >
                                {/* Status Label */}
                                <div className={`absolute top-4 left-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest z-10 ${ledger.status === 'settled' ? 'bg-[#4c0e36] text-[#dc8379] border border-[#dc8379]/20' : 'bg-[#f97766]/20 text-[#f97766] border border-[#f97766]/20'}`}>
                                    {ledger.status === 'settled' ? 'Complete' : 'Pending'}
                                </div>

                                {/* Delete Icon */}
                                <button
                                    onClick={(e) => handleDeleteLedger(e, ledger._id || ledger.id)}
                                    className="absolute top-4 right-4 text-[#f97766]/40 hover:text-[#f97766] transition-colors p-2 hover:bg-[#f97766]/10 rounded-lg opacity-0 group-hover:opacity-100 z-10"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>

                                <div className="absolute inset-0 p-6 flex items-center justify-center overflow-hidden">

                                    {/* Icon Container */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[70%] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-x-[160%] group-hover:-translate-y-1/2 group-hover:scale-110">
                                        <div className={`w-20 h-20 flex items-center justify-center transition-all duration-500 ${ledger.status === 'settled' ? 'opacity-90 brightness-50' : ''}`}>
                                            <img src={`/${ledger.icon || 'food'}.png`} alt={ledger.name} className="w-full h-full object-contain drop-shadow-md" />
                                        </div>
                                    </div>

                                    {/* Details Container (Name, Line, Date, Participants) */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[20px] flex flex-col items-center group-hover:items-start transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-x-[10%] group-hover:-translate-y-[50%] w-[75%]">

                                        {/* Name */}
                                        <span className={`text-xl tracking-wide font-bold transition-all duration-500 text-center group-hover:text-left w-full line-clamp-2 ${ledger.status === 'settled' ? 'text-[#743c40] line-through' : 'text-[#f97766]'}`}>
                                            {ledger.name}
                                        </span>

                                        {/* Condensed Info (Visible before hover) */}
                                        <div className={`text-[#f97766]/50 text-xs mt-1 transition-all duration-500 group-hover:opacity-0 group-hover:h-0 overflow-hidden text-center w-full ${ledger.status === 'settled' ? 'opacity-20' : ''}`}>
                                            {formatDate(ledger.date)} | {getParticipantsSummary(ledger.people)} | ${Math.round(ledger.amount || 0)}
                                        </div>

                                        {/* Reveal Section */}
                                        <div className="flex flex-col items-start w-full overflow-hidden transition-all duration-500 max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 group-hover:mt-3">
                                            <div className="w-3/5 h-px bg-[#f97766]/30 mb-2"></div>
                                            <span className="text-[#f97766]/70 text-sm tracking-wide font-medium mb-1">
                                                {formatDate(ledger.date)}
                                            </span>
                                            <span className="text-[#f97766]/50 text-xs italic font-medium mb-1">
                                                {getParticipantsSummary(ledger.people)}
                                            </span>
                                            <span className={`text-sm font-bold ${ledger.status === 'settled' ? 'text-[#743c40]' : 'text-[#f97766]'}`}>
                                                Total: ${Math.round(ledger.amount || 0)}
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
