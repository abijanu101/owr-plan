// utils/planner/candidate_elimination.js

/**
 * STEP 4 of the planning algorithm.
 *
 * Iterates over all "must" constraints and discards any candidate that
 * violates them.
 *
 * Constraint types evaluated here:
 *
 *   ─ Duration ────────────────────────────────────────────────────────────
 *   • must_last (global)      → candidate.duration must be >= must_last (mins)
 *   • must_last (local/eid)   → candidate.duration must be >= must_last (mins)
 *                               (only when that entity is in available)
 *
 *   ─ Curfews ─────────────────────────────────────────────────────────────
 *   • "start before <time>"   → candidate.start must be before curfew time on its day
 *   • "start after  <time>"   → candidate.start must be after  curfew time on its day
 *   • "end   before <time>"   → candidate.end   must be before curfew time on its day
 *   • "end   after  <time>"   → candidate.end   must be after  curfew time on its day
 *   Curfews can be global or entity-scoped.
 *
 *   ─ Padding ─────────────────────────────────────────────────────────────
 *   • global.padding (mins)   → candidate.duration must leave at least `padding`
 *                               minutes of free time on each side.
 *                               Implemented as: duration must be <= (window_span - 2*padding).
 *                               (Actual padding gaps are enforced during scoring / slot fitting.)
 *
 * @param {Object}      time_constraints  - Output of extract_time_constraints
 * @param {Candidate[]} candidates        - Pruned candidates from candidate_generation
 *
 * @returns {{ passed: Candidate[], eliminated: Candidate[], reasons: Map }}
 *   `passed`     — candidates that passed all hard constraints
 *   `eliminated` — candidates that were rejected
 *   `reasons`    — Map<Candidate, string[]> explaining each rejection
 */
const eliminate_candidates = (time_constraints, candidates) => {
    const global_tc = time_constraints?.global || {};
    const local_tc  = time_constraints?.local  || {};

    const passed     = [];
    const eliminated = [];
    const reasons    = new Map();

    for (const candidate of candidates) {
        const violations = check_violations(candidate, global_tc, local_tc);

        if (violations.length === 0) {
            passed.push(candidate);
        } else {
            eliminated.push(candidate);
            reasons.set(candidate, violations);
        }
    }

    console.log(
        `[elimination] Passed: ${passed.length} | ` +
        `Eliminated: ${eliminated.length} / ${candidates.length}`
    );

    return { passed, eliminated, reasons };
};

/* =========================================================
   CORE VIOLATION CHECK
   ========================================================= */

/**
 * Returns an array of human-readable violation strings for this candidate.
 * Empty array means no violations.
 */
const check_violations = (candidate, global_tc, local_tc) => {
    const viols = [];

    // ── 1. Global must_last ─────────────────────────────────────────────
    if (global_tc.must_last != null && candidate.duration < global_tc.must_last) {
        viols.push(
            `duration ${Math.round(candidate.duration)}m < required ${global_tc.must_last}m`
        );
    }

    // ── 2. Global curfews ────────────────────────────────────────────────
    for (const curfew of (global_tc.curfews || [])) {
        const v = check_curfew(curfew, candidate);
        if (v) viols.push(`[global] ${v}`);
    }

    // ── 3. Global padding ────────────────────────────────────────────────
    // A candidate's span must be at least 2 × padding to allow gaps on both sides.
    // (If must_last is set, the window needs: must_last + 2*padding.)
    if (global_tc.padding > 0) {
        const min_required = (global_tc.must_last || 0) + 2 * global_tc.padding;
        if (candidate.duration < min_required) {
            viols.push(
                `window too short for padding: ` +
                `${Math.round(candidate.duration)}m < ${min_required}m (must_last + 2×padding)`
            );
        }
    }

    // ── 4. Per-entity local constraints ──────────────────────────────────
    for (const eid of candidate.available) {
        const local = local_tc[eid.toString()];
        if (!local) continue;

        // Local must_last
        if (local.must_last != null && candidate.duration < local.must_last) {
            viols.push(
                `entity ${eid}: duration ${Math.round(candidate.duration)}m ` +
                `< required ${local.must_last}m`
            );
        }

        // Local curfews
        for (const curfew of (local.curfews || [])) {
            const v = check_curfew(curfew, candidate);
            if (v) viols.push(`entity ${eid}: ${v}`);
        }

        // Local padding
        if (local.padding > 0) {
            const min_req = (local.must_last || 0) + 2 * local.padding;
            if (candidate.duration < min_req) {
                viols.push(
                    `entity ${eid}: window too short for padding ` +
                    `(${Math.round(candidate.duration)}m < ${min_req}m)`
                );
            }
        }
    }

    return viols;
};

/* =========================================================
   CURFEW CHECKER
   ========================================================= */

/**
 * Checks a single curfew against a candidate.
 * Returns a description string on violation, null on pass.
 *
 * Curfew shape: { type, modifier, parameter }
 *   type      : "start before" | "start after" | "end before" | "end after"
 *   modifier  : "must" | "should"   (we only hard-enforce "must" here)
 *   parameter : { hours, minutes }  OR a "HH:MM AM/PM" string
 */
const check_curfew = (curfew, candidate) => {
    // Only hard-enforce "must" curfews; "should" ones are for scoring
    if (curfew.modifier !== 'must') return null;

    const { type, parameter } = curfew;

    const curfew_mins  = parse_duration_or_time(parameter);
    const start_day_mins = time_of_day_mins(candidate.start);
    const end_day_mins   = time_of_day_mins(candidate.end);

    if (type === 'start before' && start_day_mins >= curfew_mins) {
        return `must start before ${fmt_mins(curfew_mins)} but starts at ${fmt_mins(start_day_mins)}`;
    }
    if (type === 'start after' && start_day_mins <= curfew_mins) {
        return `must start after ${fmt_mins(curfew_mins)} but starts at ${fmt_mins(start_day_mins)}`;
    }
    if (type === 'end before' && end_day_mins >= curfew_mins) {
        return `must end before ${fmt_mins(curfew_mins)} but ends at ${fmt_mins(end_day_mins)}`;
    }
    if (type === 'end after' && end_day_mins <= curfew_mins) {
        return `must end after ${fmt_mins(curfew_mins)} but ends at ${fmt_mins(end_day_mins)}`;
    }

    return null;
};

/* =========================================================
   UTILS
   ========================================================= */

/** Minutes since midnight for a Date. */
const time_of_day_mins = (date) =>
    date.getHours() * 60 + date.getMinutes();

/**
 * Accepts either:
 *   { hours, minutes }  → total minutes
 *   { hours, minutes, ampm }  → 12-hour clock minutes
 *   string "HH:MM AM"  → parsed minutes since midnight
 */
const parse_duration_or_time = (param) => {
    if (!param) return 0;

    if (typeof param === 'string') {
        const [time, period] = param.trim().split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h < 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return h * 60 + (m || 0);
    }

    // Object form
    let h = param.hours || 0;
    const m = param.minutes || 0;
    if (param.ampm === 'PM' && h < 12) h += 12;
    if (param.ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
};

/** Format minutes-since-midnight as "H:MM AM/PM". */
const fmt_mins = (total_mins) => {
    let h = Math.floor(total_mins / 60) % 24;
    const m = total_mins % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${String(m).padStart(2, '0')} ${period}`;
};

/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = { eliminate_candidates };
