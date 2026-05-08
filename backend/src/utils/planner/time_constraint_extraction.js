// utils/planner/time_constraint_extraction.js

/**
 * Converts frontend constraints into a normalized
 * scheduler-friendly temporal ruleset.
 *
 * Output Shape:
 * {
 *     global: {
 *         include: [],
 *         exclude: [],
 *         curfews: [],
 *         padding: Number,
 *
 *         must_last: Number | null,
 *         should_last: Number | null,
 *
 *         range_start: Date,
 *         range_end: Date
 *     },
 *
 *     local: {
 *         [entityId]: {
 *             include: [],
 *             exclude: [],
 *             curfews: [],
 *             padding: Number,
 *
 *             must_last: Number | null,
 *             should_last: Number | null
 *         }
 *     }
 * }
 */

const extract_time_constraints = (constraints = []) => {
    const time_constraints = {
        global: create_empty_constraint_bucket(),
        local: {}
    };

    if (!Array.isArray(constraints))
        return time_constraints;
    
    
    const flat_constraints = flatten_constraints(constraints);
    flat_constraints.forEach((constraint) => {
        const type =
            constraint.key ||
            constraint.type;
        const modifier =
            constraint.modifier;
        const parameter =
            constraint.parameter;
        const entities =
            normalize_entities(
                constraint.entity
            );

        // ---------------------------------
        // Determine Target Buckets
        // ---------------------------------

        const targets =
            entities.length === 0
                ? [time_constraints.global]
                : entities.map(entityId => {
                    if (!time_constraints.local[entityId]) {
                        time_constraints.local[entityId] =
                            create_empty_constraint_bucket();
                    }

                    return time_constraints.local[entityId];
                });

        // ---------------------------------
        // Apply Constraint
        // ---------------------------------

        targets.forEach((bucket) => {
            // INCLUDE / EXCLUDE WINDOWS
            if (
                type === 'be between' ||
                type === 'be on'
            ) {
                const ranges =
                    transform_to_ranges(
                        type,
                        parameter
                    );

                if (modifier === 'can') {
                    bucket.include.push(...ranges);
                }
                else if (modifier === 'can not') {
                    bucket.exclude.push(...ranges);
                }
            }
            // CURFEWS
            else if (
                type.startsWith('start') ||
                type.startsWith('end')
            ) {
                bucket.curfews.push({
                    type,
                    modifier,
                    parameter
                });
            }
            // PADDING
            else if (type === 'pad') {
                bucket.padding =
                    duration_to_minutes(parameter);
            }
            // REQUIRED DURATION
            else if (type === 'must last') {
                bucket.must_last =
                    duration_to_minutes(parameter);
            }
            else if (type === 'should last') {
                bucket.should_last =
                    duration_to_minutes(parameter);
            }
        });
    });

    // ---------------------------------
    // Derive Global Planning Window
    // ---------------------------------

    derive_global_range(
        time_constraints.global
    );

    return time_constraints;
};

/* =========================================================
   HELPERS
========================================================= */

const create_empty_constraint_bucket = () => ({
    include: [],
    exclude: [],
    curfews: [],
    padding: 0,

    must_last: null,
    should_last: null,

    range_start: null,
    range_end: null
});

/**
 * Normalizes entity field into array of strings
 */
const normalize_entities = (entity) => {
    if (!entity) {
        return [];
    }
    if (Array.isArray(entity)) {
        return entity.map(e => e.toString());
    }
    return [entity.toString()];
};

/**
 * Converts frontend duration objects into minutes
 */
const duration_to_minutes = (duration) => {
    if (!duration) {
        return 0;
    }
    return (
        (duration.hours || 0) * 60 +
        (duration.minutes || 0)
    );
};

/**
 * Converts constraint parameters into concrete ranges
 */
const transform_to_ranges = (
    type,
    parameter
) => {
    if (type === 'be between')
        return [{
            start: combine_date_time(
                parameter.start.date,
                parameter.start.time
            ),
            end: combine_date_time(
                parameter.end.date,
                parameter.end.time
            )
        }];

    if (type === 'be on')
        return parameter.map(date => ({
            start: new Date(
                new Date(date).setHours(0, 0, 0, 0)
            ),
            end: new Date(
                new Date(date).setHours(23, 59, 59, 999)
            )
        }));

    return [];
};

/**
 * Derives global scheduling envelope
 * from include ranges
 */
const derive_global_range = (global_bucket) => {
    if (!global_bucket.include || global_bucket.include.length === 0) {
        const now = new Date();
        global_bucket.range_start = now;
        global_bucket.range_end =
            new Date(
                now.getTime() +
                7 * 24 * 60 * 60 * 1000
            );
        return;
    }

    global_bucket.range_start = new Date(
        Math.min(
            ...global_bucket.include.map(
                r => new Date(r.start).getTime()
            )
        )
    );
    global_bucket.range_end = new Date(
        Math.max(
            ...global_bucket.include.map(
                r => new Date(r.end).getTime()
            )
        )
    );
};

/**
 * Parses "08:30 PM"
 */
const parse_time = (time_str) => {
    if (!time_str)
        return { hours: 0, minutes: 0 };

    const [time, modifier] =
        time_str.split(' ');

    let [hours, minutes] =
        time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12)
        hours += 12;
    if (modifier === 'AM' && hours === 12)
        hours = 0;

    return {
        hours,
        minutes
    };
};

/**
 * Combines date + "08:00 PM"
 */
const combine_date_time = (
    date,
    time_str
) => {
    const d = new Date(date);
    const { hours, minutes } = parse_time(time_str);
    d.setHours(hours, minutes, 0, 0);
    return d;
};

const flatten_constraints = (constraints = [], inherited = {}) => {
    const out = [];
    constraints.forEach(c => {
        const merged = {
            ...inherited,
            ...c
        };

        // if block → pass context down
        if (c?.isBlock && Array.isArray(c.children))
            out.push(...flatten_constraints(
                c.children,
                {
                    entity: c.entity ?? inherited.entity,
                    modifier: c.modifier ?? inherited.modifier
                }
            ));
        else
            out.push(merged);
    });

    return out;
};

module.exports = {
    extract_time_constraints
};