import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../UI/Button';

const SparklesIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24">
        <path d="M11.5,2L10,5L7,6.5L10,8L11.5,11L13,8L16,6.5L13,5L11.5,2M19,10L17.5,13L14.5,14.5L17.5,16L19,19L20.5,16L23.5,14.5L20.5,13L19,10M7,12L5.5,15L2.5,16.5L5.5,18L7,21L8.5,18L11.5,16.5L8.5,15L7,12Z" />
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

export default function ActionBar({ onReset, onGenerate, currentView = 'simplified' }) {
    const isStructured = currentView === 'structured';
    const linkTo = isStructured ? "/plan" : "/plan/structured";
    const linkTextDesktop = isStructured ? "Simplified Options" : "Advanced Options";
    const linkTextMobile = isStructured ? "Simplified" : "Advanced";
    const Icon = isStructured ? ChevronUpIcon : ChevronDownIcon;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-[#1A0B16]/80 backdrop-blur-xl border-t border-[#DC8379]/10 p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* View Toggle */}
                    <Link
                        to={linkTo}
                        className="flex items-center gap-2 text-[#DC8379]/60 hover:text-[#f97766] transition-all text-sm font-bold group px-4 py-2 rounded-lg hover:bg-white/5 cursor-pointer select-none"
                    >
                        <Icon className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                        <span style={{ fontFamily: 'cursive' }} className="hidden sm:inline">{linkTextDesktop}</span>
                        <span style={{ fontFamily: 'cursive' }} className="sm:hidden">{linkTextMobile}</span>
                    </Link>
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
                    >
                        Generate
                    </Button>
                </div>
            </div>
        </div>
    );
}
