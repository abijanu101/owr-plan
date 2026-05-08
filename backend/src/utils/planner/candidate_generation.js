// utils/planner/candidate_generation.js

/**
 * STEP 4: Candidate Generation & Pruning
 * 
 * Pairs Birth Points (moments someone becomes free) with Death Points 
 * (moments someone becomes busy) to create potential time windows.
 * 
 * INTENTION:
 * Generate a comprehensive set of valid time slots. We prioritize
 * 'Under-pruning' to ensure the scoring engine has enough variety to 
 * find the true best fit (e.g., matching a 1.5h request inside a 4h gap).
 * 
 * INPUT SHAPE:
 * - time_constraints: { global: { must_last, should_last }, local: { ... } }
 * - split_points:     { birth: [[Date, [eid]], ...], death: [[Date, [eid]], ...] }
 * - activities:       Concrete busy blocks [{ start, end, participants }]
 * - all_entities:     Full list of expanded participant IDs
 * 
 * OUTPUT SHAPE:
 * - { candidates: Candidate[], pruned: Candidate[] }
 *   Candidate: { start: Date, end: Date, duration: mins, available: string[] }
 */

const generate_candidates = (time_constraints, split_points, activities, all_entities = []) => {
    const { birth, death } = split_points;
    const global_tc = time_constraints?.global || {};

    if (!birth.length || !death.length) {
        console.warn('[candidate_gen] No split points — returning empty list');
        return { candidates: [], pruned: [] };
    }

    const candidates = [];

    // 1. GENERATION: Pair every Birth with every subsequent Death
    for (const [b_time] of birth) {
        const b_ms = b_time.getTime();

        for (const [d_time] of death) {
            const d_ms = d_time.getTime();
            if (d_ms <= b_ms) continue;

            // Check who is free throughout the ENTIRE span
            const available = all_entities.filter(eid =>
                is_free_throughout(eid, b_time, d_time, activities)
            );

            if (!available.length) continue;

            const cand = {
                start: b_time,
                end: d_time,
                duration: (d_ms - b_ms) / 60000,
                available
            };
            
            console.log(`[   gen ] Created Raw: ${cand.start.toISOString()} -> ${cand.end.toISOString()} (Dur: ${cand.duration}m, Avail: ${available.length})`);
            candidates.push(cand);
        }
    }

    // 2. PRUNING: Deduplicate and discard strictly inferior options.
    const pruned = prune_candidates(candidates);

    return { candidates, pruned };
};

/**
 * UNDER-PRUNING STRATEGY:
 * We only discard a candidate if it is identical to another in [start, end, participants].
 * We do NOT prune based on duration fit here; we leave that to the scoring engine
 * so the user can see multiple valid ways to fill a gap.
 */
const prune_candidates = (candidates) => {
    const unique = new Map();

    for (const c of candidates) {
        const p_key = [...c.available].sort().join(',');
        const key = `${c.start.getTime()}|${c.end.getTime()}|${p_key}`;
        
        if (!unique.has(key)) {
            unique.set(key, c);
        }
    }

    return Array.from(unique.values());
};

const is_free_throughout = (eid, start, end, activities) => {
    const s = start.getTime();
    const e = end.getTime();

    for (const act of activities) {
        const as = act.start.getTime();
        const ae = act.end.getTime();

        if (as < e && ae > s) {
            const participants = act.participants || [];
            if (participants.some(p => p.toString() === eid.toString())) {
                return false;
            }
        }
    }
    return true;
};

module.exports = { generate_candidates, prune_candidates };
