// utils/planner/candidate_scoring.js

/**
 * STEP 6: Quality Scoring & Ranking
 * 
 * INTENTION:
 * Evaluates the 'goodness' of each valid candidate. We use a weighted 
 * formula to rank slots by how well they satisfy user preferences, 
 * attendance goals, and operational efficiency.
 * 
 * SCORING COMPONENTS:
 * - Attendance (40%): Percentage of invited people who are free.
 * - Duration Fit (25%): Proximity to the 'should last' target.
 * - Preferences (20%): Compliance with 'should' curfews.
 * - Earliness (10%): Reward for slots that occur sooner.
 * - Padding (5%): Bonus for extra breathing room between events.
 * 
 * KEY DECISION:
 * All individual metric scores are strictly clamped to [0, 100]. This 
 * ensures the final weighted total never exceeds 100%, even with bonuses.
 * 
 * INPUT SHAPE:
 * - time_constraints: Normalized buckets (Step 1).
 * - candidates:       Filter-passed candidates (Step 5).
 * - all_entities:     Full list of expanded IDs.
 * 
 * OUTPUT SHAPE:
 * - ScoredCandidate[] (Sorted Descending)
 *   ScoredCandidate: { ..., score: Number, breakdown: { attendance, duration_fit, etc } }
 */

const score_candidates = (time_constraints, candidates, all_entities = []) => {
    if (!candidates.length) return [];
    const global_tc = time_constraints?.global || {};
    const local_tc  = time_constraints?.local  || {};

    const rs = global_tc.range_start ? new Date(global_tc.range_start).getTime() : 0;
    const re = global_tc.range_end ? new Date(global_tc.range_end).getTime() : Date.now();
    const range_span = re - rs || 1;
    const target_dur = global_tc.should_last ?? global_tc.must_last ?? null;

    const scored = candidates.map(c => {
        const breakdown = {};

        // 1. Attendance
        const total = Math.max(all_entities.length, c.available.length);
        breakdown.attendance = Math.min(100, (c.available.length / (total || 1)) * 100);

        // 2. Duration Fit
        let d_score = 100;
        if (target_dur != null) {
            const diff = Math.abs(c.duration - target_dur) / target_dur;
            d_score = Math.max(0, 100 * (1 - diff));
        }
        breakdown.duration_fit = Math.min(100, d_score);

        // 3. Preference Time
        breakdown.pref_time = Math.min(100, compute_pref_score(c, global_tc, local_tc));

        // 3.5 Peak Time Bonus (2 PM - 6 PM)
        const peak_start = 14 * 60; // 2:00 PM
        const peak_end   = 18 * 60; // 6:00 PM
        const s_m = c.start.getHours() * 60 + c.start.getMinutes();
        const e_m = c.end.getHours() * 60 + c.end.getMinutes();
        const overlap = Math.max(0, Math.min(e_m, peak_end) - Math.max(s_m, peak_start));
        breakdown.peak_time = Math.min(100, (overlap / (c.duration || 1)) * 100);

        // 4. Earliness
        const pos = (c.start.getTime() - rs) / range_span;
        breakdown.earliness = Math.min(100, Math.max(0, 100 * (1 - pos)));

        // 5. Padding Comfort
        const req_pad = global_tc.padding || 0;
        const extra = Math.max(0, c.duration - (target_dur || c.duration) - req_pad * 2);
        breakdown.padding_comfort = Math.min(100, (extra / 60) * 100);

        // Weighted Total
        const raw = (0.35 * breakdown.attendance) + (0.20 * breakdown.duration_fit) + 
                    (0.15 * breakdown.pref_time)  + (0.15 * breakdown.peak_time) +
                    (0.10 * breakdown.earliness)  + (0.05 * breakdown.padding_comfort);
        
        return { ...c, score: Math.min(100, Math.round(raw)), breakdown };
    });

    const initial_scored = scored.sort((a, b) => b.score - a.score || a.start - b.start);
    
    // ── Diversity Reranking ──────────────────────────────────────────────
    // We want to avoid returning 5 results that are all 15 mins apart on the same day.
    const final_top = [];
    const remaining = [...initial_scored];
    const top_n_limit = Math.min(remaining.length, 11);

    while (final_top.length < top_n_limit && remaining.length > 0) {
        // 1. Sort remaining by current score
        remaining.sort((a, b) => b.score - a.score);
        
        // 2. Pick the best
        const best = remaining.shift();
        final_top.push(best);

        // 3. Penalize similar ones in the remaining pool
        for (const cand of remaining) {
            const sameDay = cand.start.toDateString() === best.start.toDateString();
            const timeDiff = Math.abs(cand.start.getTime() - best.start.getTime()) / (1000 * 60 * 60); // hours

            if (sameDay) {
                // Same day penalty: 15 points
                cand.score -= 15;
                // If very close in time (within 3 hours), extra penalty
                if (timeDiff < 3) cand.score -= 20;
            }
        }
    }

    return final_top;
};

const compute_pref_score = (c, global_tc, local_tc) => {
    const soft = [...(global_tc.curfews || [])].filter(x => x.modifier === 'should');
    for (const eid of c.available) {
        const l = local_tc[eid.toString()];
        if (l?.curfews) soft.push(...l.curfews.filter(x => x.modifier === 'should'));
    }
    if (!soft.length) return 80;

    const s_m = c.start.getHours() * 60 + c.start.getMinutes();
    const e_m = c.end.getHours() * 60 + c.end.getMinutes();
    let total = 0;
    for (const cur of soft) {
        const target = parse_p(cur.parameter);
        if (cur.type === 'start before') total += Math.max(0, 100 - Math.max(0, s_m - target) / 60 * 50);
        else if (cur.type === 'start after') total += Math.max(0, 100 - Math.max(0, target - s_m) / 60 * 50);
        else if (cur.type === 'end before') total += Math.max(0, 100 - Math.max(0, e_m - target) / 60 * 50);
        else if (cur.type === 'end after') total += Math.max(0, 100 - Math.max(0, target - e_m) / 60 * 50);
    }
    return total / soft.length;
};

const parse_p = (p) => {
    if (typeof p === 'string') {
        const [t, m] = p.split(' '); let [h, mn] = t.split(':').map(Number);
        if (m === 'PM' && h < 12) h += 12; if (m === 'AM' && h === 12) h = 0; return h * 60 + mn;
    }
    let h = p.hours || 0; if (p.ampm === 'PM' && h < 12) h += 12; if (p.ampm === 'AM' && h === 12) h = 0;
    return h * 60 + (p.minutes || 0);
};

const format_results = (scored, entity_map = {}, top_n = 3) => {
    const fmt_d = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const fmt_t = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const fmt_dur = (m) => {
        const h = Math.floor(m/60); const mn = Math.round(m%60);
        return h === 0 ? `${mn}min` : (mn === 0 ? `${h}hr` : `${h}hr ${mn}min`);
    };

    const make = (c) => ({
        date: fmt_d(c.start), 
        time: fmt_t(c.start), 
        endTime: fmt_t(c.end),
        duration: fmt_dur(c.duration),
        score: c.score, 
        attendees: c.available.map(id => entity_map[id] || { id }),
        breakdown: c.breakdown, 
        _raw: { start: c.start, end: c.end }
    });

    const [best, ...rest] = scored.slice(0, top_n);
    return { bestOption: best ? make(best) : null, alternatives: rest.map(make) };
};

module.exports = { score_candidates, format_results };
