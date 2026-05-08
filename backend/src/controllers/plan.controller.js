const planService = require('../services/plan.service');
const Entity      = require('../models/Entities');

/**
 * POST /api/plan
 * Body: { constraints: Constraint[] }
 *
 * Builds an entity_map from DB so the service can enrich response entities
 * with name/color/type without a second round-trip from the frontend.
 */
const generatePlan = async (req, res) => {
    console.log('--- Plan Generation Requested ---');
    try {
        console.log('Request Body:', JSON.stringify(req.body));
        const { constraints } = req.body;
        console.log('Constraints received:', constraints?.length ?? 0);

        if (!Array.isArray(constraints) || constraints.length === 0) {
            return res.status(400).json({ message: 'constraints array is required.' });
        }

        // Build a lightweight entity map for response enrichment
        const entities = await Entity.find({ userId: req.user._id })
            .select('name color type faceIcon')
            .lean();

        const entity_map = {};
        for (const e of entities) {
            entity_map[e._id.toString()] = {
                id:       e._id.toString(),
                name:     e.name,
                color:    e.color,
                type:     e.type,
                faceIcon: e.faceIcon
            };
        }

        const results = await planService.solvePlan(constraints, entity_map);

        return res.status(200).json(results);

    } catch (error) {
        console.error('Plan generation error:', error);
        return res.status(500).json({
            message: 'Internal server error during plan generation',
            error:   error.message
        });
    }
};

module.exports = { generatePlan };
