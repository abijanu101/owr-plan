import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../UI/Button';
import PlanStatus from './PlanStatus';

const SparklesIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
        <path d="M5 18l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
        <path d="M19 5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5z" />
    </svg>
);

const ResetIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const ChevronDownIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const ChevronUpIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
);

export default function ActionBar({ onReset, onGenerate, currentView = 'simplified', generateDisabled = false }) {
    const isStructured = currentView === 'structured';
    const linkTo = isStructured ? "/plan" : "/plan/constraints";
    const linkTextDesktop = isStructured ? "Simplified View" : "View All Constraints";
    const linkTextMobile = isStructured ? "Simplified" : "All Constraints";
    const Icon = isStructured ? ChevronUpIcon : ChevronDownIcon;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-[#1A0B16]/80 backdrop-blur-xl border-t border-[#DC8379]/10 p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* View Toggle */}
                    <Link
                        to={linkTo}
                        className="flex items-center gap-2 text-[#DC8379]/60 hover:text-[#f97766] transition-all text-sm font-bold group px-4 py-2 rounded-lg hover:bg-white/5 cursor-pointer select-none shrink-0"
                    >
                        <Icon className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                        <span style={{ fontFamily: 'cursive' }} className="hidden sm:inline">{linkTextDesktop}</span>
                        <span style={{ fontFamily: 'cursive' }} className="sm:hidden">{linkTextMobile}</span>
                    </Link>

                    {/* Status Indicator (Desktop only) */}
                    <div className="hidden lg:block">
                        <PlanStatus variant="desktop" />
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Reset Button */}
                    <Button
                        variant="ghost"
                        onClick={onReset}
                        icon={ResetIcon}
                    >
                        Reset
                    </Button>

                    {/* Primary Generate Button */}
                    <Button
                        variant="primary"
                        onClick={onGenerate}
                        icon={SparklesIcon}
                        disabled={generateDisabled}
                    >
                        Generate
                    </Button>
                </div>
            </div>
        </div>
    );
}
