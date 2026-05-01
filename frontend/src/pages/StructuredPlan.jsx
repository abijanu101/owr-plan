import React from 'react';

export default function StructuredPlan() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-8 md:p-12 relative overflow-x-hidden flex flex-col items-center">
            <div className="max-w-4xl w-full">
                <h1 className="text-[36px] sm:text-[48px] text-[#f97766] font-normal tracking-wide text-center mb-12" style={{ fontFamily: 'cursive' }}>
                    Structured Planning
                </h1>
                
                <div className="bg-[var(--bg-raised)] rounded-[2.5rem] p-12 border border-[var(--border-subtle)] shadow-xl text-center">
                    <p className="text-[#DC8379]/60 text-xl italic" style={{ fontFamily: 'cursive' }}>
                        This is where we will have greater control over constraints...
                    </p>
                    <div className="mt-8">
                        {/* Placeholder for complex constraints */}
                        <div className="h-64 border-2 border-dashed border-[#DC8379]/20 rounded-[2rem] flex items-center justify-center">
                            <span className="text-[#DC8379]/30">Advanced Constraints Editor Coming Soon</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
