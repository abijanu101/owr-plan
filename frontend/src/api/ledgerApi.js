export const getLedger = async (id) => {
    try {
        const res = await fetch(`/api/ledgers/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Ledger not found');
        const data = await res.json();
        return data.success ? data.data.ledger : null;
    } catch (err) {
        console.error('Failed to get ledger:', err);
        throw err;
    }
};

export const listMyLedgers = async () => {
    try {
        const res = await fetch('/api/ledgers/my', { credentials: 'include' });
        if (!res.ok) return [];
        const data = await res.json();
        return data.success ? data.data.ledgers : [];
    } catch (err) {
        console.error('Failed to list ledgers:', err);
        return [];
    }
};

export const deleteLedger = async (id) => {
    try {
        const res = await fetch(`/api/ledgers/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return res.ok;
    } catch (err) {
        console.error('Failed to delete ledger:', err);
        return false;
    }
};

export const createSettledLedger = async (data) => {
    try {
        const res = await fetch('/api/ledgers/settle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        const result = await res.json();
        return result.success ? result.data.ledger : null;
    } catch (err) {
        console.error('Failed to create settled ledger:', err);
        throw err;
    }
};

export const toggleSettlementPaid = async (ledgerId, settlementId) => {
    try {
        const res = await fetch(`/api/ledgers/${ledgerId}/settlements/${settlementId}`, {
            method: 'PATCH',
            credentials: 'include'
        });
        const data = await res.json();
        return data.success ? data.data.ledger : null;
    } catch (err) {
        console.error('Failed to toggle settlement status:', err);
        return null;
    }
};
