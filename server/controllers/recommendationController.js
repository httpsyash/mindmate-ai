const { Recommendation } = require('../models');
const { generateRecommendations } = require('../services/geminiService');

/**
 * POST /api/recommendations
 * Body: { mood, context? }
 * Protected — generate + save personalized recommendations
 */
async function getRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const { mood, context } = req.body;

    if (!mood) {
      return res.status(400).json({ success: false, message: 'Mood is required' });
    }

    const validMoods = ['happy', 'sad', 'stressed', 'angry', 'neutral'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: 'Mood must be one of: ' + validMoods.join(', '),
      });
    }

    let recommendations;
    try {
      recommendations = await generateRecommendations(mood, context || '');
    } catch (err) {
      console.error('Gemini recommendations failed:', err.message);
      recommendations = [
        { type: 'break', title: 'Take a short break', content: 'Step away for 5–10 minutes and stretch.' },
        { type: 'breathing', title: 'Box breathing', content: 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 times.' },
        { type: 'journaling', title: 'Quick journal', content: 'Write down three things going well today.' },
      ];
    }

    // Save recommendations
    for (const rec of recommendations) {
      await Recommendation.add({
        userId,
        type: rec.type,
        title: rec.title,
        content: rec.content,
      });
    }

    return res.json({ success: true, recommendations });
  } catch (err) {
    console.error('Recommendations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get recommendations' });
  }
}

/**
 * GET /api/recommendations
 * Protected — list saved recommendations
 */
async function listRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const limit = Number(req.query.limit) || 20;
    const recs = await Recommendation.listByUser(userId, limit);
    return res.json({ success: true, recommendations: recs });
  } catch (err) {
    console.error('List recommendations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load recommendations' });
  }
}

module.exports = { getRecommendations, listRecommendations };
