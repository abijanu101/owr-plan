import React from 'react';
import GlobalConstraintRow from './GlobalConstraintRow';
import LocalConstraintBlock from './LocalConstraintBlock';
import { getDefaultParameter } from './ConstraintSchema';

export default function ConstraintTable({ mode, globalConstraints, localBlocks, onChangeGlobal, onChangeLocal, isMobile }) {

    const addGlobal = () => {
        const newConstraint = { id: Date.now(), modifier: 'must', type: 'be between', parameter: getDefaultParameter('be between') };
        onChangeGlobal([...globalConstraints, newConstraint]);
    };

    const addLocalBlock = () => {
        const newBlock = { id: Date.now(), modifier: 'must', entity: [], children: [] };
        onChangeLocal([...localBlocks, newBlock]);
    };

    const updateGlobal = (id, updated) => {
        onChangeGlobal(globalConstraints.map(c => c.id === id ? updated : c));
    };

    const removeGlobal = (id) => {
        onChangeGlobal(globalConstraints.filter(c => c.id !== id));
    };

    const updateLocal = (id, updated) => {
        onChangeLocal(localBlocks.map(b => b.id === id ? updated : b));
    };

    const removeLocal = (id) => {
        onChangeLocal(localBlocks.filter(b => b.id !== id));
    };

    if (isMobile) {
        return (
            <div className="flex flex-col gap-4 w-full">
                {mode === 'global' ? (
                    <>
                        {globalConstraints.map(c => (
                            <GlobalConstraintRow key={c.id} constraint={c} onChange={(u) => updateGlobal(c.id, u)} onRemove={() => removeGlobal(c.id)} isMobile={true} />
                        ))}
                        <button onClick={addGlobal} className="w-full py-4 rounded-2xl border-2 border-dashed border-[#DC8379]/20 text-[#DC8379]/60 hover:text-[#DC8379] hover:border-[#DC8379]/40 hover:bg-white/5 transition-all font-bold text-lg cursor-pointer" style={{ fontFamily: 'cursive' }}>
                            + Add Constraint
                        </button>
                    </>
                ) : (
                    <>
                        {localBlocks.map(b => (
                            <LocalConstraintBlock key={b.id} block={b} onChange={(u) => updateLocal(b.id, u)} onRemove={() => removeLocal(b.id)} isMobile={true} />
                        ))}
                        <button onClick={addLocalBlock} className="w-full py-4 rounded-2xl border-2 border-dashed border-[#DC8379]/20 text-[#DC8379]/60 hover:text-[#DC8379] hover:border-[#DC8379]/40 hover:bg-white/5 transition-all font-bold text-lg cursor-pointer" style={{ fontFamily: 'cursive' }}>
                            + Add New Block
                        </button>
                    </>
                )}
            </div>
        );
    }

    // Desktop
    return (
        <div className="bg-[var(--bg-raised)] border border-[var(--border-subtle)] rounded-xl overflow-hidden w-full flex flex-col">
            {/* Headers */}
            <div className="flex items-center border-b border-[var(--border-subtle)] bg-[var(--bg-purple)] text-center">
                <div className="w-12 shrink-0"></div>
                <div className="w-32 sm:w-40 shrink-0 border-r border-[var(--border-subtle)]/40 py-2 px-3">
                    <span className="text-[#DC8379] font-normal text-xl tracking-wide" style={{ fontFamily: 'cursive' }}>Modifiers</span>
                </div>
                <div className="w-40 sm:w-48 shrink-0 border-r border-[var(--border-subtle)]/40 py-2 px-3">
                    <span className="text-[#DC8379] font-normal text-xl tracking-wide" style={{ fontFamily: 'cursive' }}>Constraints</span>
                </div>
                <div className="flex-1 py-2 px-3">
                    <span className="text-[#DC8379] font-normal text-xl tracking-wide" style={{ fontFamily: 'cursive' }}>Parameters</span>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-col">
                {mode === 'global' ? (
                    <>
                        {globalConstraints.map(c => (
                            <GlobalConstraintRow key={c.id} constraint={c} onChange={(u) => updateGlobal(c.id, u)} onRemove={() => removeGlobal(c.id)} isMobile={false} />
                        ))}
                        <div className="flex items-center hover:bg-white/5 transition-colors cursor-pointer group/add" onClick={addGlobal}>
                            <div className="w-12 shrink-0"></div>
                            <div className="w-32 sm:w-40 shrink-0 border-r border-[#DC8379]/10 py-2 px-3 text-center">
                                <span className="text-[#DC8379]/40 text-base group-hover/add:text-[#DC8379]/80 transition-colors" style={{ fontFamily: 'cursive' }}>——</span>
                            </div>
                            <div className="w-40 sm:w-48 shrink-0 border-r border-[#DC8379]/10 py-2 px-3 text-center">
                                <span className="text-[#DC8379]/40 text-base group-hover/add:text-[#DC8379]/80 transition-colors" style={{ fontFamily: 'cursive' }}>——</span>
                            </div>
                            <div className="flex-1 py-2 px-3">
                                <span className="text-[#DC8379]/40 text-base group-hover/add:text-[#DC8379]/80 transition-colors italic" style={{ fontFamily: 'cursive' }}>Choose to add constraint</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {localBlocks.map(b => (
                            <LocalConstraintBlock key={b.id} block={b} onChange={(u) => updateLocal(b.id, u)} onRemove={() => removeLocal(b.id)} isMobile={false} />
                        ))}
                        <div className="flex items-center hover:bg-white/5 transition-colors cursor-pointer group/add" onClick={addLocalBlock}>
                            <div className="w-12 shrink-0"></div>
                            <div className="w-32 sm:w-40 shrink-0 border-r border-[#DC8379]/10 py-2 px-3 text-center">
                                <span className="text-[#DC8379]/40 text-base group-hover/add:text-[#DC8379]/80 transition-colors" style={{ fontFamily: 'cursive' }}>——</span>
                            </div>
                            <div className="w-40 sm:w-48 shrink-0 border-r border-[#DC8379]/10 py-2 px-3 text-center">
                                <span className="text-[#DC8379]/40 text-base group-hover/add:text-[#DC8379]/80 transition-colors" style={{ fontFamily: 'cursive' }}>——</span>
                            </div>
                            <div className="flex-1 py-2 px-3">
                                <span className="text-[#DC8379]/40 text-base group-hover/add:text-[#DC8379]/80 transition-colors italic" style={{ fontFamily: 'cursive' }}>Choose to add new block</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
