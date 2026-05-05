import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ChevronRight = ({ className = "" }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`opacity-40 shrink-0 ${className}`}>
        <path d="m9 18 6-6-6-6" />
    </svg>
);

const HomeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const ArcedArrowLeft = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 14 4 9l5-5" />
        <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v3" />
    </svg>
);

export default function Breadcrumbs() {
    const location = useLocation();
    const navigate = useNavigate();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Don't show breadcrumbs on the home page
    if (location.pathname === '/') return null;

    const truncate = (text) => {
        // If it looks like a long ID (UUID or similar), truncate it
        if (text.length > 12) {
            return text.substring(0, 8) + '...';
        }
        return text;
    };

    return (
        <nav className="flex items-center gap-3 pt-4 px-6 animate-in fade-in duration-500 overflow-x-auto no-scrollbar" aria-label="Breadcrumb">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center p-1.5 rounded-full hover:bg-white/10 transition-colors text-[#DC8379]/60 hover:text-[#f97766] shrink-0"
                title="Go back"
            >
                <ArcedArrowLeft />
            </button>

            <div className="h-4 w-px bg-[#DC8379]/20 mx-1 shrink-0" />

            <Link
                to="/"
                className="flex items-center gap-2 text-[#DC8379]/60 hover:text-[#f97766] transition-colors shrink-0"
            >
                <HomeIcon />
                <span className="hidden sm:inline text-sm font-bold tracking-widest pt-0.5">OwrPlan</span>
            </Link>

            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const displayName = truncate(value.replace(/-/g, ' '));

                return (
                    <React.Fragment key={to}>
                        <ChevronRight className="shrink-0" />
                        {last ? (
                            <span
                                className="text-[#f97766] font-bold text-lg whitespace-nowrap"
                                style={{ fontFamily: 'cursive' }}
                            >
                                {displayName.toLowerCase()}
                            </span>
                        ) : (
                            <Link
                                to={to}
                                className="text-[#DC8379]/60 hover:text-[#f97766] transition-colors font-medium text-lg whitespace-nowrap"
                                style={{ fontFamily: 'cursive' }}
                            >
                                {displayName}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
