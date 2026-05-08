// utils/planner/entity_extraction.js

/**
 * STEP 0: Participant Resolution & Identity Expansion
 * 
 * INTENTION:
 * Decouple identity logic from temporal logic. This module handles the 
 * recursive expansion of Group entities into individual Members so the 
 * rest of the pipeline only deals with concrete human schedules.
 * 
 * INPUT SHAPE:
 * - constraints: Array of raw frontend constraint objects { type, modifier, parameter, entity }
 * 
 * OUTPUT SHAPE:
 * - Promise<{ all: string[], mandatory: string[] }>
 *   all:       List of every unique individual involved in the plan.
 *   mandatory: List of individuals tagged with 'must' in the include constraints.
 */

const Entity = require('../../models/Entities');

const resolve_participants = async (constraints = []) => {
    const allRaw = new Set();
    const mandatoryRaw = new Set();

    for (const c of constraints) {
        const type = c.key || c.type;
        const modifier = c.modifier;
        const parameter = c.parameter;
        const entities = normalize_entities(c.entity);

        entities.forEach(id => allRaw.add(id));

        if (type === 'include' && Array.isArray(parameter)) {
            parameter.forEach(id => {
                if (!id) return;
                const sid = id.toString();
                allRaw.add(sid);
                if (modifier === 'must') mandatoryRaw.add(sid);
            });
        }
    }

    const allResolved = new Set();
    const mandatoryResolved = new Set();

    for (const id of mandatoryRaw) {
        const expanded = await expand_entity(id);
        expanded.forEach(eid => mandatoryResolved.add(eid));
    }

    for (const id of allRaw) {
        const expanded = await expand_entity(id);
        expanded.forEach(eid => allResolved.add(eid));
    }

    return {
        all: Array.from(allResolved),
        mandatory: Array.from(mandatoryResolved)
    };
};

/** Compatibility alias for busy_block_generation */
const extract_all_entities = async (constraints = []) => {
    const { all } = await resolve_participants(constraints);
    return all;
};

const expand_entity = async (id) => {
    const entity = await Entity.findById(id).lean();
    if (!entity) return [];
    if (entity.type === 'group' && Array.isArray(entity.members)) {
        return entity.members.map(m => m.toString());
    }
    return [id.toString()];
};

const normalize_entities = (entity) => {
    if (!entity) return [];
    if (Array.isArray(entity)) return entity.map(e => e.toString());
    return [entity.toString()];
};

module.exports = { 
    resolve_participants,
    extract_all_entities 
};
