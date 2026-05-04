export const generatePlan = async (constraints) => {
    try {
        const res = await fetch('/api/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ constraints }),
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
