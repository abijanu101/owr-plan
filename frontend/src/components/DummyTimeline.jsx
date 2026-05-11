import React from 'react';
import Avatar from './avatar';

const DummyTimeline = () => {
    // Hardcoded dummy values for a 12hr view (8 AM to 8 PM)
    const tickMarks = ['8 AM', '9:30 AM', '11 AM', '12:30 PM', '2 PM', '3:30 PM', '5 PM', '6:30 PM', '8 PM'];

    return (
        <div className="flex items-center gap-6 mt-4 group/row ">
            {/* Dummy Avatar Section */}
            <div className="flex flex-col items-center gap-2 w-16 shrink-0 mt-[-16px]">
                <Avatar
                    face="smile"
                    accessories={[]}
                    theme="dark"
                    size={48}
                    isGroup={false}
                    bgColor="#f97766"
                    shape="rounded"
                    style={{ borderColor: '#f97766', borderWidth: '3px' }}
                />
                <span className="text-[#f97766] text-sm tracking-wide">Example</span>
            </div>

            {/* Timeline Section */}
            <div className="flex-1 relative flex items-center group mb-6">
                {/* Left Arrow (Disabled) */}
                <svg className="w-6 h-6 text-[#f97766]/10 cursor-not-allowed shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>

                {/* The Line */}
                <div className="flex-1 h-3 bg-[#f97766]/10 mx-4 relative rounded-full">
                    {/* Tick marks & Labels */}
                    <div className="absolute inset-0 flex justify-between pointer-events-none">
                        {tickMarks.map((label, i) => (
                            <div key={i} className="relative flex flex-col items-center">
                                <div className="w-[3px] h-6 bg-[#f97766]/20 absolute top-1/2 -translate-y-1/2 rounded-full"></div>
                                <span className="absolute top-7 text-[#f97766]/40 text-[10px] whitespace-nowrap tracking-wide">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Dummy Highlighted Block */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-3.5 rounded-none cursor-help shadow-[0_0_12px_rgba(249,119,102,0.4)] z-10"
                        style={{ left: '25%', width: '35%', backgroundColor: '#f97766' }}
                    >
                        {/* Info Box / Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-[#200412] border border-[#f97766]/20 rounded-xl text-[#f97766] text-[12px] whitespace-nowrap shadow-2xl z-20 text-center leading-tight">
                            <div className="font-bold mb-1">Example timeline</div>
                            <div className="opacity-70">Duration: 12hr</div>
                            {/* Tooltip arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#200412]"></div>
                        </div>
                    </div>
                </div>

                {/* Right Arrow (Disabled) */}
                <svg className="w-6 h-6 text-[#f97766]/10 cursor-not-allowed shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    );
};

export default DummyTimeline;
