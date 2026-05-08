// utils/planner/candidate_elimination.js

/**
 * STEP 5: Hard Constraint Elimination
 * 
 * INTENTION:
 * Discards any candidate that violates a "Must" (hard) constraint. This 
 * ensures that every result passed to the scoring engine is a valid 
 * proposal that satisfies all non-negotiable user requirements.
 * 
 * KEY DECISION:
 * We strictly separate "Must" from "Should". Violating a "Must" results 
 * in immediate elimination, whereas "Should" violations only lower the 
 * final quality score in Step 6.
 * 
 * INPUT SHAPE:
 * - time_constraints: Normalized temporal rules (Step 1).
 * - candidates:       Array of Proposed Windows (Step 4).
 * - mandatory_participants: List of IDs that MUST be free.
 * 
 * OUTPUT SHAPE:
 * - { passed: Candidate[], eliminated: Candidate[], reasons: Map<Candidate, string[]> }
 */

const eliminate_candidates = (time_constraints, candidates, mandatory_participants = []) => {
    const global_tc = time_constraints?.global || {};
    const local_tc  = time_constraints?.local  || {};

    const passed     = [];
    const eliminated = [];
    const reasons    = new Map();

    for (const candidate of candidates) {
        const violations = check_violations(candidate, global_tc, local_tc, mandatory_participants);
        if (violations.length === 0) {
            passed.push(candidate);
        } else {
            console.log(`[ elimin] Eliminated ${candidate.start.toISOString()} -> ${candidate.end.toISOString()}:`, violations);
            eliminated.push(candidate);
            reasons.set(candidate, violations);
        }
    }

    return { passed, eliminated, reasons };
};

const check_violations = (candidate, global_tc, local_tc, mandatory_participants = []) => {
    const viols = [];

    // 1. Duration Check
    if (global_tc.must_last != null && candidate.duration < global_tc.must_last) {
        viols.push(`duration ${Math.round(candidate.duration)}m < required ${global_tc.must_last}m`);
    }

    // 2. Mandatory Participants Check
    const available = new Set(candidate.available.map(id => id.toString()));
    const missing = mandatory_participants.filter(id => !available.has(id.toString()));
    if (missing.length > 0) viols.push(`missing mandatory: ${missing.join(', ')}`);

    // 3. Global Curfews
    for (const curfew of (global_tc.curfews || [])) {
        const v = check_curfew(curfew, candidate);
        if (v) viols.push(`[global] ${v}`);
    }

    // 4. Local Entity Constraints
    for (const eid of candidate.available) {
        const local = local_tc[eid.toString()];
        if (!local) continue;
        if (local.must_last != null && candidate.duration < local.must_last) viols.push(`entity ${eid}: too short`);
        for (const curfew of (local.curfews || [])) {
            const v = check_curfew(curfew, candidate);
            if (v) viols.push(`entity ${eid}: ${v}`);
        }
    }

    return viols;
};

const check_curfew = (curfew, candidate) => {
    if (curfew.modifier !== 'must') return null;
    const { type, parameter } = curfew;
    const curfew_mins  = parse_mins(parameter);
    const start_mins = time_mins(candidate.start);
    const end_mins   = time_mins(candidate.end);

    if (type === 'start before' && start_mins > curfew_mins) return `start before ${fmt_m(curfew_mins)}`;
    if (type === 'start after'  && start_mins < curfew_mins) return `start after ${fmt_m(curfew_mins)}`;
    if (type === 'end before'   && end_mins > curfew_mins)   return `end before ${fmt_m(curfew_mins)}`;
    if (type === 'end after'    && end_mins < curfew_mins)   return `end after ${fmt_m(curfew_mins)}`;
    return null;
};

const time_mins = (d) => d.getHours() * 60 + d.getMinutes();
const parse_mins = (p) => {
    if (typeof p === 'string') {
        const [t, m] = p.split(' '); let [h, mn] = t.split(':').map(Number);
        if (m === 'PM' && h < 12) h += 12; if (m === 'AM' && h === 12) h = 0; return h * 60 + mn;
    }
    let h = p.hours || 0; if (p.ampm === 'PM' && h < 12) h += 12; if (p.ampm === 'AM' && h === 12) h = 0;
    return h * 60 + (p.minutes || 0);
};
const fmt_m = (m) => {
    let h = Math.floor(m / 60) % 24; const mn = m % 60; const p = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12; return `${h}:${String(mn).padStart(2, '0')} ${p}`;
};

module.exports = { eliminate_candidates };
