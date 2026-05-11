import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLedger, toggleSettlementPaid, createSettledLedger } from '../api/ledgerApi';
import { listEntities } from '../api/entitiesApi';
import AddExpense from '../components/AddExpense';
import Avatar from '../components/avatar';

export default function ViewExpensePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ledger, setLedger] = useState(null);
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [ledgerData, entityData] = await Promise.all([
                    getLedger(id),
                    listEntities('all')
                ]);
                setLedger(ledgerData);
                setEntities(entityData);
            } catch (err) {
                console.error("Failed to load ledger data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleTogglePaid = async (settlementId) => {
        try {
            const updatedLedger = await toggleSettlementPaid(ledger._id || ledger.id, settlementId);
            if (updatedLedger) {
                setLedger(updatedLedger);
            }
        } catch (err) {
            console.error("Failed to toggle payment status:", err);
        }
    };

    const handleConfirmEdit = async (updatedData) => {
        try {
            const result = await createSettledLedger({
                ...updatedData,
                id: ledger._id || ledger.id,
                date: updatedData.selectedDateTime?.date || ledger.date,
                people: updatedData.selectedEntities
            });
            if (result) {
                setLedger(result);
                setIsEditOpen(false);
            }
        } catch (err) {
            console.error("Failed to update ledger:", err);
            setError(err.message || "Failed to update ledger.");
        }
    };

    const getEntityName = (entityId) => {
        if (!entityId) return 'Someone';
        if (entityId === 'External Vendor') return 'External Vendor';
        const entity = entities.find(e => String(e._id || e.id) === String(entityId));
        return entity ? entity.name : entityId;
    };

    const getEntityData = (entityId) => {
        if (!entityId || entityId === 'External Vendor') return null;
        const entity = entities.find(e => String(e._id || e.id) === String(entityId));
        return entity ? {
            face: (entity.faceIcon || entity.face || '').split('/').pop() || 'happy.svg',
            accessories: (entity.accessories || []).map(a => typeof a === 'string' ? a.split('/').pop() : a),
            theme: entity.theme || 'dark',
            isGroup: entity.type === 'group',
            bgColor: entity.color || '#f97766'
        } : null;
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
            <div className="text-[#f97766] text-xl animate-pulse font-medium">Loading ledger data...</div>
        </div>
    );

    if (!ledger) return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-6">
            <div className="text-[#f97766] text-xl font-medium">Ledger not found</div>
            <button
                onClick={() => navigate('/ledgers')}
                className="px-6 py-2 rounded-full border border-[#f97766] text-[#f97766] hover:bg-[#f97766]/10 transition-colors"
            >
                Back to Ledgers
            </button>
        </div>
    );

    const summaryStats = {
        netExpenses: ledger.amount || 0,
        netDue: ledger.status === 'settled' ? 0 : (ledger.settlementTransactions?.filter(s => !s.paid).reduce((sum, t) => sum + t.amount, 0) || 0),
        internalDebts: ledger.settlementTransactions?.length || 0
    };

    return (
        <div className="bg-[var(--bg-primary)] p-4 sm:p-6 md:p-8 md:pt-0 relative min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto pt-8 sm:pt-12 flex flex-col lg:flex-row gap-10 items-start">

                {/* Left Column: Summary & Initial Transactions */}
                <div className="w-full lg:w-[350px] flex-shrink-0 flex flex-col gap-6">
                    <div className="bg-white/5 rounded-[2rem] p-8 shadow-xl border border-[#f97766]/10 flex flex-col min-h-[600px]">

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/ledgers')}
                                    className="w-8 h-8 rounded-full border border-[#f97766]/40 flex items-center justify-center hover:bg-[#f97766]/10 transition-colors"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#f97766]">
                                        <path d="M19 12H5M12 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h2 className="text-2xl text-[#f97766] tracking-wide" style={{ fontFamily: 'cursive' }}>
                                    Expense Detail
                                </h2>
                            </div>
                        </div>

                        <h3 className="text-xl text-[#f97766]/90 font-bold mb-6 truncate">{ledger.name}</h3>

                        <div className="flex flex-col gap-4 mb-8">
                            <div className="flex justify-between items-center">
                                <span className="text-[#f97766]/80 text-base">Total Amount</span>
                                <span className="text-[#f97766] font-bold text-lg">${Math.round(summaryStats.netExpenses)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#f97766]/80 text-base">Remaining Due</span>
                                <span className="text-[#f97766] font-bold text-lg">${Math.round(summaryStats.netDue)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#f97766]/80 text-base">No. of Settlements</span>
                                <span className="text-[#f97766] font-bold text-lg">{summaryStats.internalDebts}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 border-y border-[#f97766]/20 py-4 mb-6 justify-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center p-2 transition-all ${ledger.icon === 'cake' ? 'bg-[#f97766]/20 scale-110 shadow-[0_0_15px_rgba(249,119,102,0.3)]' : 'bg-white/5 opacity-40'}`}>
                                <img src="/cake.png" alt="Cake" className="w-full h-full object-contain" />
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center p-2 transition-all ${ledger.icon === 'gift' ? 'bg-[#f97766]/20 scale-110 shadow-[0_0_15px_rgba(249,119,102,0.3)]' : 'bg-white/5 opacity-40'}`}>
                                <img src="/gift.png" alt="Gift" className="w-full h-full object-contain" />
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center p-2 transition-all ${ledger.icon === 'food' ? 'bg-[#f97766]/20 scale-110 shadow-[0_0_15px_rgba(249,119,102,0.3)]' : 'bg-white/5 opacity-40'}`}>
                                <img src="/food.png" alt="Food" className="w-full h-full object-contain" />
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setError(null);
                                setIsEditOpen(true);
                            }}
                            className="w-full py-3 mb-6 rounded-xl border border-[#f97766]/40 text-[#f97766] font-bold hover:bg-[#f97766]/10 transition-all flex items-center justify-center gap-2"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit Expense
                        </button>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-[#f97766]/5 border border-[#f97766]/20 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-[#f97766] text-sm font-medium flex items-center gap-2">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12" y1="16" y2="16.01" /></svg>
                                    {error}
                                </p>
                            </div>
                        )}

                        <div className="text-[#f97766]/60 text-sm font-medium mb-3">Initial Payments</div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-6 max-h-[250px]">
                            {(ledger.initialTransactions || []).map((tx, idx) => (
                                <div key={`initial-${idx}`} className="bg-white/5 rounded-lg p-3 flex justify-between items-center border border-transparent hover:border-[#f97766]/30 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#f97766] text-xs font-medium max-w-[60px] truncate">{getEntityName(tx.from)}</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#f97766]/40">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                        <span className="text-[#f97766] text-xs font-medium max-w-[80px] truncate">{getEntityName(tx.to)}</span>
                                    </div>
                                    <span className="text-[#f97766] font-bold text-xs">${Math.round(tx.amount)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="text-xs text-[#f97766]/40 italic text-center mb-4">
                            Created on {new Date(ledger.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Right Column: Settlement Cards Grid */}
                <div className="w-full flex-1">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl text-[#f97766] font-bold tracking-wide">Settlement Transactions</h3>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${ledger.status === 'settled' ? 'bg-[#4c0e36] text-[#dc8379] border border-[#dc8379]/30' : 'bg-[#f97766]/20 text-[#f97766] border border-[#f97766]/30'}`}>
                            {ledger.status === 'settled' ? 'Complete' : 'Pending'}
                        </div>
                    </div>

                    {(!ledger.settlementTransactions || ledger.settlementTransactions.length === 0) ? (
                        <div className="h-[400px] flex flex-col items-center justify-center bg-white/5 rounded-[2rem] border border-dashed border-[#f97766]/20">
                            <p className="text-[#f97766]/60 text-lg">No settlements required!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {ledger.settlementTransactions.map((tx, idx) => (
                                <div key={`settle-card-${tx._id || idx}`} className={`bg-white/5 rounded-2xl p-6 border transition-all shadow-lg flex flex-col justify-between aspect-[4/3] group hover:bg-[#1a0510] ${tx.paid ? 'border-[#4c0e36]/60 bg-[#4c0e36]/10' : 'border-[#f97766]/10 hover:border-[#f97766]/30'}`}>
                                    <div className="flex justify-between items-center mb-6 mt-2">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`w-16 h-16 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${tx.paid ? 'bg-[#4c0e36]/20 border-[#4c0e36]/40' : 'bg-[#f97766]/10 border-[#f97766]/20'}`}>
                                                {(() => {
                                                    const entityData = getEntityData(tx.from);
                                                    return entityData ? (
                                                        <Avatar
                                                            face={entityData.face}
                                                            accessories={entityData.accessories}
                                                            theme={entityData.theme}
                                                            size={64}
                                                            isGroup={entityData.isGroup}
                                                            bgColor={entityData.bgColor}
                                                        />
                                                    ) : (
                                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={tx.paid ? 'text-[#dc8379]' : 'text-[#f97766]'}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                                            <circle cx="12" cy="7" r="4" />
                                                        </svg>
                                                    );
                                                })()}
                                            </div>
                                            <span className={`text-xs font-bold uppercase tracking-wider max-w-[90px] truncate text-center ${tx.paid ? 'text-[#dc8379]/70 line-through' : 'text-[#f97766]'}`}>{getEntityName(tx.from)}</span>
                                            <span className="text-[#f97766]/50 text-[10px] uppercase font-bold">Owes</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-1">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${tx.paid ? 'text-[#4c0e36]/40' : 'text-[#f97766]/30 animate-pulse'}`}>
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </div>

                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`w-16 h-16 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${tx.paid ? 'bg-[#4c0e36]/30 border-[#dc8379]/30 shadow-[0_0_10px_rgba(76,14,54,0.4)]' : 'bg-[#f97766]/20 border-[#f97766]/40 shadow-[0_0_10px_rgba(249,119,102,0.2)]'}`}>
                                                {(() => {
                                                    const entityData = getEntityData(tx.to);
                                                    return entityData ? (
                                                        <Avatar
                                                            face={entityData.face}
                                                            accessories={entityData.accessories}
                                                            theme={entityData.theme}
                                                            size={64}
                                                            isGroup={entityData.isGroup}
                                                            bgColor={entityData.bgColor}
                                                        />
                                                    ) : (
                                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={tx.paid ? 'text-[#dc8379]' : 'text-[#f97766]'}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                                            <circle cx="12" cy="7" r="4" />
                                                        </svg>
                                                    );
                                                })()}
                                            </div>
                                            <span className={`text-xs font-bold uppercase tracking-wider max-w-[90px] truncate text-center ${tx.paid ? 'text-[#dc8379]/70 line-through' : 'text-[#f97766]'}`}>{getEntityName(tx.to)}</span>
                                            <span className="text-[#f97766]/50 text-[10px] uppercase font-bold">To Receive</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-[#f97766]/60 text-[10px] uppercase font-black tracking-tighter">Amount to pay</span>
                                            <span className={`text-3xl font-black ${tx.paid ? 'text-[#dc8379]' : 'text-[#f97766]'}`}>${Math.round(tx.amount)}</span>
                                        </div>
                                        <button
                                            onClick={() => handleTogglePaid(tx._id)}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${tx.paid ? 'bg-[#4c0e36] text-[#dc8379] border-[#dc8379]/30' : 'bg-white/5 border-white/5 text-[#f97766]/30 group-hover:text-[#f97766] group-hover:border-[#f97766]/30'}`}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Edit Modal */}
            {ledger && (
                <AddExpense
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    onConfirm={handleConfirmEdit}
                    initialData={ledger}
                />
            )}
        </div>
    );
}
