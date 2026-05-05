import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ViewExpensePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ledger, setLedger] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('mockLedgers');
        if (saved) {
            const ledgers = JSON.parse(saved);
            const found = ledgers.find(l => l.id.toString() === id);
            if (found) {
                setLedger(found);
            } else {
                // Dummy fallback if not found
                setLedger({ name: `Ledger ${id}` });
            }
        } else {
            setLedger({ name: `Ledger ${id}` });
        }
    }, [id]);

    // Dummy data for transactions
    const summaryStats = {
        netExpenses: 100,
        netDue: 0,
        internalDebts: 30
    };

    const dummyTransactions = [
        { id: 1, from: 'Abi', to: 'Ahmed', amount: 100 },
        { id: 2, from: 'Ahmed', to: 'Vendor (Gift)', amount: 300 },
        { id: 3, from: 'Hale...', to: 'Vendor (Cake)', amount: 300 },
        { id: 4, from: 'Abi', to: 'Ahmed', amount: 100 },
        { id: 5, from: 'Ahmed', to: 'Vendor (Gift)', amount: 300 },
        { id: 6, from: 'Hale...', to: 'Vendor (Cake)', amount: 300 },
    ];

    if (!ledger) return <div className="p-8 text-[#f97766]">Loading...</div>;

    return (
        <div className="bg-[var(--bg-primary)] p-4 sm:p-6 md:p-8 md:pt-0 relative min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto pt-8 sm:pt-12 flex flex-col lg:flex-row gap-10 items-start">
                
                {/* Left Column: Summary */}
                <div className="w-full lg:w-[350px] flex-shrink-0 flex flex-col gap-6">
                    <div className="bg-white/5 rounded-[2rem] p-8 shadow-xl border border-[#f97766]/10 flex flex-col min-h-[500px]">
                        
                        <h2 className="text-3xl text-[#f97766] tracking-wide text-center border-b border-[#f97766]/20 pb-4 mb-6" style={{ fontFamily: 'cursive' }}>
                            {ledger.name}
                        </h2>

                        <div className="flex flex-col gap-4 mb-8">
                            <div className="flex justify-between items-center">
                                <span className="text-[#f97766]/80 text-lg">Net Expenses</span>
                                <span className="text-[#f97766] font-bold text-lg">${summaryStats.netExpenses}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#f97766]/80 text-lg">Net Due</span>
                                <span className="text-[#f97766] font-bold text-lg">${summaryStats.netDue}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#f97766]/80 text-lg">Internal Debts</span>
                                <span className="text-[#f97766] font-bold text-lg">${summaryStats.internalDebts}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 border-y border-[#f97766]/20 py-4 mb-6 justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center p-2">
                                <img src="/cake.png" alt="Cake" className="w-full h-full object-contain" />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center p-2">
                                <img src="/gift.png" alt="Gift" className="w-full h-full object-contain" />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center p-2">
                                <img src="/food.png" alt="Food" className="w-full h-full object-contain" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-6">
                            {dummyTransactions.map((tx) => (
                                <div key={tx.id} className="bg-white/5 rounded-lg p-3 flex justify-between items-center border border-transparent hover:border-[#f97766]/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[#f97766] text-sm font-medium w-16 truncate">{tx.from}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f97766]/50">
                                            <path d="M5 12h14M12 5l7 7-7 7"/>
                                        </svg>
                                        <span className="text-[#f97766] text-sm font-medium w-24 truncate">{tx.to}</span>
                                    </div>
                                    <span className="text-[#f97766] font-bold text-sm">${tx.amount}</span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-4 rounded-xl bg-[#f97766] text-[#200412] font-bold hover:bg-[#e86655] transition-colors shadow-lg">
                            Generate
                        </button>
                    </div>
                </div>

                {/* Right Column: Transactions Grid */}
                <div className="w-full flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {dummyTransactions.map((tx) => (
                            <div key={`card-${tx.id}`} className="bg-white/5 rounded-2xl p-5 border border-[#f97766]/10 hover:border-[#f97766]/30 transition-all shadow-lg flex flex-col justify-between aspect-[4/3] group">
                                <div className="flex justify-between items-center mb-6 mt-2">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-16 h-16 rounded-xl bg-white/5 border border-[#f97766]/20 flex items-center justify-center">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#f97766]/40">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                        <span className="text-[#f97766] text-sm font-medium max-w-[80px] truncate text-center">{tx.from}</span>
                                    </div>

                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f97766]/50">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>

                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-16 h-16 rounded-xl bg-white/5 border border-[#f97766]/20 flex items-center justify-center">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#f97766]/40">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                        <span className="text-[#f97766] text-sm font-medium max-w-[80px] truncate text-center">{tx.to}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mt-auto">
                                    <span className="text-[#f97766] text-2xl font-bold">${tx.amount}</span>
                                    <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#f97766]/10 border border-transparent group-hover:border-[#f97766]/30 transition-all text-[#f97766]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
