// utils/planner/calculate_split_points.js

/**
 * STEP 1 + 2 of the planning algorithm.
 *
 * Step 1 — Resolve 'can be on' / 'cannot be on' constraints into a set of
 *           concrete valid time windows by intersecting global.include and
 *           subtracting global.exclude from the planning range.
 *
 * Step 2 — Find all Birth and Death points inside those valid windows.
 *
 * Birth  Points = window_start ∪ { activity.end  for every activity }
 * Death  Points = window_end   ∪ { activity.start for every activity }
 *
 * Additionally, per-entity local include/exclude boundaries become entity-
 * scoped birth/death events within the valid windows.
 *
 * @param {Object} time_constraints
 *   Output of extract_time_constraints:
 *   {
 *     global: { include, exclude, range_start, range_end, ... },
 *     local:  { [entityId]: { include, exclude, ... } }
 *   }
 *
 * @param {Array} activities
 *   Output of generate_busy_blocks:
 *   [{ id, start: Date, end: Date, participants: string[] }, ...]
 *
 * @returns {{
 *   birth: Array<[Date, string[]]>,   // [moment, entities that just became FREE]
 *   death: Array<[Date, string[]]>    // [moment, entities that just became BUSY]
 * }}
 */
const calculate_split_points = (time_constraints, activities) => {
    const global_tc  = time_constraints?.global  || {};
    const local_tc   = time_constraints?.local   || {};

    // ─────────────────────────────────────────────────────────────────
    // STEP 1 — Resolve valid windows
    // ─────────────────────────────────────────────────────────────────

    const valid_windows = resolve_valid_windows(global_tc);

    if (!valid_windows.length) {
        console.warn('[split_points] No valid windows after constraint resolution');
        return { birth: [], death: [] };
    }

    // ─────────────────────────────────────────────────────────────────
    // Collect every entity that appears anywhere
    // ─────────────────────────────────────────────────────────────────

    const all_entity_ids = collect_all_entities(activities, local_tc);

    // ─────────────────────────────────────────────────────────────────
    // STEP 2 — Birth / Death point accumulation
    //
    // birth_map: ms_timestamp → Set<entityId>  (who became free at T)
    // death_map: ms_timestamp → Set<entityId>  (who became busy at T)
    // ─────────────────────────────────────────────────────────────────

    const birth_map = new Map();
    const death_map = new Map();

    for (const window of valid_windows) {
        const win_start_ms = window.start.getTime();
        const win_end_ms   = window.end.getTime();

        // ── WINDOW START: birth event ──────────────────────────────
        // Every entity that is NOT currently in a busy block is free here.
        const busy_at_start = busy_entity_set_at(activities, window.start);
        const free_at_start = all_entity_ids.filter(id => !busy_at_start.has(id));
        if (free_at_start.length) push_to_map(birth_map, win_start_ms, free_at_start);

        // ── WINDOW END: death event ────────────────────────────────
        // Every entity that is free just before the window closes becomes unavailable.
        const busy_before_end = busy_entity_set_at(activities, new Date(win_end_ms - 1));
        const free_before_end = all_entity_ids.filter(id => !busy_before_end.has(id));
        if (free_before_end.length) push_to_map(death_map, win_end_ms, free_before_end);

        // ── ACTIVITY BOUNDARIES inside the window ─────────────────
        for (const act of activities) {
            const act_start_ms = act.start.getTime();
            const act_end_ms   = act.end.getTime();
            const participants = act.participants || [];

            if (!participants.length) continue;

            // Activity starts inside window → participants become busy (death)
            if (act_start_ms > win_start_ms && act_start_ms < win_end_ms) {
                push_to_map(death_map, act_start_ms, participants);
            }

            // Activity ends inside window → participants become free (birth)
            if (act_end_ms > win_start_ms && act_end_ms <= win_end_ms) {
                push_to_map(birth_map, act_end_ms, participants);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 2 (cont.) — Per-entity local constraint boundaries
    // ─────────────────────────────────────────────────────────────────

    for (const [entity_id, local] of Object.entries(local_tc)) {
        // Local EXCLUDE windows — entity is blocked during these periods.
        // The start of an exclusion is a death for that entity;
        // the end is a birth (they become available again).
        for (const ex of (local.exclude || [])) {
            const ex_start_ms = new Date(ex.start).getTime();
            const ex_end_ms   = new Date(ex.end).getTime();

            for (const win of valid_windows) {
                const ws = win.start.getTime();
                const we = win.end.getTime();

                if (ex_start_ms > ws && ex_start_ms < we) {
                    push_to_map(death_map, ex_start_ms, [entity_id]);
                }
                if (ex_end_ms > ws && ex_end_ms <= we) {
                    push_to_map(birth_map, ex_end_ms, [entity_id]);
                }
            }
        }

        // Local INCLUDE windows — entity is ONLY available inside these.
        // Before the include window starts, the entity is unavailable (death at win_start or inc_start).
        // At inc_start the entity becomes available (birth); at inc_end they become unavailable (death).
        for (const inc of (local.include || [])) {
            const inc_start_ms = new Date(inc.start).getTime();
            const inc_end_ms   = new Date(inc.end).getTime();

            for (const win of valid_windows) {
                const ws = win.start.getTime();
                const we = win.end.getTime();

                // Entity is unavailable from window start until inc_start
                if (inc_start_ms > ws) {
                    // Their initial death is at window start (they're "not yet available")
                    push_to_map(death_map, ws, [entity_id]);
                    // They become available at inc_start (birth)
                    if (inc_start_ms < we) {
                        push_to_map(birth_map, inc_start_ms, [entity_id]);
                    }
                }

                // Entity becomes unavailable again after inc_end
                if (inc_end_ms > ws && inc_end_ms < we) {
                    push_to_map(death_map, inc_end_ms, [entity_id]);
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // Materialise and sort
    // ─────────────────────────────────────────────────────────────────

    const to_sorted_list = (map) =>
        Array.from(map.entries())
            .map(([ms, entity_set]) => [new Date(ms), Array.from(entity_set)])
            .sort(([a], [b]) => a - b);

    const result = {
        birth: to_sorted_list(birth_map),
        death: to_sorted_list(death_map)
    };

    console.log(
        `[split_points] Windows: ${valid_windows.length} | ` +
        `Birth pts: ${result.birth.length} | Death pts: ${result.death.length}`
    );

    return result;
};

/* =========================================================
   STEP 1 — Valid window resolution
   ========================================================= */

/**
 * Computes the set of valid scheduling windows from global constraints.
 * 1. Base = include list (or full range if none).
 * 2. Clip to [range_start, range_end].
 * 3. Subtract all exclude intervals.
 *
 * @returns {{ start: Date, end: Date }[]}
 */
const resolve_valid_windows = (global_tc) => {
    const range_start = global_tc.range_start ? new Date(global_tc.range_start) : null;
    const range_end   = global_tc.range_end   ? new Date(global_tc.range_end)   : null;

    if (!range_start || !range_end || range_start >= range_end) return [];

    // Base windows from include list; fall back to full range
    let windows = (global_tc.include || []).length > 0
        ? (global_tc.include).map(w => ({
            start: new Date(w.start),
            end:   new Date(w.end)
          }))
        : [{ start: new Date(range_start), end: new Date(range_end) }];

    // Clip each window to [range_start, range_end]
    windows = windows
        .map(w => ({
            start: new Date(Math.max(w.start.getTime(), range_start.getTime())),
            end:   new Date(Math.min(w.end.getTime(),   range_end.getTime()))
        }))
        .filter(w => w.start < w.end);

    // Subtract exclude intervals
    for (const ex of (global_tc.exclude || [])) {
        const ex_start = new Date(ex.start);
        const ex_end   = new Date(ex.end);
        windows = windows.flatMap(w => subtract_interval(w, ex_start, ex_end));
    }

    return windows.filter(w => w.start < w.end);
};

/**
 * Subtracts [ex_start, ex_end) from a single window, returning 0-2 windows.
 */
const subtract_interval = (window, ex_start, ex_end) => {
    // No overlap
    if (ex_end <= window.start || ex_start >= window.end) return [window];

    const result = [];
    if (window.start < ex_start) result.push({ start: window.start, end: ex_start });
    if (ex_end < window.end)     result.push({ start: ex_end, end: window.end });
    return result;
};

/* =========================================================
   HELPERS
   ========================================================= */

/**
 * Collects every entity ID referenced by activities or local constraints.
 * @returns {string[]}
 */
const collect_all_entities = (activities, local_tc) => {
    const ids = new Set();

    for (const act of activities) {
        (act.participants || []).forEach(p => ids.add(p.toString()));
    }

    for (const entity_id of Object.keys(local_tc)) {
        ids.add(entity_id.toString());
    }

    return Array.from(ids);
};

/**
 * Returns the set of entity IDs currently in a busy block at `moment`.
 * @param {Array} activities
 * @param {Date}  moment
 * @returns {Set<string>}
 */
const busy_entity_set_at = (activities, moment) => {
    const t   = moment.getTime();
    const set = new Set();

    for (const act of activities) {
        if (act.start.getTime() <= t && act.end.getTime() > t) {
            (act.participants || []).forEach(p => set.add(p.toString()));
        }
    }

    return set;
};

/**
 * Adds `entity_ids` into a map keyed by millisecond timestamp.
 * Creates a new Set at the key if one doesn't exist yet.
 */
const push_to_map = (map, ms, entity_ids) => {
    if (!map.has(ms)) map.set(ms, new Set());
    const set = map.get(ms);
    entity_ids.forEach(id => { if (id) set.add(id.toString()); });
};

/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = { calculate_split_points };
