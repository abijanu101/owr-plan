import React, { useState } from 'react';
import EntitySelector from './EntitySelector';

export default function AddExpense({ isOpen, onClose, onConfirm }) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [icon, setIcon] = useState('');
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
                transactions,
                selectedEntities
            });
        }
        // Reset state
        setName('');
        setAmount('');
        setIcon('');
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
            <div className="relative w-full max-w-[900px] bg-[#4a2638] rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh] border border-[#DC8379]/20">

                {/* Header: Add Expense */}
                <div className="flex items-center gap-4 mb-8">
                    <button className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <span className="text-white text-3xl font-light leading-none mb-1.5">+</span>
                    </button>
                    <h2 className="text-2xl sm:text-3xl text-white tracking-wide" style={{ fontFamily: 'cursive' }}>
                        Add Expense
                    </h2>
                </div>

                {/* Top Row Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
                    <input
                        type="text"
                        placeholder="Enter Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-[#6b3c4f] text-white placeholder-white/80 px-5 py-4 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#f97766]/50 transition-all text-sm sm:text-base"
                    />
                    <input
                        type="text"
                        placeholder="Enter Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-[#6b3c4f] text-white placeholder-white/80 px-5 py-4 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#f97766]/50 transition-all text-sm sm:text-base"
                    />
                    <div className="relative">
                        <select
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="bg-[#6b3c4f] text-white placeholder-white/80 px-5 py-4 rounded-lg w-full outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-[#f97766]/50 transition-all text-sm sm:text-base"
                        >
                            <option value="" disabled>Select Icon</option>
                            <option value="food">Food</option>
                            <option value="travel">Travel</option>
                            <option value="shopping">Shopping</option>
                            <option value="entertainment">Entertainment</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 2L8 8L14 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={handleAddTransaction}
                        className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <span className="text-white text-3xl font-light leading-none mb-1.5">+</span>
                    </button>
                    <h3 className="text-xl sm:text-2xl text-white tracking-wide" style={{ fontFamily: 'cursive' }}>
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
                                        className="bg-[#6b3c4f] text-white placeholder-white/80 px-4 py-4 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#f97766]/50 transition-all text-sm sm:text-base"
                                    />
                                    <input
                                        type="text"
                                        placeholder="From"
                                        value={t.from}
                                        onChange={(e) => handleTransactionChange(t.id, 'from', e.target.value)}
                                        className="bg-[#6b3c4f] text-white placeholder-white/80 px-4 py-4 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#f97766]/50 transition-all text-sm sm:text-base"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Amount"
                                        value={t.amount}
                                        onChange={(e) => handleTransactionChange(t.id, 'amount', e.target.value)}
                                        className="bg-[#6b3c4f] text-white placeholder-white/80 px-4 py-4 rounded-lg w-full outline-none focus:ring-2 focus:ring-[#f97766]/50 transition-all text-sm sm:text-base"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add People Section */}
                    <div className="flex flex-col gap-3 w-full">
                        <div className="bg-[#6b3c4f] rounded-lg overflow-hidden relative border border-transparent hover:border-white/10 transition-colors">
                            {/* We use EntitySelector directly. We set a custom placeholder-like style if empty */}
                            {selectedEntities.length === 0 && (
                                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-between px-5">
                                    <span className="text-white text-sm sm:text-base">Add People</span>
                                    <svg className="text-white" width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                        className="bg-[#f97766] hover:bg-[#e86655] text-white px-8 py-3 rounded-full font-bold tracking-wide transition-colors shadow-lg"
                    >
                        Confirm
                    </button>
                </div>

                {/* Close Button (top right) */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors text-xl font-bold rounded-full hover:bg-white/10"
                >
                    ✕
                </button>

            </div>
        </div>
    );
}
