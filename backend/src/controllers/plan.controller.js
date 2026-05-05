const planService = require('../services/plan.service');

/**
 * Endpoint to generate a plan based on provided constraints.
 */
const generatePlan = async (req, res) => {
    console.log('--- Plan Generation Requested ---');
    try {
        const { constraints } = req.body;
        console.log('Constraints received:', constraints?.length || 0);

        // Call the service to handle the heavy lifting
        const results = await planService.solvePlan(constraints);

        // Simulate some processing time for better UX feel
        setTimeout(() => {
            res.status(200).json(results);
        }, 1500);
        
    } catch (error) {
        console.error('Plan generation error:', error);
        res.status(500).json({ 
            message: 'Internal server error during plan generation',
            error: error.message 
        });
    }
};

module.exports = {
    generatePlan
};
