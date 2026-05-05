import React, { useState } from 'react';
import EntitySelector from './EntitySelector';
import IconButton from './IconButton';
import DateTimePicker from './pickers/DateTimePicker';

export default function AddExpense({ isOpen, onClose, onConfirm }) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [icon, setIcon] = useState('');
    const [selectedDateTime, setSelectedDateTime] = useState({ date: new Date(), time: '12:00 PM' });
    const [selectedEntities, setSelectedEntities] = useState([]);
    const [transactions, setTransactions] = useState([{ id: Date.now(), to: '', from: '', amount: '' }]);

    const handleAddTransaction = () => {
        setTransactions([...transactions, { id: Date.now(), to: '', from: '', amount: '' }]);
    };

    const handleTransactionChange = (id, field, value) => {
        setTransactions(transactions.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm({
                id: Date.now(),
                name,
                amount,
                icon,
                selectedDateTime,
                transactions,
                selectedEntities
            });
        }
        // Reset state
        setName('');
        setAmount('');
        setIcon('');
        setSelectedDays([]);
        setSelectedEntities([]);
        setTransactions([{ id: Date.now(), to: '', from: '', amount: '' }]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[900px] bg-[var(--bg-primary)] rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh] border border-[#DC8379]/20">

                {/* Header: Add Expense */}
                <div className="flex items-center gap-4 mb-8">
                    <button className="w-10 h-10 rounded-full border border-[#f97766]/40 flex items-center justify-center hover:bg-[#f97766]/10 transition-colors">
                        <span className="text-[#f97766] text-3xl font-light leading-none mb-1.5">+</span>
                    </button>
                    <h2 className="text-2xl sm:text-3xl text-[#f97766] tracking-wide" style={{ fontFamily: 'cursive' }}>
                        Add Expense
                    </h2>
                </div>

                {/* Top Row Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                    <input
                        type="text"
                        placeholder="Enter Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-white/5 text-[#f97766] placeholder-[#f97766]/50 px-5 py-4 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#f97766]/50 transition-all text-sm sm:text-base"
                    />
                    <input
                        type="text"
                        placeholder="Enter Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-white/5 text-[#f97766] placeholder-[#f97766]/50 px-5 py-4 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#f97766]/50 transition-all text-sm sm:text-base"
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 bg-white/5 p-5 rounded-xl border border-white/5">
                    <div className="flex flex-col gap-3">
                        <span className="text-[#f97766]/80 text-sm font-medium">Select Icon:</span>
                        <div className="flex gap-4">
                            <IconButton onClick={() => setIcon('food')} label="Food">
                                <img src="/food.png" alt="Food" className={icon === 'food' ? 'w-10 h-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-110 transition-all' : 'w-10 h-10 opacity-50 hover:opacity-80 transition-all'} />
                            </IconButton>
                            <IconButton onClick={() => setIcon('gift')} label="Gift">
                                <img src="/gift.png" alt="Gift" className={icon === 'gift' ? 'w-10 h-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-110 transition-all' : 'w-10 h-10 opacity-50 hover:opacity-80 transition-all'} />
                            </IconButton>
                            <IconButton onClick={() => setIcon('cake')} label="Cake">
                                <img src="/cake.png" alt="Cake" className={icon === 'cake' ? 'w-10 h-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-110 transition-all' : 'w-10 h-10 opacity-50 hover:opacity-80 transition-all'} />
                            </IconButton>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <span className="text-[#f97766]/80 text-sm font-medium">Select Date:</span>
                        <div className="pt-2">
                            <DateTimePicker variant="inline-text" onChange={setSelectedDateTime} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={handleAddTransaction}
                        className="w-10 h-10 rounded-full border border-[#f97766]/40 flex items-center justify-center hover:bg-[#f97766]/10 transition-colors"
                    >
                        <span className="text-[#f97766] text-3xl font-light leading-none mb-1.5">+</span>
                    </button>
                    <h3 className="text-xl sm:text-2xl text-[#f97766] tracking-wide" style={{ fontFamily: 'cursive' }}>
                        Add Transaction
                    </h3>
                </div>

                {/* Bottom Area: Transactions + Entity Selector */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

                    {/* Transactions Grid */}
                    <div className="flex flex-col gap-3">
                        {/* Headers */}
                        {/* <div className="grid grid-cols-3 gap-3">
                            <div className="bg-[#6b3c4f] text-white/90 px-4 py-3 rounded-lg text-sm sm:text-base font-medium">To</div>
                            <div className="bg-[#6b3c4f] text-white/90 px-4 py-3 rounded-lg text-sm sm:text-base font-medium">From</div>
                            <div className="bg-[#6b3c4f] text-white/90 px-4 py-3 rounded-lg text-sm sm:text-base font-medium">Amount</div>
                        </div> */}
                        {/* Rows */}
                        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                            {transactions.map((t) => (
                                <div key={t.id} className="grid grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        placeholder="To"
                                        value={t.to}
                                        onChange={(e) => handleTransactionChange(t.id, 'to', e.target.value)}
                                        className="bg-white/5 text-[#f97766] placeholder-[#f97766]/50 px-4 py-4 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#f97766]/50 transition-all text-sm sm:text-base"
                                    />
                                    <input
                                        type="text"
                                        placeholder="From"
                                        value={t.from}
                                        onChange={(e) => handleTransactionChange(t.id, 'from', e.target.value)}
                                        className="bg-white/5 text-[#f97766] placeholder-[#f97766]/50 px-4 py-4 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#f97766]/50 transition-all text-sm sm:text-base"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Amount"
                                        value={t.amount}
                                        onChange={(e) => handleTransactionChange(t.id, 'amount', e.target.value)}
                                        className="bg-white/5 text-[#f97766] placeholder-[#f97766]/50 px-4 py-4 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#f97766]/50 transition-all text-sm sm:text-base"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add People Section */}
                    <div className="flex flex-col gap-3 w-full">
                        <div className="bg-white/5 rounded-lg overflow-hidden relative border border-transparent hover:border-[#f97766]/30 transition-colors">
                            {/* We use EntitySelector directly. We set a custom placeholder-like style if empty */}
                            {selectedEntities.length === 0 && (
                                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-between px-5">
                                    <span className="text-[#f97766]/50 text-sm sm:text-base">Add People</span>
                                    <svg className="text-[#f97766]/50" width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 2L8 8L14 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}

                            <div className={`relative z-10 ${selectedEntities.length === 0 ? 'opacity-0' : 'opacity-100'} hover:opacity-100 transition-opacity`}>
                                <EntitySelector
                                    selectedIds={selectedEntities}
                                    onChange={setSelectedEntities}
                                    variant="table"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Action Buttons */}
                <div className="flex justify-end mt-8 border-t border-white/10 pt-6">
                    <button
                        onClick={handleConfirm}
                        className="bg-[#f97766] hover:bg-[#e86655] text-[#200412] px-8 py-3 rounded-full font-bold tracking-wide transition-colors shadow-lg"
                    >
                        Confirm
                    </button>
                </div>

                {/* Close Button (top right) */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-[#f97766]/50 hover:text-[#f97766] transition-colors text-xl font-bold rounded-full hover:bg-[#f97766]/10"
                >
                    ×
                </button>

            </div>
        </div>
    );
}
