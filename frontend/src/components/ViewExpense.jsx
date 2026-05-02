import React from 'react';

export default function ViewExpense({ isOpen, onClose, expense }) {
    if (!isOpen) return null;

    // Dummy data fallback based on the image
    const dummyData = {
        name: 'Post Mid Hangout',
        totalAmount: 2500,
        date: '25 March 2026',
        people: [
            {
                name: 'Ansa',
                checked: true,
                transactions: [
                    { amount: 240, to: 'Abi', checked: true },
                    { amount: 300, to: 'Alizeh', checked: true }
                ]
            }
        ]
    };

    // Merge the provided expense with dummy data to ensure required fields exist
    const data = {
        ...dummyData,
        ...(expense || {})
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[800px] bg-[#3a1d29] rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh] border border-[#DC8379]/20">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-8 text-white/50 hover:text-white transition-colors text-2xl font-bold"
                >
                    ✕
                </button>

                {/* Header Section */}
                <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-6 mb-8 mt-2">
                    <div className="flex items-center gap-4">
                        <svg className="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <span className="text-white text-xl sm:text-2xl font-medium tracking-wide">{data.name}</span>
                    </div>
                    <div className="text-white/90 text-sm sm:text-base tracking-wide">
                        Total Amount: Rs {data.totalAmount}
                    </div>
                    <div className="text-white/90 text-sm sm:text-base tracking-wide">
                        Date: {data.date}
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-col gap-5 bg-[#4e2739] p-6 rounded-[1.5rem] border border-white/5">
                    {data.people.map((person, idx) => (
                        <div key={idx} className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-white/60 text-xl font-bold w-4 text-center cursor-pointer hover:text-white">-</span>
                                <label className="flex items-center gap-4 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border-2 ${person.checked ? 'bg-transparent border-white' : 'border-white/50 group-hover:border-white'}`}>
                                        {person.checked && (
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-white text-lg tracking-wide">{person.name}</span>
                                </label>
                            </div>

                            <div className="flex flex-col gap-3 pl-[3.25rem]">
                                {person.transactions.map((tx, tIdx) => (
                                    <label key={tIdx} className="flex items-center gap-4 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors border-2 ${tx.checked ? 'bg-transparent border-white' : 'border-white/50 group-hover:border-white'}`}>
                                            {tx.checked && (
                                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-white/80 text-sm sm:text-base">{tx.amount} to {tx.to}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
