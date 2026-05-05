import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const WheelColumn = ({ items, value, onChange, width = "w-16", label }) => {
    const scrollRef = useRef(null);
    const itemHeight = 56; // Matching TimePicker
    const isScrolling = useRef(false);
    const scrollTimeout = useRef(null);
    const isDragging = useRef(false);
    const startY = useRef(0);
    const startScrollTop = useRef(0);

    useEffect(() => {
        if (scrollRef.current && !isScrolling.current && !isDragging.current) {
            const index = items.indexOf(value);
            if (index !== -1) {
                scrollRef.current.scrollTop = index * itemHeight;
            }
        }
    }, [value, items]);

    const handleScroll = (e) => {
        if (isDragging.current) return;
        isScrolling.current = true;
        clearTimeout(scrollTimeout.current);
        
        const index = Math.round(e.target.scrollTop / itemHeight);
        if (index >= 0 && index < items.length) {
            if (items[index] !== value) {
                onChange(items[index]);
            }
        }

        scrollTimeout.current = setTimeout(() => {
            isScrolling.current = false;
        }, 150);
    };

    const handleMouseDown = (e) => {
        isDragging.current = true;
        startY.current = e.pageY;
        startScrollTop.current = scrollRef.current.scrollTop;
        scrollRef.current.style.scrollSnapType = 'none'; // Disable snap during drag
        scrollRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const delta = startY.current - e.pageY;
        scrollRef.current.scrollTop = startScrollTop.current + delta;
    };

    const handleMouseUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        scrollRef.current.style.scrollSnapType = 'y mandatory'; // Re-enable snap
        scrollRef.current.style.cursor = 'grab';
        
        // Trigger manual snap/update
        const index = Math.round(scrollRef.current.scrollTop / itemHeight);
        if (index >= 0 && index < items.length) {
            onChange(items[index]);
            scrollRef.current.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const upHandler = () => handleMouseUp();
        const moveHandler = (e) => handleMouseMove(e);
        if (isDragging.current) {
            window.addEventListener('mouseup', upHandler);
            window.addEventListener('mousemove', moveHandler);
        }
        return () => {
            window.removeEventListener('mouseup', upHandler);
            window.removeEventListener('mousemove', moveHandler);
        };
    }, []); // This might not be enough since isDragging is a ref. 
    // Let's attach to window in handleMouseDown instead.

    return (
        <div className="flex flex-col items-center gap-2 select-none">
            {label && <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{label}</span>}
            <div className="relative group">
                {/* Selection Highlight */}
                <div className="absolute top-1/2 left-0 w-full h-[56px] -translate-y-1/2 bg-white/5 border-y border-primary/20 pointer-events-none rounded-lg"></div>
                
                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className={`h-[168px] ${width} overflow-y-scroll snap-y snap-mandatory relative text-[2.5rem] font-bold [&::-webkit-scrollbar]:hidden select-none cursor-grab active:cursor-grabbing`}
                    style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                >
                    <div style={{ height: itemHeight }} className="w-full shrink-0" />
                    {items.map((item) => (
                        <div 
                            key={item} 
                            style={{ height: itemHeight }}
                            className={`w-full flex items-center justify-center shrink-0 snap-center transition-all duration-200 tabular-nums ${
                                value === item 
                                    ? 'text-[#f97766] scale-110 opacity-100' 
                                    : 'text-[#DC8379] opacity-40 hover:opacity-70 scale-90'
                            }`}
                        >
                            {item}
                        </div>
                    ))}
                    <div style={{ height: itemHeight }} className="w-full shrink-0" />
                </div>
            </div>
        </div>
    );
};

export default function DurationPicker({ hours = 1, minutes = 30, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const hourItems = Array.from({ length: 24 }, (_, i) => i);
    const minuteItems = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10... 55

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
            <div 
                className="relative z-50 bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-[2.5rem] p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200 min-w-[320px]"
                ref={containerRef}
            >
                <div className="flex flex-col gap-8">
                    <div className="text-center">
                        <h3 className="text-2xl text-[#DC8379] font-normal mb-1" style={{ fontFamily: 'cursive' }}>
                            Set Duration
                        </h3>
                        <p className="text-muted text-xs font-medium opacity-60">Scroll or drag to select</p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-6 bg-black/20 p-6 rounded-[2rem] border border-white/5">
                        <WheelColumn 
                            label="Hours"
                            items={hourItems}
                            value={hours}
                            onChange={(v) => onChange({ hours: v, minutes })}
                            width="w-20"
                        />
                        
                        <div className="text-primary text-[2rem] font-bold opacity-40 mt-6">:</div>

                        <WheelColumn 
                            label="Minutes"
                            items={minuteItems}
                            value={minutes}
                            onChange={(v) => onChange({ hours, minutes: v })}
                            width="w-20"
                        />
                    </div>

                    <button 
                        onClick={() => setIsOpen(false)}
                        className="w-full py-4 bg-[var(--color-primary)] text-[var(--bg-primary)] text-base font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(249,119,102,0.3)] hover:brightness-110 active:scale-95"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="select-none inline-block">
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 text-[#f97766] border-b-2 border-dotted border-[#f97766]/40 hover:border-[#f97766] px-1 font-bold italic transition-all focus:outline-none"
                style={{ fontFamily: 'cursive' }}
            >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{hours}h {minutes}m</span>
            </button>
            
            {isOpen && createPortal(modalContent, document.body)}
        </div>
    );
}
