const  {extract_time_constraints} = require('../utils/planner/time_constraint_extraction');
const  {generate_busy_blocks} = require('../utils/planner/busy_block_generation');

/**
 * Main algorithm entry point
 * @param {Array} constraints - The raw constraints from the frontend
 * @param {Date} rangeStart - Start of the planning window
 * @param {Date} rangeEnd - End of the planning window
 */
const solvePlan = async (constraints) => {
    console.log(constraints)
    const time_constraints = extract_time_constraints(constraints)
    /*{
        'global': {
            include: [], 
            exclude: [], 
            curfews: [],
            padding: 0,

            must_last: Time,
            should_last: Time
        }
        'local': {
            'eid_1': {
                include: [], 
                exclude: [], 
                curfews: [],
                padding: 0,

                must_last: Time,
                should_last: Time
            },
            'eid_2': ...
        }
    }*/

    // 2. Get Busy Blocks
    const activities = await generate_busy_blocks(constraints, time_constraints)
    /* [
        {
            id: 'aid_1"
            start: datetime
            end: datetime
            participants: set() # for quick lookup
        },
        ...
    ]*/

    console.log(activities)

    // 3. Birth and Death Points Calculation
    const split_points = calculate_split_points(time_constraints, activities)
    /*{
        birth: [[datetime, [entities free this point onwards], ...]],
        death: [[datetime, [entities busy this point onwards], ...]]
    }*/

    // 4. Candidate Generation
    let candidates = prune_candidates(generate_candidates(time_constraints, split_points))
    /*
        [
            {start: DateTime, end: DateTime, available: [entities free during duration]}
        ]
    */

    // 5. Candidate Filtering & Scoring...
    const result = score_candidates(constraints, candidates)


    // Placeholder
    return {    
        bestOption: {
            date: "May 2",
            time: "02:00 PM",
            duration: "1.5hr",
            score: 98,
            attendees: involved_entities
        },
        alternatives: [
            { 
                date: "May 2", 
                time: "04:30 PM", 
                duration: "1.5hr", 
                score: 92, 
                attendees: involved_entities.slice(0, Math.ceil(involved_entities.length * 0.8))
            },
            { 
                date: "May 3", 
                time: "10:00 AM", 
                duration: "2hr", 
                score: 85, 
                attendees: involved_entities.slice(0, Math.ceil(involved_entities.length * 0.5))
            }
        ]
    };
};

module.exports = {
    solvePlan
};
