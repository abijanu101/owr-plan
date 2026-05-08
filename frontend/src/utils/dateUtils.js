/**
 * Recursively scans an object or array and converts all Date objects 
 * into timezone-agnostic "YYYY-MM-DD" strings.
 */
export const normalizeDates = (obj) => {
    if (obj instanceof Date) {
        const y = obj.getFullYear();
        const m = String(obj.getMonth() + 1).padStart(2, '0');
        const d = String(obj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    if (Array.isArray(obj)) return obj.map(normalizeDates);
    if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [k, normalizeDates(v)])
        );
    }
    return obj;
};
