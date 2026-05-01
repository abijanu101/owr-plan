import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EntitySelector from '../components/EntitySelector';
import SimplifiedConstraintPicker from '../components/SimplifiedConstraintPicker';

export default function Plan() {
    const [selectedEntities, setSelectedEntities] = useState([]);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8 md:p-12 md:pt-0 relative overflow-x-hidden">
            <div className="max-w-7xl mx-auto pt-4 sm:pt-8">
                <h1 className="text-[32px] sm:text-[48px] text-[#f97766] font-normal tracking-wide text-center mb-4 sm:mb-6" style={{ fontFamily: 'cursive' }}>
                    Plan an Event!
                </h1>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: Inputs */}
                <div className="flex flex-col gap-6">

                    {/* Select Attendees Section */}
                    <div className="flex flex-col items-center w-full max-w-2xl">
                        <div className="inline-block px-6 sm:px-10 py-2 rounded-full bg-[#4C0E36] border border-[#DC8379]/20 mb-[-18px] sm:mb-[-20px] relative z-10 shadow-lg">
                            <span className="text-[18px] sm:text-[22px] text-[#DC8379] font-normal tracking-wide" style={{ fontFamily: 'cursive' }}>
                                Select Attendees
                            </span>
                        </div>
                        <EntitySelector
                            selectedIds={selectedEntities}
                            onChange={setSelectedEntities}
                        />
                    </div>

                    {/* Define Constraints Section */}
                    <div className="flex flex-col gap-6">
                        <SimplifiedConstraintPicker />

                        {/* Action Buttons */}
                        <div className="flex flex-col items-center gap-6 w-full">
                            <div className="flex justify-center sm:justify-end w-full max-w-[95%] sm:max-w-[90%]">
                                <button className="group relative flex items-center gap-3 px-8 sm:px-10 py-3 sm:py-4 rounded-xl bg-[var(--color-primary)] text-[var(--bg-primary)] font-bold text-base sm:text-lg shadow-[0_0_20px_rgba(249,119,102,0.3)] hover:shadow-[0_0_30px_rgba(249,119,102,0.5)] transition-all active:scale-95 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-glint" />
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 2l2.45 4.96L20 7.71l-4 3.9 1 5.39L12 14.5l-5 2.5 1-5.39-4-3.9 5.55-.75L12 2z" />
                                    </svg>
                                    <span>Generate</span>
                                </button>
                            </div>

                            <div className="w-full flex justify-center sm:justify-start pl-0 sm:pl-8 border-t border-[#DC8379]/10 pt-4">
                                <Link
                                    to="/plan/structured"
                                    className="flex items-center gap-2 text-[#DC8379]/60 hover:text-[#f97766] transition-all text-sm font-bold group"
                                >
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    <span style={{ fontFamily: 'cursive' }}>View Advanced Options</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visuals - Hidden on mobile */}
                <div className="hidden lg:flex flex-col gap-8 pt-6">

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
