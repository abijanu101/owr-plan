import React, { useState } from 'react';
import AddExpense from '../components/AddExpense';
import HeartOrbitAnimation from '../components/HeartOrbitAnimation';
import { useNavigate } from 'react-router-dom';

export default function AddExpensePage() {
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const navigate = useNavigate();

    const handleConfirmExpense = (newExpense) => {
        setCurrentExpense(newExpense);
        setIsAddExpenseOpen(false);
    };

    return (
        <div className="bg-[var(--bg-primary)] p-4 sm:p-6 md:p-8 md:pt-0 relative min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto pt-8 sm:pt-12">

                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => navigate('/ledgers')}
                        className="w-10 h-10 rounded-full border border-white/60 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-3xl text-[#f97766] tracking-wide" style={{ fontFamily: 'cursive' }}>
                        Expense Summary
                    </h2>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

                    {/* Left Column: Summary */}
                    <div className="bg-[#200412] rounded-[2rem] p-8 shadow-xl border border-[#DC8379]/10 min-h-[400px] flex flex-col">
                        {!currentExpense ? (
                            <div className="flex flex-col items-center justify-center h-full flex-1 text-center opacity-80">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[#f97766] mb-4">
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                                <p className="text-[#f97766] text-lg font-medium">No expenses to summarize</p>
                                <p className="text-[#f97766]/80 text-sm mt-2 max-w-[200px] mx-auto">Create a shared expense first to see who owes whom.</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl text-[#f97766] mb-6">Overview</h3>

                                <div className="bg-[#200412] rounded-xl p-6 mb-8 text-center border border-[#f97766]/20">
                                    <p className="text-[#f97766]/80 text-sm mb-2">Overall Net Expense</p>
                                    <p className="text-4xl text-[#f97766] font-bold">${currentExpense.amount || 0}</p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xl text-[#f97766] mb-4 border-b border-white/10 pb-2">Transactions</h4>
                                    {currentExpense.transactions?.map((t, i) => (
                                        <div key={t.id || i} className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[#f97766] font-medium">{t.from || 'Someone'}</span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f97766]">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                                <span className="text-[#f97766] font-medium">{t.to || 'Someone'}</span>
                                            </div>
                                            <span className="text-[#f97766]/90 font-bold">${t.amount || 0}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column: Action Area / Details */}
                    {!currentExpense ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-[#200412] rounded-[2rem] p-8 border border-dashed border-[#DC8379]/30 hover:border-[#DC8379]/60 transition-colors cursor-pointer group"
                            onClick={() => setIsAddExpenseOpen(true)}>
                            <div className="w-20 h-20 rounded-full border-2 border-[#f97766]/40 flex items-center justify-center group-hover:bg-[#f97766]/10 transition-all mb-6 group-hover:scale-105">
                                <span className="text-[#f97766] text-5xl font-light leading-none mb-2">+</span>
                            </div>
                            <h3 className="text-2xl text-[#f97766] tracking-wide text-center" style={{ fontFamily: 'cursive' }}>
                                Click to add shared expense
                            </h3>
                            <p className="text-[#f97766]/70 text-center mt-4 max-w-[250px]">
                                Add a new expense, select participants, and divide the cost.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-[#200412] rounded-[2rem] p-8 shadow-xl border border-[#f97766]/30 min-h-[400px]">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-2xl text-[#f97766]">Expense Details</h3>
                                {currentExpense.icon && (
                                    <div className="w-16 h-16 rounded-full bg-[#f97766]/10 flex items-center justify-center border border-[#f97766]/20 p-2">
                                        <img src={`/${currentExpense.icon}.png`} alt={currentExpense.icon} className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-[#f97766]/60 text-sm mb-1">Name</p>
                                    <p className="text-xl text-[#f97766] font-medium">{currentExpense.name}</p>
                                </div>

                                <div>
                                    <p className="text-[#f97766]/60 text-sm mb-1">Total Amount</p>
                                    <p className="text-2xl text-[#f97766] font-bold">${currentExpense.amount}</p>
                                </div>

                                {currentExpense.selectedDateTime && (
                                    <div>
                                        <p className="text-[#f97766]/60 text-sm mb-2">Date Selected</p>
                                        <div className="flex gap-2">
                                            <span className="bg-[#f97766] text-[#200412] text-xs font-bold px-3 py-1.5 rounded-full">
                                                {new Date(currentExpense.selectedDateTime.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {currentExpense.selectedDateTime.time}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 mt-8">
                                    <button 
                                        onClick={() => setIsAddExpenseOpen(true)}
                                        className="w-1/3 py-4 rounded-xl border border-[#f97766]/20 text-[#f97766] font-medium hover:bg-[#f97766]/10 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const saved = localStorage.getItem('mockLedgers');
                                            const ledgers = saved ? JSON.parse(saved) : [
                                                { id: 1, name: 'After-Mid Hangout', icon: 'food', date: 'Oct 14, 2026' },
                                                { id: 2, name: "Abi's Birthday", icon: 'cake', date: 'Oct 16, 2026' },
                                                { id: 3, name: 'Iftar Party', icon: 'food', date: 'Oct 18, 2026' }
                                            ];
                                            const newLedger = { ...currentExpense, id: Date.now() };
                                            localStorage.setItem('mockLedgers', JSON.stringify([...ledgers, newLedger]));
                                            
                                            setIsAnimating(true);
                                            setTimeout(() => {
                                                navigate('/ledgers');
                                            }, 3000);
                                        }}
                                        className="w-2/3 py-4 rounded-xl bg-[#f97766] hover:bg-[#e86655] text-[#200412] font-bold transition-colors shadow-lg shadow-[#f97766]/20"
                                    >
                                        Add to Ledger
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Add Expense Modal */}
            <AddExpense
                isOpen={isAddExpenseOpen}
                onClose={() => setIsAddExpenseOpen(false)}
                onConfirm={handleConfirmExpense}
            />

            {/* Orbit Animation Overlay */}
            {isAnimating && <HeartOrbitAnimation />}
        </div>
    );
}
