// utils/planner/candidate_generation.js

/**
 * STEP 3 + 3.5 of the planning algorithm.
 *
 * Step 3 — Generate all candidate windows by pairing every Birth Point with
 *           every Death Point that comes AFTER it.
 *
 *           A candidate is valid only if the same set of entities is
 *           continuously free throughout [birth, death] — i.e., no entity in
 *           the candidate's `available` set enters a busy block between the
 *           two endpoints.
 *
 *           Output shape per candidate:
 *           {
 *               start:     Date,        // birth point
 *               end:       Date,        // death point
 *               duration:  number,      // minutes
 *               available: string[]     // entity IDs free throughout
 *           }
 *
 * Step 3.5 — Prune using two heuristics:
 *   A) Same-start dominance: if two candidates share the same start time and
 *      the same participant set, discard the shorter one.
 *   B) Strict subset dominance: if candidate A covers the same time span but
 *      has strictly fewer available entities than candidate B, discard A.
 *
 * @param {Object} time_constraints  - Output of extract_time_constraints
 * @param {Object} split_points      - Output of calculate_split_points
 *   { birth: [[Date, string[]], ...], death: [[Date, string[]], ...] }
 * @param {Array}  activities        - Output of generate_busy_blocks
 *   [{ id, start: Date, end: Date, participants: string[] }, ...]
 *
 * @returns {{ candidates: Candidate[], pruned: Candidate[] }}
 *   `candidates`  — full list before pruning
 *   `pruned`      — list after pruning (use this for subsequent steps)
 */
const generate_candidates = (time_constraints, split_points, activities) => {
    const { birth, death } = split_points;

    if (!birth.length || !death.length) {
        console.warn('[candidate_gen] No split points — returning empty list');
        return { candidates: [], pruned: [] };
    }

    const candidates = [];

    // ── Iterate every Birth × Death pair where death > birth ──────────────
    for (const [b_time, b_entities] of birth) {
        const b_ms = b_time.getTime();

        for (const [d_time, _d_entities] of death) {
            const d_ms = d_time.getTime();

            // Death must strictly follow birth
            if (d_ms <= b_ms) continue;

            // The entities "available" for this candidate are those that
            // were free at the birth point AND remain free until death.
            const available = b_entities.filter(eid =>
                is_free_throughout(eid, b_time, d_time, activities)
            );

            if (!available.length) continue;

            candidates.push({
                start:     b_time,
                end:       d_time,
                duration:  (d_ms - b_ms) / 60000,   // minutes
                available
            });
        }
    }

    console.log(`[candidate_gen] Raw candidates: ${candidates.length}`);

    const pruned = prune_candidates(candidates);

    console.log(`[candidate_gen] After pruning: ${pruned.length}`);

    return { candidates, pruned };
};

/* =========================================================
   STEP 3.5 — Pruning
   ========================================================= */

/**
 * Applies two pruning heuristics and returns the surviving candidates.
 *
 * Heuristic A — Same-start + same-participants → keep longest only.
 * Heuristic B — Same time span + strict entity subset → discard the smaller.
 *
 * @param {Candidate[]} candidates
 * @returns {Candidate[]}
 */
const prune_candidates = (candidates) => {
    let pool = candidates;

    // ── A: Same start & same entity set → keep longest ───────────────────
    const start_key = (c) =>
        `${c.start.getTime()}|${sorted_ids(c.available).join(',')}`;

    const by_start = new Map();
    for (const c of pool) {
        const key = start_key(c);
        if (!by_start.has(key) || c.duration > by_start.get(key).duration) {
            by_start.set(key, c);
        }
    }
    pool = Array.from(by_start.values());

    // ── B: Same span + strict subset of entities → discard ───────────────
    // For each pair, if A.start == B.start && A.end == B.end && A.available ⊂ B.available
    // then A is dominated by B.
    const dominated = new Set();

    for (let i = 0; i < pool.length; i++) {
        if (dominated.has(i)) continue;
        const a = pool[i];
        const a_ids = new Set(a.available);

        for (let j = 0; j < pool.length; j++) {
            if (i === j || dominated.has(j)) continue;
            const b = pool[j];

            if (
                a.start.getTime() === b.start.getTime() &&
                a.end.getTime()   === b.end.getTime()   &&
                is_strict_subset(a_ids, new Set(b.available))
            ) {
                dominated.add(i);
                break;
            }
        }
    }

    pool = pool.filter((_, i) => !dominated.has(i));

    return pool;
};

/* =========================================================
   HELPERS
   ========================================================= */

/**
 * Returns true if entity `eid` has no busy block overlapping
 * the open interval (start, end) — exclusive on both ends.
 */
const is_free_throughout = (eid, start, end, activities) => {
    const s = start.getTime();
    const e = end.getTime();

    for (const act of activities) {
        const as = act.start.getTime();
        const ae = act.end.getTime();

        // Overlap: activity starts before end AND ends after start
        if (as < e && ae > s) {
            const participants = act.participants || [];
            if (participants.some(p => p.toString() === eid.toString())) {
                return false;
            }
        }
    }
    return true;
};

/**
 * Returns true if `a` is a strict subset of `b` (a ⊊ b).
 */
const is_strict_subset = (a, b) => {
    if (a.size >= b.size) return false;
    for (const x of a) if (!b.has(x)) return false;
    return true;
};

/** Sorts entity IDs for stable key generation. */
const sorted_ids = (ids) => [...ids].sort();

/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = { generate_candidates, prune_candidates };
