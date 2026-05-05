export const MODIFIERS = {
    STANDARD: ['must', 'should'],
    PLACEMENT: ['can', 'can not'], // legal / illegal time ranges
    SHOULD_ONLY: ['should'],
};

export const CONSTRAINT_SCHEMA = {
    // ── Placement ─────────────────────────────────────────────────────────
    'be between': {
        category: 'Placement',
        allowedModifiers: MODIFIERS.PLACEMENT,   // can / can not only
        parameterType: 'DateTimeRangePicker',
        label: 'Date Range',
    },
    'be on': {
        category: 'Placement',
        allowedModifiers: MODIFIERS.PLACEMENT,   // can / can not only
        parameterType: 'MultiDatePicker',
        label: 'Dates',
    },

    // ── Durational ────────────────────────────────────────────────────────
    'last for': {
        category: 'Durational',
        allowedModifiers: MODIFIERS.SHOULD_ONLY, // should only
        parameterType: 'DurationPicker',
        label: 'Duration',
    },

    // ── Inclusion ─────────────────────────────────────────────────────────
    'include': {
        category: 'Inclusion',
        allowedModifiers: MODIFIERS.SHOULD_ONLY, // should only
        parameterType: 'EntitySelector',
        label: 'Entities',
    },

    // ── Curfew ────────────────────────────────────────────────────────────
    'start after': {
        category: 'Curfew',
        allowedModifiers: MODIFIERS.STANDARD,
        parameterType: 'TimePicker',
        label: 'Time',
    },
    'start before': {
        category: 'Curfew',
        allowedModifiers: MODIFIERS.STANDARD,
        parameterType: 'TimePicker',
        label: 'Time',
    },
    'end after': {
        category: 'Curfew',
        allowedModifiers: MODIFIERS.STANDARD,
        parameterType: 'TimePicker',
        label: 'Time',
    },
    'end before': {
        category: 'Curfew',
        allowedModifiers: MODIFIERS.STANDARD,
        parameterType: 'TimePicker',
        label: 'Time',
    },

    // ── Entity-specific (local only, not a top-level global constraint) ───
    'pad': {
        category: 'EntitySpecific',
        allowedModifiers: MODIFIERS.STANDARD,
        parameterType: 'DurationPicker',
        label: 'Duration',
        localOnly: true,
    },
};

export const GLOBAL_CONSTRAINTS_LIST = Object.keys(CONSTRAINT_SCHEMA).filter(
    k => !CONSTRAINT_SCHEMA[k].localOnly
);
export const LOCAL_CHILD_CONSTRAINTS_LIST = Object.keys(CONSTRAINT_SCHEMA);

/** Returns the first allowed modifier for a constraint key. */
export const getDefaultModifier = (constraintKey) => {
    if (!constraintKey || !CONSTRAINT_SCHEMA[constraintKey]) return '';
    return CONSTRAINT_SCHEMA[constraintKey].allowedModifiers[0];
};

/** Returns a sensible empty parameter for a given constraint type. */
export const getDefaultParameter = (constraintKey) => {
    if (!constraintKey || !CONSTRAINT_SCHEMA[constraintKey]) return null;
    const type = CONSTRAINT_SCHEMA[constraintKey].parameterType;
    switch (type) {
        case 'DateTimeRangePicker':
            return { start: { date: new Date(), time: '08:00 AM' }, end: { date: new Date(), time: '11:59 PM' } };
        case 'DatePicker':
            return new Date();
        case 'MultiDatePicker':
            return [new Date()];
        case 'DurationPicker':
            return { hours: 1, minutes: 30 };
        case 'EntitySelector':
            return [];
        case 'TimePicker':
            return '12:00 PM';
        default:
            return null;
    }
};
