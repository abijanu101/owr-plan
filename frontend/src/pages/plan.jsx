import { Link, useNavigate } from 'react-router-dom';
import { usePlan } from '../context/PlanContext';
import EntitySelector from '../components/EntitySelector';
import SimplifiedConstraintPicker from '../components/Plan/SimplifiedConstraintPicker';
import ActionBar from '../components/Plan/ActionBar';
import PlanStatus from '../components/Plan/PlanStatus';

export default function Plan() {
    const { constraints, getSimplifiedConstraintParameter, updateSimplifiedConstraint, resetPlan, setIsGenerating, setResults, planStatus } = usePlan();
    const navigate = useNavigate();
    const hasCustomConstraints = constraints.some(c => !c.isSystem);
    const selectedEntities = getSimplifiedConstraintParameter('include') || [];
    const duration = getSimplifiedConstraintParameter('last for') || { hours: 1, minutes: 30 };
    const range = getSimplifiedConstraintParameter('be between') || {
        start: { date: new Date(2026, 3, 29), time: "08:00 AM" },
        end: { date: new Date(2026, 3, 30), time: "11:59 PM" }
    };

    const handleReset = () => {
        resetPlan();
    };

    const handleGenerate = () => {
        if (!planStatus.consistent) return;
        
        setIsGenerating(true);
        navigate('/plan/results');
        
        // Mock generation delay and results
        setTimeout(() => {
            setResults({
                bestOption: {
                    startTime: "Saturday, May 2 at 02:00 PM",
                    endTime: "Saturday, May 2 at 03:30 PM",
                    score: 98,
                    explanation: "This slot fits perfectly within the requested window and matches all attendee availability."
                },
                alternatives: [
                    { startTime: "Saturday, May 2 at 04:00 PM", endTime: "05:30 PM", score: 85, explanation: "Most attendees are free, but Zoha has a potential overlapping activity." },
                    { startTime: "Sunday, May 3 at 10:00 AM", endTime: "11:30 AM", score: 72, explanation: "Morning slot that works for everyone, but is outside the primary preferred window." }
                ]
            });
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="bg-[var(--bg-primary)] min-h-screen pb-40 relative overflow-y-auto overflow-x-hidden">
            {/* Top Level Notice */}
            {hasCustomConstraints && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6">
                    <div className="flex items-center gap-3 bg-[#DC8379]/5 border border-[#DC8379]/10 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 w-full">
                        <div className="w-8 h-8 rounded-full bg-[#DC8379]/20 flex items-center justify-center shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC8379" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-[#DC8379] text-sm font-medium" style={{ fontFamily: 'cursive' }}>
                                Additional custom constraints are active.
                            </p>
                            <p className="text-[#DC8379]/60 text-xs mt-0.5">
                                Manage them in the <Link to="/plan/constraints" className="underline font-bold hover:text-[#DC8379] transition-colors">Advanced View</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 sm:p-6 md:p-8 pt-4">

                {/* Left Column: Inputs */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 mb-2">
                        <h1 className="text-3xl sm:text-4xl text-[#f97766] font-normal tracking-wide text-center lg:text-left" style={{ fontFamily: 'cursive' }}>
                            Plan an Event!
                        </h1>
                        <hr className="border-t border-[#DC8379]/10 w-full max-w-2xl mx-auto lg:mx-0" />
                    </div>

                    {/* Mobile Status Bubble */}
                    <div className="lg:hidden mb-2">
                        <PlanStatus variant="mobile" />
                    </div>

                    {/* Select Attendees Section */}
                    <div className="flex flex-col items-center w-full max-w-2xl">
                        <div className="inline-block px-5 py-1.5 rounded-full bg-[#4C0E36] border border-[#DC8379]/20 mb-[-14px] sm:mb-[-16px] relative z-10 shadow-lg">
                            <span className="text-[14px] sm:text-[16px] text-[#DC8379] font-normal tracking-wide" style={{ fontFamily: 'cursive' }}>
                                Select Attendees
                            </span>
                        </div>
                        <EntitySelector
                            selectedIds={selectedEntities}
                            onChange={(val) => updateSimplifiedConstraint('include', val)}
                        />
                    </div>

                    {/* Define Constraints Section */}
                    <div className="flex flex-col gap-4">
                        <SimplifiedConstraintPicker />
                    </div>
                </div>

                {/* Right Column: Visuals - Hidden on mobile */}
                <div className="hidden lg:flex flex-col gap-4 pt-4 items-center">
                    {/* Treasure Map Graphic */}
                    <div className="w-full max-w-md bg-[var(--bg-accent)] rounded-[2.5rem] p-4 sm:p-6 border border-[#DC8379]/10 shadow-2xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#f97766]/5 to-transparent pointer-events-none" />
                        <img
                            src="/plan_graphic.png"
                            alt="Planning Map"
                            className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-101"
                        />
                    </div>
                </div>
            </div>

            {/* Reusable Action Bar Footer */}
            <ActionBar onReset={handleReset} onGenerate={handleGenerate} />
        </div>
    );
}
