import React, { useState, useEffect } from 'react';
import ConstraintTable from '../components/Plan/ConstraintTable';
import StructuredSidebar from '../components/Plan/StructuredSidebar';
import ActionBar from '../components/Plan/ActionBar'; // For mobile view
import { getDefaultParameter } from '../components/Plan/ConstraintSchema';

export default function StructuredPlan() {
    const [mode, setMode] = useState('global');
    
    // Default initial states
    const defaultGlobal = [
        { id: 1, modifier: 'can', type: 'be between', parameter: getDefaultParameter('be between') },
        { id: 2, modifier: 'can not', type: 'be on', parameter: getDefaultParameter('be on') },
        { id: 3, modifier: 'must', type: 'last for', parameter: { hours: 1, minutes: 30 } }
    ];
    
    const defaultLocal = [
        { 
            id: 1, 
            modifier: 'must', 
            entity: ['1'], // Mock entity ID
            children: [
                { id: 101, modifier: '', type: 'end before', parameter: "16:00" },
                { id: 102, modifier: '', type: 'pad', parameter: { hours: 0, minutes: 30 } }
            ]
        }
    ];

    const [globalConstraints, setGlobalConstraints] = useState(defaultGlobal);
    const [localBlocks, setLocalBlocks] = useState(defaultLocal);
    
    // Status Mocking
    const [status, setStatus] = useState({ consistent: true, message: "Constraints consistent, you may generate." });

    const handleReset = () => {
        setGlobalConstraints(defaultGlobal);
        setLocalBlocks(defaultLocal);
        setStatus({ consistent: true, message: "Constraints consistent, you may generate." });
    };

    const handleGenerate = () => {
        console.log('Generating structured plan with:', { mode, globalConstraints, localBlocks });
        // Generation logic here
    };

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024); // lg breakpoint
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="bg-[var(--bg-primary)] p-4 sm:p-6 md:p-8 md:pt-0 relative overflow-x-hidden min-h-screen pb-32 lg:pb-8">
            <div className="max-w-5xl mx-auto pt-4 sm:pt-6">
                
                {/* Mobile specific headers */}
                {isMobile && (
                    <div className="mb-6 flex flex-col gap-6">
                        <div className="inline-block px-5 py-2 rounded-full bg-[var(--bg-raised)] border border-[var(--border-subtle)] shadow-xl mx-auto">
                            <span className="text-[18px] text-[#DC8379] font-normal tracking-wide" style={{ fontFamily: 'cursive' }}>
                                Define Constraints
                            </span>
                        </div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setMode('global')}
                                className={`flex-1 py-3 rounded-xl border flex items-center justify-center text-center transition-all cursor-pointer shadow-md
                                    ${mode === 'global' ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border-[var(--color-primary)] shadow-[0_0_15px_rgba(249,119,102,0.3)]' : 'bg-[var(--bg-raised)] text-[#DC8379] border-[var(--border-subtle)]'}`}
                            >
                                <span className="text-sm font-bold" style={{ fontFamily: 'cursive' }}>Global</span>
                            </button>
                            <button 
                                onClick={() => setMode('local')}
                                className={`flex-1 py-3 rounded-xl border flex items-center justify-center text-center transition-all cursor-pointer shadow-md
                                    ${mode === 'local' ? 'bg-[var(--color-primary)] text-[var(--bg-primary)] border-[var(--color-primary)] shadow-[0_0_15px_rgba(249,119,102,0.3)]' : 'bg-[var(--bg-raised)] text-[#DC8379] border-[var(--border-subtle)]'}`}
                            >
                                <span className="text-sm font-bold" style={{ fontFamily: 'cursive' }}>Local</span>
                            </button>
                        </div>

                        {/* Mobile Status Box */}
                        <div className={`p-4 rounded-xl flex items-center gap-3 transition-colors duration-300 ${status.consistent !== false ? 'bg-black/20' : 'bg-[#1a0f12] border border-red-900/30'}`}>
                            <div className="shrink-0 relative scale-75">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill={status.consistent !== false ? "#5a3a45" : "#4a2a35"} className="transition-colors">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                {status.consistent === false && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#24141c" strokeWidth="3" className="rotate-45">
                                            <line x1="12" y1="2" x2="12" y2="22" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-xs leading-snug" style={{ fontFamily: 'sans-serif' }}>
                                {status.consistent !== false ? (
                                    <span className="text-muted">Constraints <span className="text-[#DC8379] font-bold">consistent</span>, you may generate.</span>
                                ) : (
                                    <span className="text-muted" dangerouslySetInnerHTML={{ __html: status.message.replace(/inconsistent/, '<span class="text-[#DC8379] font-bold">inconsistent</span>') }} />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full items-start">
                    
                    {/* Left Column: Constraints Table */}
                    <div className="flex-1 w-full lg:w-auto">
                        <ConstraintTable 
                            mode={mode} 
                            globalConstraints={globalConstraints}
                            localBlocks={localBlocks}
                            onChangeGlobal={setGlobalConstraints}
                            onChangeLocal={setLocalBlocks}
                            isMobile={isMobile}
                        />
                    </div>

                    {/* Right Column: Sidebar (Hidden on Mobile, replaced by ActionBar) */}
                    {!isMobile && (
                        <div className="sticky top-8">
                            <StructuredSidebar 
                                mode={mode} 
                                setMode={setMode} 
                                status={status} 
                                onReset={handleReset} 
                                onGenerate={handleGenerate}
                                isMobile={false}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Action Bar */}
            <ActionBar 
                onReset={handleReset} 
                onGenerate={handleGenerate} 
                currentView="structured"
            />
        </div>
    );
}
