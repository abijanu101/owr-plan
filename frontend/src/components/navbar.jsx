import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import icon from '/favicon.svg';

const NAV_ITEMS = [
    { name: 'availability', path: '/visualize', icon: null },
    { name: 'shared expenses', path: '/ledgers', icon: '/icons/navbar_icons_expenses.png' },
    { name: 'planner', path: '/plan', icon: '/icons/navbar_icons_plan.png' },
    { name: 'entities', path: '/entities', icon: '/icons/navbar_icons_entities.png' },
    { name: 'activities', path: '/activities', icon: '/icons/navbar_icons_activities.png' }
];

export default function Navbar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    return (
        <nav className="group bg-accent text-[var(--color-primary)] w-full relative z-50">
            {/* Top Bar */}
            <div className="flex flex-row items-center justify-between p-4 md:px-8 relative z-50 bg-accen">
                {/* Logo */}
                <Link to="/" className="flex flex-row items-center gap-2 group/logo">
                    <img src={icon} className="w-10 h-10 transition-transform group-hover/logo:scale-110" alt="logo" />
                    <h1 className="text-3xl font-bold tracking-wider">OwrPlan</h1>
                </Link>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex flex-row items-center gap-6">
                    <Link to="/login" className="text-xl whitespace-nowrap hover:text-white transition-colors px-6 py-3">login</Link>
                    <Link to="/signup" className="bg-[var(--color-primary)] whitespace-nowrap text-[var(--bg-primary)] px-8 py-4 leading-none rounded-full text-xl font-bold hover:brightness-110 hover:scale-105 transition-all">signup</Link>
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
            <div className="hidden md:flex absolute top-[100%] left-0 w-full bg-accent border-b-2 border-[var(--border-subtle)] flex-row justify-center items-end gap-24 pt-6 pb-6 shadow-xl transition-all duration-300 ease-out origin-top -translate-y-4 opacity-0 invisible group-hover:translate-y-0 group-hover:opacity-100 group-hover:visible z-[60]">
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    const isScaledUp = ['shared expenses', 'activities', 'entities'].includes(item.name);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex flex-col items-center gap-2 group/link transition-all ${isActive ? 'scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                        >
                            {item.icon ? (
                                <div className="h-16 flex items-end">
                                    <img src={item.icon} alt={item.name} className={`max-h-full object-contain filter drop-shadow-md brightness-110 ${isScaledUp ? 'scale-150' : ''}`} />
                                </div>
                            ) : (
                                <div className="h-16 flex items-end justify-center w-16">
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
            {isMobileOpen && (
                <div className="md:hidden absolute top-[100%] left-0 w-full h-[calc(100vh-74px)] z-40 bg-accent px-4 pb-4 pt-8 flex flex-col gap-8 overflow-y-auto">
                    {/* Mobile Grid Layout for Links */}
                    <div className="grid grid-cols-2 gap-y-12 gap-x-4">
                        {NAV_ITEMS.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            const isScaledUp = ['shared expenses', 'activities', 'entities'].includes(item.name);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl ${isActive ? 'bg-accent/50 scale-105' : 'bg-default/30 active:scale-95'} transition-all`}
                                >
                                    {item.icon ? (
                                        <img src={item.icon} alt={item.name} className={`h-24 object-contain mb-4 brightness-110 ${isScaledUp ? 'scale-125' : ''}`} />
                                    ) : (
                                        <div className="h-24 w-24 rounded-full border-2 border-[var(--color-primary)] border-dashed opacity-50 mb-4 flex items-center justify-center text-xs">?</div>
                                    )}
                                    <span className={`text-sm text-center ${isActive ? 'font-bold' : ''}`}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                    {/* Mobile Auth Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-4 border-t border-[var(--border-subtle)] pt-8">
                        <Link to="/login" onClick={() => setIsMobileOpen(false)} className="text-xl px-8 py-3 whitespace-nowrap border border-[var(--color-primary)] rounded-full hover:bg-[var(--bg-accent)] transition-all">login</Link>
                        <Link to="/signup" onClick={() => setIsMobileOpen(false)} className="bg-[var(--color-primary)] text-[var(--bg-primary)] px-8 py-4 whitespace-nowrap leading-none rounded-full text-xl font-bold hover:brightness-110 transition-all">signup</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}