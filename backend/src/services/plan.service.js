// services/plan.service.js

const { extract_time_constraints }  = require('../utils/planner/time_constraint_extraction');
const { generate_busy_blocks }      = require('../utils/planner/busy_block_generation');
const { calculate_split_points }    = require('../utils/planner/calculate_split_points');
const { generate_candidates }       = require('../utils/planner/candidate_generation');
const { eliminate_candidates }      = require('../utils/planner/candidate_elimination');
const { score_candidates,
        format_results }            = require('../utils/planner/candidate_scoring');

/**
 * Main planning algorithm entry point.
 *
 * Pipeline:
 *   1. extract_time_constraints  — parse raw frontend constraints into a
 *                                  normalized temporal ruleset.
 *   2. generate_busy_blocks      — fetch & expand activities into concrete
 *                                  {start, end, participants} blocks.
 *   3. calculate_split_points    — resolve valid windows + compute birth/death
 *                                  points.
 *   4. generate_candidates       — birth × death pairs where entities stay free
 *                                  + prune dominated candidates.
 *   5. eliminate_candidates      — discard hard-constraint violations.
 *   6. score_candidates          — rank survivors by weighted quality metrics.
 *   7. format_results            — shape output for the frontend.
 *
 * @param {Array}  constraints  - Raw constraint objects from the frontend.
 * @param {Object} [entity_map] - Optional { [id]: { name, color, ... } }
 *                                for response enrichment.
 * @returns {Object} { bestOption, alternatives }
 */
const solvePlan = async (constraints, entity_map = {}) => {
    console.log('\n══════════════ PLAN SOLVER START ══════════════');

    // ── Step 1: Temporal constraint normalisation ──────────────────────────
    console.log('\n── Step 1: extract_time_constraints ──');
    const time_constraints = extract_time_constraints(constraints);
    /*
        {
            global: { include, exclude, curfews, padding,
                      must_last, should_last, range_start, range_end },
            local:  { [entityId]: { include, exclude, curfews, padding,
                                    must_last, should_last } }
        }
    */

    // ── Step 2: Busy block generation ─────────────────────────────────────
    console.log('\n── Step 2: generate_busy_blocks ──');
    const activities = await generate_busy_blocks(constraints, time_constraints);
    /*
        [{ id, start: Date, end: Date, participants: string[] }, ...]
    */

    // ── Step 3: Split point calculation ───────────────────────────────────
    console.log('\n── Step 3: calculate_split_points ──');
    const split_points = calculate_split_points(time_constraints, activities);
    /*
        {
            birth: [[Date, entityIds[]], ...],   // entities that just became free
            death: [[Date, entityIds[]], ...]    // entities that just became busy
        }
    */

    // ── Step 4: Candidate generation + pruning ────────────────────────────
    console.log('\n── Step 4: generate_candidates ──');
    const { pruned: candidates } = generate_candidates(
        time_constraints,
        split_points,
        activities
    );
    /*
        [{ start, end, duration (mins), available: string[] }, ...]
    */

    if (!candidates.length) {
        console.warn('[ solver] No candidates remain after pruning');
        return {
            bestOption:   null,
            alternatives: [],
            message: 'No suitable time slot could be found within the given constraints.'
        };
    }

    // ── Step 5: Hard constraint elimination ───────────────────────────────
    console.log('\n── Step 5: eliminate_candidates ──');
    const { passed } = eliminate_candidates(time_constraints, candidates);

    if (!passed.length) {
        console.warn('[solver] All candidates eliminated by hard constraints');
        return {
            bestOption:   null,
            alternatives: [],
            message: 'No time slot satisfies all required constraints. Try relaxing some rules.'
        };
    }

    // ── Step 6: Scoring ───────────────────────────────────────────────────
    console.log('\n── Step 6: score_candidates ──');
    // Collect the full set of entities referenced by the constraints
    const all_entity_ids = Object.keys(time_constraints.local);
    const scored = score_candidates(time_constraints, passed, all_entity_ids);

    // ── Step 7: Format ────────────────────────────────────────────────────
    console.log('\n── Step 7: format_results ──');
    const result = format_results(scored, entity_map, 3);

    console.log('\n══════════════ PLAN SOLVER DONE ═══════════════\n');

    return result;
};

module.exports = { solvePlan };
