import React, { useState, useEffect } from 'react';
import ConstraintTable from '../components/Plan/Constraints/ConstraintTable';
import ActionBar from '../components/Plan/UI/ActionBar';
import { usePlan } from '../context/PlanContext';
import { useNavigate } from 'react-router-dom';
import PlanStatus from '../components/Plan/UI/PlanStatus';
import { generatePlan } from '../api/planApi';

export default function StructuredPlan() {
    const { constraints, setConstraints, resetPlan, setIsGenerating, setResults, showToast, planStatus } = usePlan();
    const navigate = useNavigate();

    const handleReset = () => {
        resetPlan();
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        navigate('/plan/results');

        try {
            const results = await generatePlan(constraints);
            setResults(results);
        } catch (error) {
            console.error('Failed to generate plan:', error);
            showToast('Failed to generate plan. Please try again.', 'error');
            // Optionally navigate back if generation failed
            // navigate('/plan/constraints');
        } finally {
            setIsGenerating(false);
        }
    };

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024); // lg breakpoint
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const HelpModal = () => {
        if (!showHelp) return null;
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
                <div className="bg-[var(--bg-primary)] border border-[#DC8379]/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-[#DC8379]/60 hover:text-[#DC8379]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <h2 className="text-2xl text-[#f97766] mb-4" style={{ fontFamily: 'cursive' }}>Constraints Help</h2>
                    <div className="text-[#DC8379]/80 space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-2" style={{ fontFamily: 'sans-serif' }}>
                        <p>Welcome to the <strong>Structured Plan Constraints</strong> page. Here you can define the rules that the planner must follow to generate your schedule.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>System Constraints:</strong> These are core rules automatically added for the plan (e.g., overall duration, start/end boundaries). You cannot delete them, but you can disable them or change their values.</li>
                            <li><strong>Custom Constraints:</strong> These are additional rules you create. You can limit certain times, force specific entities to be included, or set specific dates.</li>
                            <li><strong>Constraint Blocks:</strong> Useful when you want to group multiple rules under a single modifier (e.g., "These 3 entities must ALL follow these 2 rules").</li>
                            <li><strong>Modifiers:</strong> You can set rules as <em>must</em> (strictly enforced), <em>should</em> (preferred but not strictly required), <em>can</em>, or <em>can not</em>.</li>
                        </ul>
                        <p className="italic text-[#DC8379]/60 mt-4">Hover over the ⓘ icon next to each constraint type in the table for a specific explanation.</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[var(--bg-primary)] p-4 sm:p-6 md:p-8 md:pt-0 relative overflow-x-hidden min-h-screen pb-32 lg:pb-8">
            <div className="max-w-[1200px] mx-auto pt-4 sm:pt-6">

                <div className="flex flex-col gap-4 mb-4 lg:mb-6 relative max-w-5xl mx-auto lg:mx-0">
                    <div className="flex items-center w-full relative justify-center lg:justify-between">
                        <h1 className="text-3xl sm:text-4xl text-[#f97766] font-normal tracking-wide" style={{ fontFamily: 'cursive' }}>
                            Define Constraints
                        </h1>
                        <button 
                            onClick={() => setShowHelp(true)}
                            className="w-10 h-10 rounded-full border border-[#f97766] flex items-center justify-center text-[#f97766] hover:bg-[#f97766]/10 transition-all cursor-pointer absolute right-0 lg:static shrink-0 hover:scale-105"
                            title="Help"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        </button>
                    </div>
                    <hr className="border-t border-[#DC8379]/10 w-full" />
                </div>

                <div className="lg:hidden mb-6">
                    <PlanStatus variant="mobile" />
                </div>

                <div className="flex flex-col w-full items-start">
                    {/* Constraints Table */}
                    <div className="w-full">
                        <ConstraintTable
                            constraints={constraints}
                            onChange={setConstraints}
                            isMobile={isMobile}
                        />
                    </div>
                </div>
            </div>

            {/* Fixed Action Bar */}
            <ActionBar
                onReset={handleReset}
                onGenerate={handleGenerate}
                currentView="structured"
                generateDisabled={!planStatus.consistent}
            />

            <HelpModal />
        </div>
    );
}
