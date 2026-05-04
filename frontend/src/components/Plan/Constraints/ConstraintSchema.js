export const MODIFIERS = {
    STANDARD: ['must', 'should'],
    PLACEMENT: ['can', 'can not'], // Blending SRS and mockup
    SHOULD_ONLY: ['should']
};

export const CONSTRAINT_SCHEMA = {
    'be between': {
        category: 'Placement',
        allowedModifiers: MODIFIERS.PLACEMENT,
        parameterType: 'DateTimeRangePicker',
        label: 'Date Range'
    },
    'be on': {
        category: 'Placement',
        allowedModifiers: MODIFIERS.PLACEMENT,
        parameterType: 'MultiDatePicker',
        label: 'Dates'
    },
    'last for': {
        category: 'Durational',
        allowedModifiers: MODIFIERS.SHOULD_ONLY,
        parameterType: 'DurationPicker',
        label: 'Duration'
    },
    'include': {
        category: 'Inclusion',
        allowedModifiers: MODIFIERS.SHOULD_ONLY,
        parameterType: 'EntitySelector',
        label: 'Entities'
    },
    'start after': {
        category: 'Curfew',
        allowedModifiers: MODIFIERS.STANDARD,
        parameterType: 'TimePicker',
        label: 'Time'
    },
    'start before': {
        category: 'Curfew',
        allowedModifiers: MODIFIERS.STANDARD,
        parameterType: 'TimePicker',
        label: 'Time'
    },
    'end after': {
        category: 'Curfew',
        allowedModifiers: MODIFIERS.STANDARD,
        parameterType: 'TimePicker',
        label: 'Time'
    },
    'end before': {
        category: 'Curfew',
        allowedModifiers: MODIFIERS.STANDARD,
        parameterType: 'TimePicker',
        label: 'Time'
    },
    'pad': {
        category: 'EntitySpecific',
        allowedModifiers: MODIFIERS.STANDARD,
        parameterType: 'DurationPicker',
        label: 'Duration',
        localOnly: true
    }
};

export const GLOBAL_CONSTRAINTS_LIST = Object.keys(CONSTRAINT_SCHEMA).filter(k => !CONSTRAINT_SCHEMA[k].localOnly);
export const LOCAL_CHILD_CONSTRAINTS_LIST = Object.keys(CONSTRAINT_SCHEMA);

// Helper to get default modifier for a constraint
export const getDefaultModifier = (constraintKey) => {
    if (!constraintKey || !CONSTRAINT_SCHEMA[constraintKey]) return '';
    return CONSTRAINT_SCHEMA[constraintKey].allowedModifiers[0];
};

// Helper to get empty/default parameter for a constraint type
export const getDefaultParameter = (constraintKey) => {
    if (!constraintKey || !CONSTRAINT_SCHEMA[constraintKey]) return null;
    const type = CONSTRAINT_SCHEMA[constraintKey].parameterType;
    switch(type) {
        case 'DateTimeRangePicker': return { start: { date: new Date(), time: "08:00 AM" }, end: { date: new Date(), time: "11:59 PM" } };
        case 'DatePicker': return new Date();
        case 'MultiDatePicker': return [new Date()];
        case 'DurationPicker': return { hours: 1, minutes: 30 };
        case 'EntitySelector': return [];
        case 'TimePicker': return "12:00 PM";
        default: return null;
    }
};
