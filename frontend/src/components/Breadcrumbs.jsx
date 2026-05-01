import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ChevronRight = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

const HomeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

export default function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Don't show breadcrumbs on the home page
    if (location.pathname === '/') return null;

    return (
        <nav className="flex items-center gap-3 pt-4 px-6 animate-in fade-in duration-500 overflow-x-auto no-scrollbar" aria-label="Breadcrumb">
            <Link
                to="/"
                className="flex items-center gap-2 text-[#DC8379]/60 hover:text-[#f97766] transition-colors"
            >
                <HomeIcon />
                <span className="text-sm font-bold tracking-widest pt-0.5">OwrPlan</span>
            </Link>

            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const displayName = value.replace(/-/g, ' ');

                return (
                    <React.Fragment key={to}>
                        <ChevronRight />
                        {last ? (
                            <span
                                className="text-[#f97766] font-bold text-lg"
                                style={{ fontFamily: 'cursive' }}
                            >
                                {displayName.toLowerCase()}
                            </span>
                        ) : (
                            <Link
                                to={to}
                                className="text-[#DC8379]/60 hover:text-[#f97766] transition-colors font-medium text-lg"
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
