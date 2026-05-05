import React from 'react';
import GlobalConstraintRow from './GlobalConstraintRow';
import ConstraintBlockRow from './ConstraintBlockRow';
import { getDefaultParameter, getDefaultModifier } from './ConstraintSchema';

const TableHeader = () => (
    <div className="flex items-center border-b border-[#DC8379]/20 bg-[var(--bg-purple)] text-center rounded-t-xl">
        <div className="w-12 shrink-0"></div>
        <div className="w-28 sm:w-32 shrink-0 border-r border-[#DC8379]/20 py-2 px-3 text-center">
            <span className="text-[#DC8379] font-normal text-xl tracking-wide" style={{ fontFamily: 'cursive' }}>Modifiers</span>
        </div>
        <div className="w-40 sm:w-48 shrink-0 border-r border-[#DC8379]/10 py-1.5 px-3 text-center">
            <span className="text-[#DC8379] font-normal text-xl tracking-wide" style={{ fontFamily: 'cursive' }}>Constraints</span>
        </div>
        <div className="flex-1 py-2 px-3">
            <span className="text-[#DC8379] font-normal text-xl tracking-wide" style={{ fontFamily: 'cursive' }}>Parameters</span>
        </div>
    </div>
);

const SectionLabel = ({ children }) => (
    <div className="flex items-center gap-4 py-4 px-2">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#DC8379]/20" />
        <span className="text-[#DC8379] text-sm font-bold tracking-widest uppercase opacity-60" style={{ fontFamily: 'cursive' }}>{children}</span>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#DC8379]/20" />
    </div>
);

export default function ConstraintTable({ constraints = [], onChange, isMobile }) {

    const systemConstraints = constraints.filter(c => c.isSystem);
    const customConstraints = constraints.filter(c => !c.isSystem);

    const addConstraint = () => {
        const defaultType = 'be between';
        const newConstraint = { id: Date.now(), isBlock: false, modifier: getDefaultModifier(defaultType), type: defaultType, parameter: getDefaultParameter(defaultType) };
        onChange([...constraints, newConstraint]);
    };

    const addBlock = () => {
        const newBlock = { id: Date.now(), isBlock: true, modifier: 'must', entity: [], isExpanded: true, children: [] };
        onChange([...constraints, newBlock]);
    };

    const updateConstraint = (id, updated) => {
        onChange(constraints.map(c => c.id === id ? updated : c));
    };

    const removeConstraint = (id) => {
        onChange(constraints.filter(c => c.id !== id));
    };

    const hasInclude = customConstraints.some(c => c.type === 'include');

    const renderRow = (c) => (
        c.isBlock ? (
            <ConstraintBlockRow key={c.id} block={c} onChange={(u) => updateConstraint(c.id, u)} onRemove={() => removeConstraint(c.id)} isMobile={isMobile} hasInclude={hasInclude} />
        ) : (
            <GlobalConstraintRow key={c.id} constraint={c} onChange={(u) => updateConstraint(c.id, u)} onRemove={() => removeConstraint(c.id)} isMobile={isMobile} hasInclude={hasInclude} />
        )
    );

    if (isMobile) {
        return (
            <div className="flex flex-col gap-4 w-full">
                {systemConstraints.length > 0 && (
                    <>
                        <SectionLabel>System Constraints</SectionLabel>
                        {systemConstraints.map(renderRow)}
                    </>
                )}

                <SectionLabel>Custom Constraints</SectionLabel>
                {customConstraints.map(renderRow)}
                
                {customConstraints.length === 0 && (
                    <div className="py-8 text-center text-[#DC8379]/40 italic" style={{ fontFamily: 'cursive' }}>
                        No custom constraints added yet
                    </div>
                )}

                <div className="flex flex-col gap-2 pt-4">
                    <button onClick={addConstraint} className="w-full py-4 rounded-2xl border-2 border-dashed border-[#DC8379]/20 text-[#DC8379]/60 hover:text-[#DC8379] hover:border-[#DC8379]/40 hover:bg-white/5 transition-all font-bold text-lg cursor-pointer" style={{ fontFamily: 'cursive' }}>
                        + Add Constraint
                    </button>
                    <button onClick={addBlock} className="w-full py-4 rounded-2xl border-2 border-dashed border-[#DC8379]/20 text-[#DC8379]/60 hover:text-[#DC8379] hover:border-[#DC8379]/40 hover:bg-white/5 transition-all font-bold text-lg cursor-pointer" style={{ fontFamily: 'cursive' }}>
                        + Add Block
                    </button>
                </div>
            </div>
        );
    }

    // Desktop
    return (
        <div className="flex flex-col gap-8 w-full">
            {/* System Table */}
            <div className="flex flex-col gap-3">
                <SectionLabel>System Constraints</SectionLabel>
                <div className="bg-[var(--bg-raised)] border border-[#DC8379]/20 rounded-xl w-full flex flex-col">
                    <TableHeader />
                    <div className="flex flex-col">
                        {systemConstraints.map((c, i) => (
                            <div key={c.id} className="relative" style={{ zIndex: 100 - i }}>
                                {renderRow(c)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Custom Table */}
            <div className="flex flex-col gap-3">
                <SectionLabel>Custom Constraints</SectionLabel>
                <div className="bg-[var(--bg-raised)] border border-[#DC8379]/20 rounded-xl w-full flex flex-col">
                    <TableHeader />
                    <div className="flex flex-col">
                        {customConstraints.map((c, i) => (
                            <div key={c.id} className="relative" style={{ zIndex: 50 - i }}>
                                {renderRow(c)}
                            </div>
                        ))}
                        {customConstraints.length === 0 && (
                            <div className="py-12 text-center text-[#DC8379]/40 italic" style={{ fontFamily: 'cursive' }}>
                                No custom constraints added yet. Use the buttons below to add rules.
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-4 mt-2">
                    <button onClick={addConstraint} className="flex-1 py-4 rounded-2xl border-2 border-dashed border-[#DC8379]/20 text-[#DC8379]/60 hover:text-[#DC8379] hover:border-[#DC8379]/40 hover:bg-white/5 transition-all font-bold text-lg cursor-pointer" style={{ fontFamily: 'cursive' }}>
                        + Add Constraint
                    </button>
                    <button onClick={addBlock} className="flex-1 py-4 rounded-2xl border-2 border-dashed border-[#DC8379]/20 text-[#DC8379]/60 hover:text-[#DC8379] hover:border-[#DC8379]/40 hover:bg-white/5 transition-all font-bold text-lg cursor-pointer" style={{ fontFamily: 'cursive' }}>
                        + Add Block
                    </button>
                </div>
            </div>
        </div>
    );
}
