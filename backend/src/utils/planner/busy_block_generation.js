// utils/planner/busy_block_generation.js

/**
 * STEP 2: Busy Block Generation
 * 
 * INTENTION:
 * Fetches existing activities from the database for all participants and 
 * expands recurring rules into concrete, timestamped blocks within the 
 * planning range.
 * 
 * KEY DECISION:
 * All individual busy blocks are merged into a unified timeline. If multiple
 * events overlap for different people, they are consolidated to simplify
 * the subsequent sweep-line calculations.
 * 
 * INPUT SHAPE:
 * - constraints: Raw frontend constraints.
 * - time_constraints: Normalized temporal buckets (from Step 1).
 * 
 * OUTPUT SHAPE:
 * - Promise<BusyBlock[]>
 *   BusyBlock: { id: string, start: Date, end: Date, participants: string[] }
 */

const Entity = require('../../models/Entities');
const Activity = require('../../models/Activities');
const { extract_all_entities } = require('./entity_extraction');

const generate_busy_blocks = async (constraints, time_constraints) => {
    const global = time_constraints?.global || {};
    const rangeStart = global.range_start ? new Date(global.range_start) : new Date();
    const rangeEnd   = global.range_end   ? new Date(global.range_end)   : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const entityIds = await extract_all_entities(constraints);
    if (!entityIds.length) return [];

    let allOccurrences = [];
    for (const entityId of entityIds) {
        const activities = await fetchEntityActivities(entityId);
        console.log(`[   busy] Found ${activities.length} raw activities for entity ${entityId}`);
        for (const activity of activities) {
            const occ = expandActivity(activity, rangeStart, rangeEnd);
            allOccurrences.push(...occ);
        }
    }

    if (allOccurrences.length > 0) {
        // Log summarized occurrences if needed
    }

    // 1. Sort all occurrences by start time
    allOccurrences.sort((a, b) => a.start - b.start);

    // 2. Merge overlapping blocks
    const merged = [];
    if (allOccurrences.length > 0) {
        let current = {
            id:           allOccurrences[0].id,
            start:        new Date(allOccurrences[0].start),
            end:          new Date(allOccurrences[0].end),
            participants: new Set((allOccurrences[0].participants || []).map(p => p?._id?.toString() || p?.toString()))
        };

        for (let i = 1; i < allOccurrences.length; i++) {
            const next = allOccurrences[i];
            const next_participants = (next.participants || []).map(p => p?._id?.toString() || p?.toString());

            // If overlaps, merge
            if (next.start <= current.end) {
                current.end = new Date(Math.max(current.end.getTime(), next.end.getTime()));
                next_participants.forEach(p => current.participants.add(p));
            } else {
                // No overlap, push current and start new
                merged.push({ ...current, participants: Array.from(current.participants) });
                current = {
                    id:           next.id,
                    start:        new Date(next.start),
                    end:          new Date(next.end),
                    participants: new Set(next_participants)
                };
            }
        }
        merged.push({ ...current, participants: Array.from(current.participants) });
    }

    console.log(`[   busy] Final merged busy blocks: ${merged.length}`);
    return merged;
};

const fetchEntityActivities = async (entityId) => {
    const entity = await Entity.findById(entityId);
    if (!entity) return [];

    let pIds = [entityId.toString()];
    if (entity.type === 'person') {
        const groups = await Entity.find({ type: 'group', members: entityId }).select('_id');
        pIds = [...new Set([...pIds, ...groups.map(g => g._id.toString()), ...(entity.groups || []).map(g => g.toString())])];
    }

    return await Activity.find({ participants: { $in: pIds } }).populate('participants', 'name type color faceIcon').lean();
};

const expandActivity = (activity, rangeStart, rangeEnd) => {
    const occurrences = [];
    if (activity.activityType === 'non-recurring') {
        const s = activity.rangeStart ? new Date(activity.rangeStart) : null;
        const e = activity.rangeEnd ? new Date(activity.rangeEnd) : null;
        if (!s || !e || isNaN(s) || isNaN(e) || e <= rangeStart || s >= rangeEnd) return [];
        occurrences.push({ id: activity._id.toString(), start: s, end: e, participants: activity.participants || [] });
    } else {
        const isDaily = activity.everyUnit === 'Day';
        const targetDay = isDaily ? null : { sunday:0, monday:1, tuesday:2, wednesday:3, thursday:4, friday:5, saturday:6 }[activity.recurringDay?.toLowerCase()];
        if (!isDaily && targetDay == null) return [];

        const startT = parseTime(activity.recurringStartTime);
        const endT   = parseTime(activity.recurringEndTime);

        let cursor = new Date(rangeStart);
        cursor.setHours(0, 0, 0, 0);
        while (cursor <= rangeEnd) {
            if (isDaily || cursor.getDay() === targetDay) {
                const s = new Date(cursor); s.setHours(startT.hours, startT.minutes, 0, 0);
                const e = new Date(cursor); e.setHours(endT.hours, endT.minutes, 0, 0);
                if (e < s) e.setDate(e.getDate() + 1);
                occurrences.push({ id: activity._id.toString(), start: s, end: e, participants: activity.participants || [] });
            }
            cursor.setDate(cursor.getDate() + 1);
        }
    }
    return occurrences;
};

const parseTime = (str) => {
    if (!str) return { hours: 0, minutes: 0 };
    const [time, mod] = str.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (mod === 'PM' && h < 12) h += 12;
    if (mod === 'AM' && h === 12) h = 0;
    return { hours: h, minutes: m };
};

module.exports = { generate_busy_blocks };