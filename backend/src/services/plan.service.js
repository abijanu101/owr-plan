// services/plan.service.js

const { extract_time_constraints }  = require('../utils/planner/time_constraint_extraction');
const { generate_busy_blocks }      = require('../utils/planner/busy_block_generation');
const { calculate_split_points }    = require('../utils/planner/calculate_split_points');
const { generate_candidates }       = require('../utils/planner/candidate_generation');
const { eliminate_candidates }      = require('../utils/planner/candidate_elimination');
const { resolve_participants }      = require('../utils/planner/entity_extraction');
const { score_candidates,
        format_results }            = require('../utils/planner/candidate_scoring');

/**
 * Main planning algorithm entry point.
 */
const solvePlan = async (constraints, entity_map = {}) => {
    console.log('\n══════════════ PLAN SOLVER START ══════════════');
    
    // ── Step 0: Resolve Participants ────────────────────────────────────────
    console.log('\n── Step 0: resolve_participants ──');
    const { all: all_entity_ids, mandatory: mandatory_entity_ids } = await resolve_participants(constraints);
    console.log('[ solver] All participants:', all_entity_ids);
    console.log('[ solver] Mandatory participants:', mandatory_entity_ids);

    // ── Step 1: Temporal constraint normalisation ──────────────────────────
    console.log('\n── Step 1: extract_time_constraints ──');
    const time_constraints = extract_time_constraints(constraints);

    // ── Step 2: Busy block generation ─────────────────────────────────────
    console.log('\n── Step 2: generate_busy_blocks ──');
    const activities = await generate_busy_blocks(constraints, time_constraints);

    // ── Step 3: Split point calculation ───────────────────────────────────
    console.log('\n── Step 3: calculate_split_points ──');
    const split_points = calculate_split_points(time_constraints, activities, all_entity_ids);

    // ── Step 4: Candidate generation + pruning ────────────────────────────
    const { candidates: raw_candidates, pruned: candidates } = generate_candidates(
        time_constraints,
        split_points,
        activities,
        all_entity_ids
    );

    if (!candidates.length) {
        console.warn('[ solver] No candidates remain after pruning');
        return {
            bestOption:   null,
            alternatives: [],
            message: 'No suitable time slot could be found within the given constraints.'
        };
    }

    // ── Step 5: Hard constraint elimination ───────────────────────────────
    const { passed, eliminated, reasons } = eliminate_candidates(time_constraints, candidates, mandatory_entity_ids);

    if (!passed.length) {
        console.warn('[solver] All candidates eliminated by hard constraints');
        return {
            bestOption:   null,
            alternatives: [],
            message: 'No time slot satisfies all required constraints. Try relaxing some rules.'
        };
    }

    // ── Step 6: Scoring ───────────────────────────────────────────────────
    const scored = score_candidates(time_constraints, passed, all_entity_ids);

    // ── Step 7: Format ────────────────────────────────────────────────────
    console.log('\n── Step 7: format_results ──');
    const result = format_results(scored, entity_map, 11, all_entity_ids, mandatory_entity_ids, time_constraints);
    console.log(`[ solver] Returning ${1 + (result.alternatives?.length || 0)} total results to UI`);

    console.log('\n══════════════ PLAN SOLVER DONE ═══════════════\n');

    return result;
};

module.exports = { solvePlan };
