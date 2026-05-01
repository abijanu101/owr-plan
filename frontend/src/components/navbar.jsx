import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import icon from '/favicon.svg';

const NAV_ITEMS = [
    { name: 'availability', path: '/visualize', icon: '/icons/navbar_icons_availability.png' },
    { name: 'shared expenses', path: '/ledgers', icon: '/icons/navbar_icons_expenses.png' },
    { name: 'planner', path: '/plan', icon: '/icons/navbar_icons_plan.png' },
    { name: 'entities', path: '/entities', icon: '/icons/navbar_icons_entities.png' },
    { name: 'activities', path: '/activities', icon: '/icons/navbar_icons_activities.png' }
];

export default function Navbar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [clickedItem, setClickedItem] = useState(null);
    const [isDesktopOpen, setIsDesktopOpen] = useState(false);
    const location = useLocation();

    const handleItemClick = (name) => {
        setClickedItem(name);
        setTimeout(() => setClickedItem(null), 400);
        setIsDesktopOpen(false);
    };

    return (
        <nav className="group bg-accent text-[var(--color-primary)] w-full relative z-50" onMouseEnter={() => setIsDesktopOpen(true)} onMouseLeave={() => setIsDesktopOpen(false)}>
            {/* Top Bar */}
            <div className="flex flex-row items-center justify-between p-2 relative z-50 bg-accent">
                {/* Logo */}
                <Link to="/" className="flex flex-row items-center gap-2 group/logo">
                    <img src={icon} className="w-10 h-10 transition-transform group-hover/logo:scale-110" alt="logo" />
                    <h1 className="text-2xl font-bold tracking-wider">OwrPlan</h1>
                </Link>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex flex-row items-center gap-6">
                    <Link to="/login" className="inline-block text-xl whitespace-nowrap hover:text-white transition-colors px-3">login</Link>
                    <Link to="/signup" className="inline-block bg-[var(--color-primary)] whitespace-nowrap text-[var(--bg-primary)] px-4 py-2 leading-none rounded-full text-xl font-bold hover:brightness-110 hover:scale-105 transition-all">signup</Link>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="text-[var(--color-primary)] hover:text-white focus:outline-none"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className={`hidden md:flex absolute top-[100%] left-0 w-full bg-accent border-b-2 border-[var(--border-subtle)] flex-row justify-center items-end gap-24 pt-8 pb-12 shadow-xl transition-all duration-300 ease-out origin-top ${isDesktopOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-4 opacity-0 invisible'} z-[60] rounded-b-[50%]`}>
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    const isScaledUp = ['shared expenses', 'activities', 'entities'].includes(item.name);
                    const isPlanner = item.name === 'planner';
                    const isEntities = item.name === 'entities';
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => handleItemClick(item.name)}
                            className={`relative flex flex-col items-center gap-2 group/link transition-all ${isActive ? 'scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'} ${clickedItem === item.name ? 'pulse' : ''}`}
                        >
                            {clickedItem === item.name && (
                                <svg className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-20 text-[var(--color-primary)] animate-burst pointer-events-none z-0" viewBox="0 0 100 100">
                                    <line className="burst-line" x1="50" y1="20" x2="50" y2="5" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                    <line className="burst-line" x1="50" y1="80" x2="50" y2="95" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                    <line className="burst-line" x1="20" y1="50" x2="5" y2="50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                    <line className="burst-line" x1="80" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                    <line className="burst-line" x1="28" y1="28" x2="15" y2="15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                    <line className="burst-line" x1="72" y1="72" x2="85" y2="85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                    <line className="burst-line" x1="28" y1="72" x2="15" y2="85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                    <line className="burst-line" x1="72" y1="28" x2="85" y2="15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                </svg>
                            )}
                            {item.icon ? (
                                <div className={`relative z-10 h-16 flex items-end ${isEntities ? 'translate-y-3' : ''}`}>
                                    <img src={item.icon} alt={item.name} className={`max-h-full object-contain filter drop-shadow-md brightness-110 ${isScaledUp ? 'scale-150' : ''} ${isPlanner ? 'scale-110' : ''}`} />
                                </div>
                            ) : (
                                <div className="relative z-10 h-16 flex items-end justify-center w-16">
                                    <div className="w-12 h-12 rounded-full border-2 border-[var(--color-primary)] border-dashed opacity-50 flex items-center justify-center text-xs">?</div>
                                </div>
                            )}
                            <span className={`text-lg ${isActive ? 'font-bold underline decoration-2 underline-offset-4' : ''}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Mobile Navigation Dropdown */}
            <div className={`md:hidden absolute top-[100%] left-0 w-full h-[calc(100vh-56px)] z-40 bg-accent px-4 pt-8 flex flex-col gap-8 overflow-y-auto transition-all duration-300 ease-in-out ${isMobileOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-8 pointer-events-none'}`}>
                {/* Mobile Grid Layout for Links */}
                    <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                        {NAV_ITEMS.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            const isScaledUp = ['shared expenses', 'activities', 'entities'].includes(item.name);
                            const isPlanner = item.name === 'planner';
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => {
                                        handleItemClick(item.name);
                                        setTimeout(() => setIsMobileOpen(false), 200);
                                    }}
                                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl ${isActive ? 'bg-accent/50 scale-105' : 'bg-default/30 active:scale-95'} transition-all ${clickedItem === item.name ? 'pulse' : ''}`}
                                >
                                    {clickedItem === item.name && (
                                        <svg className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-28 text-[var(--color-primary)] animate-burst pointer-events-none z-0" viewBox="0 0 100 100">
                                            <line x1="50" y1="20" x2="50" y2="5" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                            <line x1="50" y1="80" x2="50" y2="95" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                            <line x1="20" y1="50" x2="5" y2="50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                            <line x1="80" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                            <line x1="28" y1="28" x2="15" y2="15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                            <line x1="72" y1="72" x2="85" y2="85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                            <line x1="28" y1="72" x2="15" y2="85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                            <line x1="72" y1="28" x2="85" y2="15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                                        </svg>
                                    )}
                                    {item.icon ? (
                                        <img src={item.icon} alt={item.name} className={`relative z-10 h-24 object-contain mb-8 brightness-110 ${isScaledUp ? 'scale-125' : ''} ${isPlanner ? 'scale-110' : ''}`} />
                                    ) : (
                                        <div className="relative z-10 h-24 w-24 rounded-full border-2 border-[var(--color-primary)] border-dashed opacity-50 mb-8 flex items-center justify-center text-xs">?</div>
                                    )}
                                    <span className={`text-lg text-center ${isActive ? 'font-bold underline decoration-2 underline-offset-4' : ''}`}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                    {/* Mobile Auth Buttons */}
                    <div className="flex flex-row items-center justify-center gap-6 mt-auto border-t border-[var(--border-subtle)] pt-6 pb-6 sticky bottom-0 bg-accent z-10 w-full shadow-[0_-10px_20px_var(--bg-accent)]">
                        <Link to="/login" onClick={() => setIsMobileOpen(false)} className="inline-block text-lg px-8 py-3 whitespace-nowrap border border-[var(--color-primary)] rounded-full hover:bg-[var(--bg-accent)] transition-all">login</Link>
                        <Link to="/signup" onClick={() => setIsMobileOpen(false)} className="inline-block bg-[var(--color-primary)] text-[var(--bg-primary)] px-8 py-4 whitespace-nowrap leading-none rounded-full text-lg font-bold hover:brightness-110 transition-all">signup</Link>
                    </div>
                </div>
        </nav>
    );
}