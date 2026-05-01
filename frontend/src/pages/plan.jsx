import React, { useState } from 'react';
import EntitySelector from '../components/EntitySelector';
import SimplifiedConstraintPicker from '../components/SimplifiedConstraintPicker';

export default function Plan() {
    const [selectedEntities, setSelectedEntities] = useState([]);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-8 md:p-12 relative overflow-x-hidden">
            <div className="max-w-7xl mx-auto pt-8">
                <h1 className="text-[48px] text-[#f97766] font-normal tracking-wide text-center mb-12" style={{ fontFamily: 'cursive' }}>
                    Plan an Event!
                </h1>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

                {/* Left Column: Inputs */}
                <div className="flex flex-col gap-16">

                    {/* Select Attendees Section */}
                    <div className="flex flex-col items-center w-full max-w-2xl">
                        <div className="inline-block px-10 py-2.5 rounded-full bg-[#4C0E36] border border-[#DC8379]/20 mb-[-20px] relative z-10 shadow-lg">
                            <span className="text-[22px] text-[#DC8379] font-normal tracking-wide" style={{ fontFamily: 'cursive' }}>
                                Select Attendees
                            </span>
                        </div>
                        <EntitySelector
                            selectedIds={selectedEntities}
                            onChange={setSelectedEntities}
                        />
                    </div>

                    {/* Define Constraints Section */}
                    <SimplifiedConstraintPicker />

                </div>

                {/* Right Column: Visuals - Hidden on mobile */}
                <div className="hidden lg:flex flex-col gap-8 pt-12">

                    {/* Treasure Map Graphic */}
                    <div className="w-full max-w-xl mx-auto bg-[var(--bg-accent)] rounded-[3rem] p-8 border border-[#DC8379]/10 shadow-2xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#f97766]/5 to-transparent pointer-events-none" />
                        <img
                            src="/plan_graphic.png"
                            alt="Planning Map"
                            className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-101"
                        />
                    </div>
                </div>

            </div>

        </div>
    );
}
