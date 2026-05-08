// utils/planner/calculate_split_points.js

/**
 * STEP 3: Timeline Segmentation (Birth/Death Points)
 * 
 * INTENTION:
 * Divide the planning range into meaningful segments based on state changes.
 * We use a Birth/Death model:
 * - Birth: A moment someone becomes available (activity ends, window opens).
 * - Death: A moment someone becomes busy (activity starts, window closes).
 * 
 * KEY DECISION:
 * We inject "Target Duration" boundaries (Birth + Duration and Death - Duration).
 * This ensures the planner considers slots that exactly match the requested
 * length, even if there is no natural state change at that moment.
 * 
 * INPUT SHAPE:
 * - time_constraints: { global, local } temporal rules.
 * - activities:       Concrete busy blocks [{ start, end, participants }]
 * - all_entity_ids:   Array of participant IDs to track.
 * 
 * OUTPUT SHAPE:
 * - { birth: [[Date, [eid]], ...], death: [[Date, [eid]], ...] }
 */

const calculate_split_points = (time_constraints, activities, all_entity_ids = []) => {
    const global_tc  = time_constraints?.global  || {};
    const local_tc   = time_constraints?.local   || {};

    const participant_ids = Array.from(new Set([...all_entity_ids]));

    const target_duration_mins = global_tc.should_last || global_tc.must_last || 0;
    const target_duration_ms   = target_duration_mins * 60000;

    const birth_map = new Map();
    const death_map = new Map();

    const { windows: valid_windows, curfew_points } = resolve_valid_windows(time_constraints, participant_ids);

    if (!valid_windows.length) return { birth: [], death: [] };

    for (const window of valid_windows) {
        const win_start_ms = window.start.getTime();
        const win_end_ms   = window.end.getTime();

        // 1. WINDOW BOUNDARIES
        const busy_at_start = busy_entity_set_at(activities, window.start);
        const free_at_start = participant_ids.filter(id => !busy_at_start.has(id));
        if (free_at_start.length) push_to_map(birth_map, win_start_ms, free_at_start);

        const busy_before_end = busy_entity_set_at(activities, new Date(win_end_ms - 1));
        const free_before_end = participant_ids.filter(id => !busy_before_end.has(id));
        if (free_before_end.length) push_to_map(death_map, win_end_ms, free_before_end);

        // 1.5 CURFEW BOUNDARY POINTS
        const day_start_ms = new Date(window.start).setHours(0, 0, 0, 0);
        for (const mins of curfew_points) {
            const pt_ms = day_start_ms + mins * 60000;
            if (pt_ms > win_start_ms && pt_ms < win_end_ms) {
                const busy_at_pt = busy_entity_set_at(activities, new Date(pt_ms));
                const free_at_pt = participant_ids.filter(id => !busy_at_pt.has(id));
                if (free_at_pt.length) {
                    push_to_map(birth_map, pt_ms, free_at_pt);
                    push_to_map(death_map, pt_ms, free_at_pt);
                }
            }
        }

        // 2. ACTIVITY INTERSECTIONS
        for (const act of activities) {
            const as = act.start.getTime();
            const ae = act.end.getTime();
            const p  = act.participants || [];

            if (as > win_start_ms && as < win_end_ms) push_to_map(death_map, as, p);
            if (ae > win_start_ms && ae <= win_end_ms) push_to_map(birth_map, ae, p);
        }

        // 3. TARGET DURATION INJECTION
        // Inject suggested boundaries to encourage perfect fit matches.
        if (target_duration_ms > 0) {
            for (const b_ms of birth_map.keys()) {
                const sugg_death = b_ms + target_duration_ms;
                if (sugg_death > win_start_ms && sugg_death < win_end_ms) {
                    push_to_map(death_map, sugg_death, Array.from(birth_map.get(b_ms)));
                }
            }
            for (const d_ms of death_map.keys()) {
                const sugg_birth = d_ms - target_duration_ms;
                if (sugg_birth > win_start_ms && sugg_birth < win_end_ms) {
                    push_to_map(birth_map, sugg_birth, Array.from(death_map.get(d_ms)));
                }
            }
        }
    }

    return {
        birth: to_sorted_list(birth_map),
        death: to_sorted_list(death_map)
    };
};

const to_sorted_list = (map) =>
    Array.from(map.entries())
        .map(([ms, set]) => [new Date(ms), Array.from(set)])
        .sort(([a], [b]) => a - b);

const resolve_valid_windows = (time_constraints, participant_ids) => {
    const global_tc = time_constraints?.global || {};
    const range_start = global_tc.range_start ? new Date(global_tc.range_start) : null;
    const range_end   = global_tc.range_end   ? new Date(global_tc.range_end)   : null;
    if (!range_start || !range_end || range_start >= range_end) return { windows: [], curfew_points: [] };

    let windows = (global_tc.include || []).length > 0
        ? (global_tc.include).map(w => ({ start: new Date(w.start), end: new Date(w.end) }))
        : [{ start: range_start, end: range_end }];

    windows = windows
        .map(w => ({
            start: new Date(Math.max(w.start.getTime(), range_start.getTime())),
            end:   new Date(Math.min(w.end.getTime(),   range_end.getTime()))
        }))
        .filter(w => w.start < w.end);

    const must_sa = find_must_curfew(global_tc.curfews, 'start after');
    const must_eb = find_must_curfew(global_tc.curfews, 'end before');
    if (must_sa !== null || must_eb !== null) {
        windows = windows.flatMap(w => split_by_daily_curfews(w, must_sa, must_eb));
    }

    // ── CURFEW POINTS (MUST & SHOULD) ────────────────────────────────
    // We inject these as split points so the generator considers starting 
    // or ending exactly at constraint boundaries.
    const curfew_points = collect_curfew_points(time_constraints, participant_ids);

    for (const ex of (global_tc.exclude || [])) {
        windows = windows.flatMap(w => subtract_interval(w, new Date(ex.start), new Date(ex.end)));
    }

    const final_windows = windows.filter(w => w.start < w.end);
    return { windows: final_windows, curfew_points };
};

/**
 * Collects all curfew times (must/should, global/local) as minutes-since-midnight.
 */
const collect_curfew_points = (time_constraints, participant_ids) => {
    const points = new Set();
    const global_tc = time_constraints?.global || {};
    const local_tc  = time_constraints?.local  || {};

    const curfews = [...(global_tc.curfews || [])];
    participant_ids.forEach(id => {
        const local = local_tc[id.toString()];
        if (local?.curfews) curfews.push(...local.curfews);
    });

    curfews.forEach(c => {
        const mins = parse_mins(c.parameter);
        if (mins !== null) points.add(mins);
    });

    return Array.from(points);
};

const parse_mins = (p) => {
    if (!p) return null;
    if (typeof p === 'string') {
        const [t, m] = p.trim().split(' ');
        let [h, mn] = t.split(':').map(Number);
        if (m === 'PM' && h < 12) h += 12;
        if (m === 'AM' && h === 12) h = 0;
        return h * 60 + (mn || 0);
    }
    let h = p.hours || 0;
    if (p.ampm === 'PM' && h < 12) h += 12;
    if (p.ampm === 'AM' && h === 12) h = 0;
    return h * 60 + (p.minutes || 0);
};

const busy_entity_set_at = (activities, moment) => {
    const t = moment.getTime();
    const set = new Set();
    for (const act of activities) {
        if (act.start.getTime() <= t && act.end.getTime() > t) {
            (act.participants || []).forEach(p => set.add(p.toString()));
        }
    }
    return set;
};

const push_to_map = (map, ms, ids) => {
    if (!map.has(ms)) map.set(ms, new Set());
    const set = map.get(ms);
    ids.forEach(id => { if (id) set.add(id.toString()); });
};

const find_must_curfew = (curfews, type) => {
    const c = (curfews || []).find(x => x.type === type && x.modifier === 'must');
    if (!c) return null;
    const p = c.parameter;
    if (typeof p === 'string') {
        const [time, period] = p.trim().split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h < 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return h * 60 + (m || 0);
    }
    let h = p.hours || 0;
    const m = p.minutes || 0;
    if (p.ampm === 'PM' && h < 12) h += 12;
    if (p.ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
};

const split_by_daily_curfews = (window, sa_mins, eb_mins) => {
    const results = [];
    const cursor = new Date(window.start);
    cursor.setHours(0, 0, 0, 0);
    const range_end_ms = window.end.getTime();

    while (cursor.getTime() < range_end_ms) {
        const d_ms = cursor.getTime();
        let ws = d_ms + (sa_mins || 0) * 60000;
        let we = d_ms + (eb_mins || 1440) * 60000;
        ws = Math.max(ws, window.start.getTime());
        we = Math.min(we, window.end.getTime());
        if (ws < we) results.push({ start: new Date(ws), end: new Date(we) });
        cursor.setDate(cursor.getDate() + 1);
    }
    return results;
};

const subtract_interval = (window, ex_start, ex_end) => {
    if (ex_end <= window.start || ex_start >= window.end) return [window];
    const res = [];
    if (window.start < ex_start) res.push({ start: window.start, end: ex_start });
    if (ex_end < window.end) res.push({ start: ex_end, end: window.end });
    return res;
};

module.exports = { calculate_split_points };
