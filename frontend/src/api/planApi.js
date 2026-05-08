import { normalizeDates } from '../utils/dateUtils';

export const generatePlan = async (constraints) => {
    try {
        const normalized = normalizeDates(constraints);
        const res = await fetch('/api/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ constraints: normalized }),
            credentials: 'include'
        });
        
        if (!res.ok) {
            throw new Error('Failed to generate plan');
        }
        
        return await res.json();
    } catch (err) {
        console.error('Plan API error:', err);
        throw err;
    }
};
