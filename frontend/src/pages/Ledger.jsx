import React, { useState } from 'react';
import AddExpense from '../components/AddExpense';
import ViewExpense from '../components/ViewExpense';

export default function Ledger() {
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [viewingExpense, setViewingExpense] = useState(null);

    // Mock data based on the ledger list image
    const [ledgers, setLedgers] = useState([
        { id: 1, name: 'After-Mid Hangout' },
        { id: 2, name: "Abi's Birthday" },
        { id: 3, name: 'Iftar Party' }
    ]);

    const handleConfirmExpense = (newExpense) => {
        // We ensure name isn't empty for display purposes
        const expenseName = newExpense.name || 'Unnamed Expense';
        setLedgers([...ledgers, { ...newExpense, name: expenseName }]);
    };

    return (
        <div className="bg-[var(--bg-primary)] p-4 sm:p-6 md:p-8 md:pt-0 relative min-h-screen">
            <div className="max-w-5xl mx-auto pt-8 sm:pt-12">

                {/* Add Expense Button Trigger */}
                <button
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="flex items-center gap-4 mb-8 group outline-none"
                >
                    <div className="w-10 h-10 rounded-full border border-white/60 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <span className="text-white text-3xl font-light leading-none mb-1.5">+</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl text-white tracking-wide" style={{ fontFamily: 'cursive' }}>
                        Add Expense
                    </h2>
                </button>

                <div className="flex flex-col gap-5">
                    {ledgers.map((ledger) => (
                        <div
                            key={ledger.id}
                            onClick={() => setViewingExpense(ledger)}
                            className="w-full bg-[#4a2638] rounded-[2rem] px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between border border-[#DC8379]/10 hover:border-white/20 hover:bg-[#5a2e48] transition-all shadow-lg cursor-pointer group"
                        >
                            <span className="text-white text-lg sm:text-xl tracking-wide group-hover:underline underline-offset-2">{ledger.name}</span>

                            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                                {/* Edit Icon */}
                                <button className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                {/* Delete Icon */}
                                <button className="text-white/80 hover:text-red-400 transition-colors p-2 hover:bg-white/10 rounded-lg">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Add Expense Modal */}
            <AddExpense
                isOpen={isAddExpenseOpen}
                onClose={() => setIsAddExpenseOpen(false)}
                onConfirm={handleConfirmExpense}
            />

            {/* View Expense Modal */}
            <ViewExpense
                isOpen={viewingExpense !== null}
                onClose={() => setViewingExpense(null)}
                expense={viewingExpense}
            />
        </div>
    );
}
