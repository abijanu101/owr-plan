const Entity = require('../models/Entities');

/**
 * Extracts entity names/IDs from a list of constraints.
 */
const extractRequiredEntities = (constraints) => {
    const attendeeNames = new Set();
    if (!constraints || !Array.isArray(constraints)) return [];

    constraints.forEach(c => {
        // Handle various constraint structures (entity array or parameter array)
        if (c.entity && Array.isArray(c.entity)) {
            c.entity.forEach(name => attendeeNames.add(name));
        } else if (c.entity && typeof c.entity === 'string') {
            attendeeNames.add(c.entity);
        }
        
        if (c.type === 'include' && Array.isArray(c.parameter)) {
            c.parameter.forEach(name => attendeeNames.add(name));
        } else if (c.type === 'include' && typeof c.parameter === 'string') {
            attendeeNames.add(c.parameter);
        }
    });

    return Array.from(attendeeNames);
};

/**
 * Resolves name strings/IDs to full Entity objects from the DB.
 */
const resolveEntities = async (namesOrIds) => {
    const allEntities = await Entity.find({});
    
    return namesOrIds.map(nameOrId => {
        const match = allEntities.find(e => 
            e.name.toLowerCase() === nameOrId.toLowerCase() || 
            e._id.toString() === nameOrId.toString()
        );
        return match || { name: nameOrId, type: 'person', color: '#f97766' };
    });
};

/**
 * Main algorithm entry point (placeholder for real implementation).
 */
const solvePlan = async (constraints) => {
    // 1. Extract what we need
    const requiredNames = extractRequiredEntities(constraints);
    
    // 2. Resolve to real DB objects
    let attendees = await resolveEntities(requiredNames);

    // 3. Fallback if empty (for demo purposes)
    if (attendees.length === 0) {
        attendees = await Entity.find({}).limit(5);
    }

    // 4. Return results structure
    // NOTE: This is where a human would implement the actual solver.
    return {
        bestOption: {
            date: "May 2",
            time: "02:00 PM",
            duration: "1.5hr",
            score: 98,
            attendees: attendees
        },
        alternatives: [
            { 
                date: "May 2", 
                time: "04:30 PM", 
                duration: "1.5hr", 
                score: 92, 
                attendees: attendees.slice(0, Math.ceil(attendees.length * 0.8))
            },
            { 
                date: "May 3", 
                time: "10:00 AM", 
                duration: "2hr", 
                score: 85, 
                attendees: attendees.slice(0, Math.ceil(attendees.length * 0.5))
            }
        ]
    };
};

module.exports = {
    extractRequiredEntities,
    resolveEntities,
    solvePlan
};
