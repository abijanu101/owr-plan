const Entity = require('../../models/Entities');
const Activity = require('../../models/Activities');

/* =========================================================
   PUBLIC API
========================================================= */

const generate_busy_blocks = async (constraints, time_constraints) => {
    console.log("[busy_block] START =====================");

    const global = time_constraints?.global || {};

    const rangeStart = global.range_start
        ? new Date(global.range_start)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const rangeEnd = global.range_end
        ? new Date(global.range_end)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    console.log("[busy_block] RANGE:", { rangeStart, rangeEnd });

    const entityIds = extractEntitiesFromConstraints(constraints);

    console.log("[busy_block] ENTITY IDS:", entityIds);

    if (!entityIds.length) {
        console.warn("[busy_block] No entities found");
        return [];
    }

    let allOccurrences = [];

    for (const entityId of entityIds) {
        console.log("\n[busy_block] Fetching activities for:", entityId);

        const activities = await fetchEntityActivities(entityId);

        console.log("[busy_block] Activities found:", activities.length);

        for (const activity of activities) {
            console.log("\n[busy_block] Expanding activity:", {
                id: activity._id,
                type: activity.activityType,
                recurringDay: activity.recurringDay,
                recurringStartTime: activity.recurringStartTime,
                recurringEndTime: activity.recurringEndTime,
                rangeStart: activity.rangeStart,
                rangeEnd: activity.rangeEnd
            });

            const occ = expandActivity(activity, rangeStart, rangeEnd);

            console.log("[busy_block] Occurrences from activity:", occ.length);

            allOccurrences.push(...occ);
        }
    }

    if (!allOccurrences.length) {
        console.warn("[busy_block] No occurrences generated");
        return [];
    }

    /* =====================================================
       MERGE
    ===================================================== */

    const grouped = new Map();

    for (const occ of allOccurrences) {
        const key = occ.id;

        if (!grouped.has(key)) {
            grouped.set(key, {
                id: key,
                start: occ.start,
                end: occ.end,
                participants: new Set(
                    (occ.participants || []).map(normalizeParticipant)
                )
            });
        } else {
            const block = grouped.get(key);

            block.start = new Date(Math.min(block.start, occ.start));
            block.end = new Date(Math.max(block.end, occ.end));

            (occ.participants || []).forEach(p =>
                block.participants.add(normalizeParticipant(p))
            );
        }
    }

    const finalBlocks = Array.from(grouped.values()).map(b => ({
        id: b.id,
        start: b.start,
        end: b.end,
        participants: Array.from(b.participants)
    }));

    console.log("[busy_block] TOTAL OCCURRENCES:", allOccurrences.length);
    console.log("[busy_block] FINAL BLOCKS:", finalBlocks.length);
    console.log("[busy_block] END");

    return finalBlocks;
};

/* =========================================================
   ENTITY EXTRACTION
========================================================= */

const extractEntitiesFromConstraints = (constraints = []) => {
    const ids = new Set();

    for (const c of constraints) {
        if (c.type === 'include' && Array.isArray(c.parameter)) {
            c.parameter.forEach(id => ids.add(id.toString()));
        }

        if (c.isBlock && Array.isArray(c.entity)) {
            c.entity.forEach(id => ids.add(id.toString()));
        }
    }

    return Array.from(ids);
};

/* =========================================================
   FETCH
========================================================= */

const fetchEntityActivities = async (entityId) => {
    const entity = await Entity.findById(entityId);
    if (!entity) return [];

    let participantIds = [entityId.toString()];

    if (entity.type === 'person') {
        const groups = await Entity.find({
            type: 'group',
            members: entityId
        }).select('_id');

        participantIds = [
            ...new Set([
                ...participantIds,
                ...groups.map(g => g._id.toString()),
                ...(entity.groups || []).map(g => g.toString())
            ])
        ];
    }

    return await Activity.find({
        participants: { $in: participantIds }
    }).populate('participants', 'name type color faceIcon').lean();
};

/* =========================================================
   EXPANSION CORE (FIXED)
========================================================= */

const expandActivity = (activity, rangeStart, rangeEnd) => {
    const occurrences = [];

    /* ---------------- NON-RECURRING ---------------- */

    if (activity.activityType === 'non-recurring') {
        const start = activity.rangeStart ? new Date(activity.rangeStart) : null;
        const end = activity.rangeEnd ? new Date(activity.rangeEnd) : null;

        if (!start || !end || isNaN(start) || isNaN(end)) {
            console.warn("[busy_block] Missing range (fallback slots check)");

            // 🔥 fallback to legacy slots
            if (activity.slots?.length) {
                for (const slot of activity.slots) {
                    occurrences.push({
                        id: activity._id.toString(),
                        start: new Date(`2026-01-01 ${slot.startTime}`),
                        end: new Date(`2026-01-01 ${slot.endTime}`),
                        participants: activity.participants || []
                    });
                }
            }

            return occurrences;
        }

        if (end <= rangeStart || start >= rangeEnd) return [];

        occurrences.push({
            id: activity._id.toString(),
            start,
            end,
            participants: activity.participants || []
        });

        return occurrences;
    }

    /* ---------------- RECURRING ---------------- */

    const weekdayMap = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
    };

    const day = activity.recurringDay?.toLowerCase();
    const targetDay = weekdayMap[day];

    if (targetDay == null) {
        console.warn("[busy_block] Invalid recurringDay:", activity.recurringDay);
        return [];
    }

    const startTime = parseTime(activity.recurringStartTime);
    const endTime = parseTime(activity.recurringEndTime);

    let cursor = new Date(rangeStart);
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= rangeEnd) {
        if (cursor.getDay() === targetDay) {
            const start = new Date(cursor);
            start.setHours(startTime.hours, startTime.minutes, 0, 0);

            const end = new Date(cursor);
            end.setHours(endTime.hours, endTime.minutes, 0, 0);

            if (end < start) end.setDate(end.getDate() + 1);

            occurrences.push({
                id: activity._id.toString(),
                start,
                end,
                participants: activity.participants || []
            });
        }

        cursor.setDate(cursor.getDate() + 1);
    }

    return occurrences;
};

/* =========================================================
   UTILS
========================================================= */

const parseTime = (str) => {
    if (!str) return { hours: 0, minutes: 0 };

    const [time, mod] = str.split(' ');
    let [h, m] = time.split(':').map(Number);

    if (mod === 'PM' && h < 12) h += 12;
    if (mod === 'AM' && h === 12) h = 0;

    return { hours: h, minutes: m };
};

const normalizeParticipant = (p) => {
    if (!p) return null;
    if (typeof p === 'string') return p;
    if (p._id) return p._id.toString();
    return null;
};

module.exports = {
    generate_busy_blocks
};