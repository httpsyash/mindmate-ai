const { StudyPlan } = require('../models');
const { generateStudyPlan } = require('../services/geminiService');
const { generateLocalPlan } = require('../services/plannerService');

/**
 * POST /api/planner
 * Body: { subjects[], availableHoursPerDay, deadline, preparationLevel }
 * Protected — generates and saves a study plan
 */
async function createPlan(req, res) {
  try {
    const userId = req.user.id;
    const userName = req.user.name || 'there';
    const { subjects, availableHoursPerDay, deadline, preparationLevel } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one subject',
      });
    }

    const hours = Number(availableHoursPerDay) || 2;
    const prep = preparationLevel || 'medium';

    // Try Gemini AI first, fall back to local planner
    let result;
    try {
      const ai = await generateStudyPlan({
        subjects,
        availableHoursPerDay: hours,
        deadline,
        preparationLevel: prep,
        userName,
      });
      if (ai.plan && ai.plan.length > 0) {
        result = { plan: ai.plan, source: 'ai', note: ai.note || null };
      } else {
        result = generateLocalPlan({ subjects, availableHoursPerDay: hours, deadline, preparationLevel: prep, userName });
        result.source = 'local';
      }
    } catch (err) {
      console.error('Gemini planner failed, using local:', err.message);
      result = generateLocalPlan({ subjects, availableHoursPerDay: hours, deadline, preparationLevel: prep, userName });
      result.source = 'local';
    }

    // Save plan to database
    const saved = await StudyPlan.create({
      userId,
      title: `Study Plan – ${new Date().toLocaleDateString()}`,
      subjects,
      availableHoursPerDay: hours,
      deadline,
      preparationLevel: prep,
      schedule: result.plan,
    });

    return res.json({
      success: true,
      message: 'Study plan generated',
      source: result.source,
      note: result.note || null,
      plan: saved.schedule,
      planId: saved.id,
    });
  } catch (err) {
    console.error('Create plan error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate study plan' });
  }
}

/**
 * GET /api/planner
 * Protected — list user's saved plans
 */
async function getPlans(req, res) {
  try {
    const userId = req.user.id;
    const limit = Number(req.query.limit) || 10;
    const plans = await StudyPlan.listByUser(userId, limit);
    return res.json({ success: true, plans });
  } catch (err) {
    console.error('Get plans error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load plans' });
  }
}

module.exports = { createPlan, getPlans };
