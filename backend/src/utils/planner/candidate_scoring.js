// utils/planner/candidate_scoring.js

/**
 * STEP 5 of the planning algorithm.
 *
 * Evaluates the quality of each surviving candidate and ranks them.
 *
 * Score components (all normalised to 0–100 before weighting):
 *
 *   ① Attendance      (40%)  — fraction of involved entities that are available.
 *   ② Duration fit    (25%)  — how close the candidate's duration is to the
 *                              target (should_last if present, else must_last).
 *   ③ Preference time (20%)  — how well the window's start aligns with "should"
 *                              curfews (start after / start before soft rules).
 *   ④ Earliness       (10%)  — prefer slots that come sooner in the range.
 *   ⑤ Padding comfort  (5%)  — bonus for candidates that have more breathing room
 *                              than the minimum required.
 *
 * @param {Object}      time_constraints  - Output of extract_time_constraints
 * @param {Candidate[]} candidates        - Elimination-passed candidates
 * @param {string[]}    all_entities      - All entity IDs involved in the plan
 *
 * @returns {ScoredCandidate[]}  Sorted descending by score.
 *   Each: { start, end, duration, available, score, breakdown }
 */
const score_candidates = (time_constraints, candidates, all_entities = []) => {
    if (!candidates.length) return [];

    const global_tc = time_constraints?.global || {};
    const local_tc  = time_constraints?.local  || {};

    const range_start_ms = global_tc.range_start
        ? new Date(global_tc.range_start).getTime()
        : 0;
    const range_end_ms   = global_tc.range_end
        ? new Date(global_tc.range_end).getTime()
        : Date.now() + 7 * 24 * 60 * 60 * 1000;

    const range_span_ms = range_end_ms - range_start_ms || 1;

    // Target duration (minutes): prefer should_last, fall back to must_last
    const target_duration =
        global_tc.should_last ??
        global_tc.must_last  ??
        null;

    const scored = candidates.map(candidate => {
        const breakdown = {};

        // ── ① Attendance ──────────────────────────────────────────────────
        const total_entities = all_entities.length || candidate.available.length;
        const attendance_ratio = total_entities > 0
            ? candidate.available.length / total_entities
            : 1;
        breakdown.attendance = round2(attendance_ratio * 100);

        // ── ② Duration fit ────────────────────────────────────────────────
        let duration_score = 100;
        if (target_duration != null) {
            const diff_ratio = Math.abs(candidate.duration - target_duration) / target_duration;
            // Perfect at 0 diff, decays to 0 at 2× or 0× of target
            duration_score = Math.max(0, 100 * (1 - diff_ratio));
        }
        breakdown.duration_fit = round2(duration_score);

        // ── ③ Preference time (soft curfews) ─────────────────────────────
        const pref_score = compute_pref_score(candidate, global_tc, local_tc);
        breakdown.pref_time = round2(pref_score);

        // ── ④ Earliness ───────────────────────────────────────────────────
        // A candidate at range_start scores 100; one at range_end scores 0.
        const pos_in_range =
            (candidate.start.getTime() - range_start_ms) / range_span_ms;
        const earliness_score = Math.max(0, 100 * (1 - pos_in_range));
        breakdown.earliness = round2(earliness_score);

        // ── ⑤ Padding comfort ─────────────────────────────────────────────
        const required_padding = global_tc.padding || 0;
        // Extra buffer beyond the required minimum (caps at 60 min bonus)
        const extra_buffer = Math.max(0, candidate.duration - (target_duration || candidate.duration) - required_padding * 2);
        const padding_score = Math.min(100, extra_buffer / 60 * 100);
        breakdown.padding_comfort = round2(padding_score);

        // ── Weighted total ─────────────────────────────────────────────────
        const score = round2(
            0.40 * breakdown.attendance    +
            0.25 * breakdown.duration_fit  +
            0.20 * breakdown.pref_time     +
            0.10 * breakdown.earliness     +
            0.05 * breakdown.padding_comfort
        );

        return { ...candidate, score, breakdown };
    });

    // Sort descending by score, then ascending by start time as tiebreaker
    scored.sort((a, b) => b.score - a.score || a.start - b.start);

    console.log(
        `[scoring] Top score: ${scored[0]?.score ?? 'n/a'} | ` +
        `Ranked ${scored.length} candidates`
    );

    return scored;
};

/* =========================================================
   PREFERENCE TIME SCORER
   ========================================================= */

/**
 * Evaluates how well a candidate's start/end aligns with "should" curfews.
 * Returns 0–100 (100 = perfectly aligned with all soft preferences).
 */
const compute_pref_score = (candidate, global_tc, local_tc) => {
    const all_curfews = [...(global_tc.curfews || [])];

    // Collect "should" curfews from entities actually present in the candidate
    for (const eid of candidate.available) {
        const local = local_tc[eid.toString()];
        if (local?.curfews) all_curfews.push(...local.curfews);
    }

    const should_curfews = all_curfews.filter(c => c.modifier === 'should');
    if (!should_curfews.length) return 80; // neutral when no soft preferences

    let total = 0;
    let count = 0;

    const start_day_mins = time_of_day_mins(candidate.start);
    const end_day_mins   = time_of_day_mins(candidate.end);

    for (const curfew of should_curfews) {
        const target_mins = parse_time_param(curfew.parameter);
        const { type } = curfew;

        if (type === 'start before') {
            // 100 if start <= target, decays linearly as start goes past target
            const over = Math.max(0, start_day_mins - target_mins);
            total += Math.max(0, 100 - over / 60 * 50);
        } else if (type === 'start after') {
            const under = Math.max(0, target_mins - start_day_mins);
            total += Math.max(0, 100 - under / 60 * 50);
        } else if (type === 'end before') {
            const over = Math.max(0, end_day_mins - target_mins);
            total += Math.max(0, 100 - over / 60 * 50);
        } else if (type === 'end after') {
            const under = Math.max(0, target_mins - end_day_mins);
            total += Math.max(0, 100 - under / 60 * 50);
        }

        count++;
    }

    return count > 0 ? total / count : 80;
};

/* =========================================================
   RESULT FORMATTING
   ========================================================= */

/**
 * Formats the top-N scored candidates into the response shape
 * expected by the frontend.
 *
 * @param {ScoredCandidate[]} scored_candidates
 * @param {Object}            entity_map  - { [id]: { name, color, ... } }
 * @param {number}            [top_n=3]
 */
const format_results = (scored_candidates, entity_map = {}, top_n = 3) => {
    const fmt_date = (d) =>
        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const fmt_time = (d) =>
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const fmt_duration = (mins) => {
        const h = Math.floor(mins / 60);
        const m = Math.round(mins % 60);
        if (h === 0) return `${m}min`;
        return m === 0 ? `${h}hr` : `${h}hr ${m}min`;
    };

    const make_entry = (c) => ({
        date:      fmt_date(c.start),
        time:      fmt_time(c.start),
        duration:  fmt_duration(c.duration),
        score:     Math.round(c.score),
        attendees: c.available.map(id => entity_map[id] || { id }),
        breakdown: c.breakdown,
        _raw: { start: c.start, end: c.end }
    });

    const [best, ...rest] = scored_candidates.slice(0, Math.max(1, top_n));

    return {
        bestOption:   best ? make_entry(best) : null,
        alternatives: rest.map(make_entry)
    };
};

/* =========================================================
   UTILS
   ========================================================= */

const time_of_day_mins = (date) =>
    date.getHours() * 60 + date.getMinutes();

const parse_time_param = (param) => {
    if (!param) return 0;
    if (typeof param === 'string') {
        const [time, period] = param.trim().split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h < 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return h * 60 + (m || 0);
    }
    let h = param.hours || 0;
    const m = param.minutes || 0;
    if (param.ampm === 'PM' && h < 12) h += 12;
    if (param.ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
};

const round2 = (n) => Math.round(n * 100) / 100;

/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = { score_candidates, format_results };
