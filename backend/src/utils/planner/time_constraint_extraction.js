// utils/planner/time_constraint_extraction.js

/**
 * STEP 1: Temporal Constraint Extraction
 * 
 * INTENTION:
 * Transforms the high-level, human-readable constraints from the frontend 
 * into a structured mathematical model. It categorizes rules into 'global' 
 * (applies to everyone) and 'local' (applies to specific individuals) buckets.
 * 
 * INPUT SHAPE:
 * - constraints: Array of raw objects:
 *   { key, type, modifier, parameter, entity, children?, isBlock? }
 * 
 * OUTPUT SHAPE:
 * - { global: Bucket, local: { [eid]: Bucket } }
 *   Bucket: {
 *     include:     [{ start: Date, end: Date }],
 *     exclude:     [{ start: Date, end: Date }],
 *     curfews:     [{ type: string, modifier: 'must'|'should', parameter: Object }],
 *     padding:     Number (mins),
 *     must_last:   Number | null (mins),
 *     should_last: Number | null (mins),
 *     range_start: Date (earliest boundary),
 *     range_end:   Date (latest boundary)
 *   }
 */

const extract_time_constraints = (constraints = []) => {
    const time_constraints = {
        global: create_empty_constraint_bucket(),
        local: {}
    };

    if (!Array.isArray(constraints)) return time_constraints;
    
    const flat_constraints = flatten_constraints(constraints);
    
    for (const constraint of flat_constraints) {
        const type = constraint.key || constraint.type;
        const modifier = constraint.modifier;
        const parameter = constraint.parameter;
        const entities = normalize_entities(constraint.entity);

        // Map to target buckets (Global or Per-Entity)
        const targets = entities.length === 0
            ? [time_constraints.global]
            : entities.map(entityId => {
                if (!time_constraints.local[entityId]) {
                    time_constraints.local[entityId] = create_empty_constraint_bucket();
                }
                return time_constraints.local[entityId];
            });

        for (const bucket of targets) {
            // Include/Exclude Windows
            if (type === 'be between' || type === 'be on') {
                const ranges = transform_to_ranges(type, parameter);
                if (modifier === 'can') bucket.include.push(...ranges);
                else if (modifier === 'can not') bucket.exclude.push(...ranges);
            }
            // Curfews (Must/Should start before/after etc)
            else if (type.startsWith('start') || type.startsWith('end')) {
                bucket.curfews.push({ type, modifier, parameter });
            }
            // Logic rules
            else if (type === 'pad') bucket.padding = duration_to_minutes(parameter);
            else if (type === 'must last') bucket.must_last = duration_to_minutes(parameter);
            else if (type === 'should last') bucket.should_last = duration_to_minutes(parameter);
            else if (type === 'last for') {
                const mins = duration_to_minutes(parameter);
                if (modifier === 'must') bucket.must_last = mins;
                else bucket.should_last = mins;
            }
        }
    }

    derive_global_range(time_constraints.global);
    return time_constraints;
};

const create_empty_constraint_bucket = () => ({
    include: [], exclude: [], curfews: [], padding: 0,
    must_last: null, should_last: null,
    range_start: null, range_end: null
});

const normalize_entities = (entity) => {
    if (!entity) return [];
    if (Array.isArray(entity)) return entity.map(e => e.toString());
    return [entity.toString()];
};

const duration_to_minutes = (d) => (d?.hours || 0) * 60 + (d?.minutes || 0);

const transform_to_ranges = (type, param) => {
    if (type === 'be between') {
        return [{
            start: combine_date_time(param.start.date, param.start.time),
            end: combine_date_time(param.end.date, param.end.time)
        }];
    }
    if (type === 'be on') {
        return param.map(date => ({
            start: new Date(new Date(date).setHours(0, 0, 0, 0)),
            end: new Date(new Date(date).setHours(23, 59, 59, 999))
        }));
    }
    return [];
};

const derive_global_range = (bucket) => {
    if (!bucket.include?.length) {
        const now = new Date();
        bucket.range_start = now;
        bucket.range_end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return;
    }
    bucket.range_start = new Date(Math.min(...bucket.include.map(r => new Date(r.start).getTime())));
    bucket.range_end = new Date(Math.max(...bucket.include.map(r => new Date(r.end).getTime())));
};

const combine_date_time = (date, time_str) => {
    // We must be careful: 'new Date(isoString)' can roll back the day if the 
    // user is in a positive timezone (e.g. May 11 04:00 AM is May 10 23:00 UTC).
    const source = new Date(date);
    
    // Create a fresh date using the components that represent the user's intended day
    const d = new Date(source.getFullYear(), source.getMonth(), source.getDate());
    
    if (!time_str) { d.setHours(0,0,0,0); return d; }
    const [time, mod] = time_str.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (mod === 'PM' && h < 12) h += 12;
    if (mod === 'AM' && h === 12) h = 0;
    d.setHours(h, m, 0, 0);
    return d;
};

const flatten_constraints = (constraints = [], inherited = {}) => {
    const out = [];
    constraints.forEach(c => {
        const merged = { ...inherited, ...c };
        if (c?.isBlock && Array.isArray(c.children)) {
            out.push(...flatten_constraints(c.children, {
                entity: c.entity ?? inherited.entity,
                modifier: c.modifier ?? inherited.modifier
            }));
        } else out.push(merged);
    });
    return out;
};

module.exports = { extract_time_constraints };