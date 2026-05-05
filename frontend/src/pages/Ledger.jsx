import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Ledger() {
    const navigate = useNavigate();

    // Use localStorage to persist the mock data across page navigations
    const [ledgers, setLedgers] = useState(() => {
        const saved = localStorage.getItem('mockLedgers');
        if (saved) return JSON.parse(saved);
        return [
            { id: 1, name: 'After-Mid Hangout', icon: 'food', date: 'Oct 14, 2026' },
            { id: 2, name: "Abi's Birthday", icon: 'cake', date: 'Oct 16, 2026' },
            { id: 3, name: 'Iftar Party', icon: 'food', date: 'Oct 18, 2026' }
        ];
    });

    React.useEffect(() => {
        localStorage.setItem('mockLedgers', JSON.stringify(ledgers));
    }, [ledgers]);

    const handleConfirmExpense = (newExpense) => {
        // We ensure name isn't empty for display purposes
        const expenseName = newExpense.name || 'Unnamed Expense';
        setLedgers([...ledgers, { ...newExpense, name: expenseName }]);
    };

    const handleDeleteLedger = (e, id) => {
        e.stopPropagation();
        setLedgers(ledgers.filter(ledger => ledger.id !== id));
    };

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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ledgers.map((ledger) => (
                        <div
                            key={ledger.id}
                            onClick={() => navigate(`/ledgers/${ledger.id}`)}
                            className="relative bg-[#200412] rounded-[2rem] p-6 border-2 border-[#f97766]/20 shadow-[0_0_15px_rgba(249,119,102,0.1)] hover:border-[#f97766]/50 hover:shadow-[0_0_25px_rgba(249,119,102,0.25)] hover:bg-[#190410] transition-all duration-300 cursor-pointer group hover:scale-[1.03] flex flex-col items-center min-h-[220px]"
                        >
                            {/* Delete Icon */}
                            <button 
                                onClick={(e) => handleDeleteLedger(e, ledger.id)}
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
                                    <div className="w-20 h-20 flex items-center justify-center">
                                        <img src={`/${ledger.icon || 'food'}.png`} alt={ledger.name} className="w-full h-full object-contain drop-shadow-md" />
                                    </div>
                                </div>

                                {/* Details Container (Name, Line, Date, Participants) */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[20px] flex flex-col items-center group-hover:items-start transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-x-[10%] group-hover:-translate-y-[50%] w-[75%]">
                                    
                                    {/* Name */}
                                    <span className="text-[#f97766] text-xl tracking-wide font-bold transition-all duration-500 text-center group-hover:text-left w-full line-clamp-2">
                                        {ledger.name}
                                    </span>

                                    {/* Condensed Info (Visible before hover) */}
                                    <div className="text-[#f97766]/50 text-xs mt-1 transition-all duration-500 group-hover:opacity-0 group-hover:h-0 overflow-hidden text-center w-full">
                                        {ledger.date || (ledger.selectedDateTime ? new Date(ledger.selectedDateTime.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Date')} | {ledger.participants || 'Ansa, Abi +2'} | ${ledger.amount || 0}
                                    </div>

                                    {/* Reveal Section */}
                                    <div className="flex flex-col items-start w-full overflow-hidden transition-all duration-500 max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 group-hover:mt-3">
                                        <div className="w-3/5 h-px bg-[#f97766]/30 mb-2"></div>
                                        <span className="text-[#f97766]/70 text-sm tracking-wide font-medium mb-1">
                                            {ledger.date || (ledger.selectedDateTime ? new Date(ledger.selectedDateTime.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date')}
                                        </span>
                                        <span className="text-[#f97766]/50 text-xs italic font-medium mb-1">
                                            {ledger.participants || 'Ansa, Abi and 2+'}
                                        </span>
                                        <span className="text-[#f97766] text-sm font-bold">
                                            Total: ${ledger.amount || 0}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
