import React from 'react';

export default function HeartOrbitAnimation() {
    return (
        <div className="fixed inset-0 z-[200] bg-[#200412] flex items-center justify-center overflow-hidden animate-in fade-in duration-500">
            {/* The wrapper containing everything */}
            <div className="relative flex items-center justify-center w-64 h-64">

                {/* Central solid circle with Heart */}
                <div className="absolute w-24 h-24 rounded-full border-2 border-[#f97766] flex items-center justify-center shadow-[0_0_40px_rgba(249,119,102,0.4),inset_0_0_20px_rgba(249,119,102,0.2)] bg-[#200412] z-10">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-[#f97766] drop-shadow-[0_0_15px_rgba(249,119,102,0.8)]">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </div>

                {/* Orbit 1 (Inner, dotted) */}
                <div
                    className="absolute w-36 h-36 rounded-full border-[2px] border-dotted border-[#f97766]/50"
                    style={{ animation: 'spin 8s linear infinite' }}
                >
                    {/* Orbiting dot */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#f97766] shadow-[0_0_10px_rgba(249,119,102,0.8)]"></div>
                </div>

                {/* Orbit 2 (Middle, dashed) */}
                <div
                    className="absolute w-48 h-48 rounded-full border border-dashed border-[#f97766]/40"
                    style={{ animation: 'spin 12s linear infinite reverse' }}
                >
                    {/* Orbiting dot */}
                    <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f97766] shadow-[0_0_15px_rgba(249,119,102,0.9)]"></div>
                </div>

                {/* Orbit 3 (Outer, dashed/opacity) */}
                <div
                    className="absolute w-[18rem] h-[18rem] rounded-full border-[2px] border-dashed border-[#f97766]/20"
                    style={{ animation: 'spin 20s linear infinite' }}
                >
                </div>

            </div>

            {/* Loading text below
            <div className="absolute bottom-1/4 text-[#f97766] font-medium tracking-[0.25em] text-sm animate-pulse opacity-80" style={{ fontFamily: 'cursive' }}>
                ADDING TO LEDGER...
            </div> */}
        </div>
    );
}
