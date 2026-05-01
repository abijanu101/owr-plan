import React, { useState } from 'react';
import EntitySelector from '../components/EntitySelector';
import SimplifiedConstraintPicker from '../components/Plan/SimplifiedConstraintPicker';
import ActionBar from '../components/Plan/ActionBar';

export default function Plan() {
    const [selectedEntities, setSelectedEntities] = useState([]);
    
    // Default values for reset
    const DEFAULT_DURATION = { hours: 1, minutes: 30 };
    const DEFAULT_RANGE = {
        start: { date: new Date(2026, 3, 29), time: "08:00 AM" },
        end: { date: new Date(2026, 3, 30), time: "11:59 PM" }
    };

    const [duration, setDuration] = useState(DEFAULT_DURATION);
    const [range, setRange] = useState(DEFAULT_RANGE);

    const handleReset = () => {
        setSelectedEntities([]);
        setDuration(DEFAULT_DURATION);
        setRange(DEFAULT_RANGE);
    };

    const handleGenerate = () => {
        console.log('Generating plan with:', { selectedEntities, duration, range });
        // Generation logic here
    };

    return (
        <div className="bg-[var(--bg-primary)] p-4 sm:p-6 md:p-8 md:pt-0 relative overflow-x-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 sm:pt-6">

                {/* Left Column: Inputs */}
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl sm:text-4xl text-[#f97766] font-normal tracking-wide text-center lg:text-left mb-2" style={{ fontFamily: 'cursive' }}>
                        Plan an Event!
                    </h1>

                    {/* Select Attendees Section */}
                    <div className="flex flex-col items-center w-full max-w-2xl">
                        <div className="inline-block px-5 py-1.5 rounded-full bg-[#4C0E36] border border-[#DC8379]/20 mb-[-14px] sm:mb-[-16px] relative z-10 shadow-lg">
                            <span className="text-[14px] sm:text-[16px] text-[#DC8379] font-normal tracking-wide" style={{ fontFamily: 'cursive' }}>
                                Select Attendees
                            </span>
                        </div>
                        <EntitySelector
                            selectedIds={selectedEntities}
                            onChange={setSelectedEntities}
                        />
                    </div>

                    {/* Define Constraints Section */}
                    <div className="flex flex-col gap-4">
                        <SimplifiedConstraintPicker 
                            duration={duration}
                            setDuration={setDuration}
                            range={range}
                            setRange={setRange}
                        />
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
