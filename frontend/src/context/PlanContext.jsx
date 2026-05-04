import React, { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { getDefaultParameter } from '../components/Plan/Constraints/ConstraintSchema';
import Toast from '../components/UI/Toast';

// Context that holds the unified plan state
const PlanContext = createContext(null);

export const PlanProvider = ({ children }) => {
    // Hidden default constraints (must) – always present
    const hiddenDefaults = [
        // Include (entities)
        {
            id: 1,
            isBlock: false,
            modifier: 'must',
            type: 'include',
            parameter: [],
            isSystem: true,
        },
        // Duration (last for)
        {
            id: 2,
            isBlock: false,
            modifier: 'must',
            type: 'last for',
            parameter: { hours: 1, minutes: 30 },
            isSystem: true,
        },
        // Time window (be between)
        {
            id: 3,
            isBlock: false,
            modifier: 'must',
            type: 'be between',
            parameter: {
                start: { date: new Date(), time: '07:00 AM' },
                end: { date: new Date(), time: '11:59 PM' },
            },
            isSystem: true,
        },
        // Start after 07:00 (curfew)
        {
            id: 4,
            isBlock: false,
            modifier: 'must',
            type: 'start after',
            parameter: '07:00 AM',
            isSystem: true,
        },
        // End before 23:59 (curfew)
        {
            id: 5,
            isBlock: false,
            modifier: 'must',
            type: 'end before',
            parameter: '11:59 PM',
            isSystem: true,
        },
    ];

    // Example editable constraints (user‑visible)
    const exampleConstraints = [];

    const [constraints, setConstraintsInternal] = useState([...hiddenDefaults, ...exampleConstraints]);
    const [toast, setToast] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type, id: Date.now() });
    };

    const setConstraints = (update) => {
        let needsToast = false;
        
        setConstraintsInternal(prev => {
            let next = typeof update === 'function' ? update(prev) : update;

            // 1. Force custom 'include' constraints to be 'can'
            // 2. Prevent multiple custom 'include' constraints non-destructively
            const prevCustomIncludes = prev.filter(c => !c.isSystem && !c.isBlock && c.type === 'include');
            const nextCustomIncludes = next.filter(c => !c.isSystem && !c.isBlock && c.type === 'include');

            if (nextCustomIncludes.length > 1 && nextCustomIncludes.length > prevCustomIncludes.length) {
                needsToast = true;
                return prev;
            }

            // Force all custom includes to be 'can'
            next = next.map(c => {
                if (!c.isSystem && !c.isBlock && c.type === 'include' && c.modifier !== 'can') {
                    return { ...c, modifier: 'can' };
                }
                return c;
            });

            return next;
        });

        if (needsToast) {
            showToast("Only one 'can include' constraint can be added.", "warning");
        }
    };

    const resetPlan = () => setConstraints([...hiddenDefaults, ...exampleConstraints]);

    const updateSimplifiedConstraint = (type, newParameter) => {
        setConstraints(prev => {
            const idx = prev.findIndex(c => c.type === type);
            if (idx !== -1) {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], parameter: newParameter };
                return updated;
            }
            // If not found, add a new hidden constraint (should not normally happen)
            const newConstraint = {
                id: Date.now(),
                isBlock: false,
                modifier: 'must',
                type,
                parameter: newParameter,
                hidden: true,
            };
            return [...prev, newConstraint];
        });
    };

    const getSimplifiedConstraintParameter = (type) => {
        const found = constraints.find(c => c.type === type);
        return found ? found.parameter : getDefaultParameter(type);
    };

    // Validation Logic
    const validateConstraints = (list) => {
        // 1. Check start after vs end before (Curfews)
        const startAfter = list.find(c => !c.isBlock && c.type === 'start after' && c.modifier === 'must' && !c.disabled);
        const endBefore = list.find(c => !c.isBlock && c.type === 'end before' && c.modifier === 'must' && !c.disabled);

        const parseTime = (t) => {
            if (!t || typeof t !== 'string') return 0;
            const parts = t.split(' ');
            if (parts.length < 2) return 0;
            const [time, period] = parts;
            let [h, m] = time.split(':').map(Number);
            if (period === 'PM' && h !== 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;
            return h * 60 + m;
        };

        if (startAfter && endBefore) {
            if (parseTime(startAfter.parameter) >= parseTime(endBefore.parameter)) {
                return { consistent: false, message: "Constraints inconsistent: Curfew starts after it ends." };
            }
        }

        // 2. Check be between start vs end
        const beBetween = list.find(c => !c.isBlock && c.type === 'be between' && c.modifier === 'must' && !c.disabled);
        if (beBetween && beBetween.parameter?.start && beBetween.parameter?.end) {
            const start = new Date(beBetween.parameter.start.date);
            const end = new Date(beBetween.parameter.end.date);

            // For simple date check
            const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

            if (startDate > endDate) {
                return { consistent: false, message: "Constraints inconsistent: Planning range starts after it ends." };
            }

            // 3. Check duration vs window
            const duration = list.find(c => !c.isBlock && c.type === 'last for' && c.modifier === 'must' && !c.disabled);
            if (duration && duration.parameter) {
                // Calculate window duration in minutes
                // (This is a simplified check assuming the total window between the two dates)
                const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
                const durMinutes = (duration.parameter.hours || 0) * 60 + (duration.parameter.minutes || 0);

                if (durMinutes > totalMinutes && totalMinutes > 0) {
                    return { consistent: false, message: "Constraints inconsistent: Duration is longer than the total window." };
                }
            }
        }

        // 4. Check if attendees are selected (Required for generation)
        const include = list.find(c => !c.isBlock && c.type === 'include' && c.modifier === 'must' && !c.disabled);
        if (include && (!include.parameter || include.parameter.length === 0)) {
            return { consistent: false, message: "Select at least one attendee to generate a plan." };
        }

        return { consistent: true, message: "Constraints consistent, you may generate." };
    };

    const planStatus = validateConstraints(constraints);

    return (
        <PlanContext.Provider
            value={{
                constraints,
                setConstraints,
                resetPlan,
                updateSimplifiedConstraint,
                getSimplifiedConstraintParameter,
                showToast,
                planStatus,
                isGenerating,
                setIsGenerating,
                results,
                setResults
            }}
        >
            {toast && (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            {children || <Outlet />}
        </PlanContext.Provider>
    );
};

export const usePlan = () => {
    const ctx = useContext(PlanContext);
    if (!ctx) throw new Error('usePlan must be used within a PlanProvider');
    return ctx;
};

export default PlanContext;
