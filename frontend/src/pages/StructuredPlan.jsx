import React, { useState, useEffect } from 'react';
import ConstraintTable from '../components/Plan/Constraints/ConstraintTable';
import ActionBar from '../components/Plan/UI/ActionBar';
import { usePlan } from '../context/PlanContext';
import { useNavigate } from 'react-router-dom';
import PlanStatus from '../components/Plan/UI/PlanStatus';

export default function StructuredPlan() {
    const { constraints, setConstraints, resetPlan, setIsGenerating, setResults } = usePlan();
    const navigate = useNavigate();

    const handleReset = () => {
        resetPlan();
    };

    const handleGenerate = () => {
        setIsGenerating(true);
        navigate('/plan/results');

        // Mock generation delay and results
        setTimeout(() => {
            setResults({
                bestOption: {
                    date: "May 2",
                    time: "02:00 PM",
                    duration: "1.5hr",
                    score: 98,
                    attendees: ["Zoha", "Areeba", "Ayesha", "Moomal", "Huda", "Sara", "Fatima", "Zainab"]
                },
                alternatives: [
                    { date: "May 2", time: "04:30 PM", duration: "1.5hr", score: 85, attendees: ["Zoha", "Areeba", "Ayesha", "Moomal", "Huda", "Sara"] },
                    { date: "May 3", time: "10:00 AM", duration: "2hr", score: 72, attendees: ["Zoha", "Areeba", "Moomal", "Huda", "Sara", "Fatima"] }
                ]
            });
            setIsGenerating(false);
        }, 2000);
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
            <div className="max-w-[1200px] mx-auto pt-4 sm:pt-6">

                <div className="flex flex-col gap-4 mb-4 lg:mb-6">
                    <h1 className="text-3xl sm:text-4xl text-[#f97766] font-normal tracking-wide text-center lg:text-left" style={{ fontFamily: 'cursive' }}>
                        Define Constraints
                    </h1>
                    <hr className="border-t border-[#DC8379]/10 w-full max-w-5xl mx-auto lg:mx-0" />
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
                status={status}
            />
        </div>
    );
}
