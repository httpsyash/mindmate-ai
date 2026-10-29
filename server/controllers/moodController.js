const { Mood } = require('../models');

/**
 * POST /api/mood
 * Body: { mood, note, recorded_at? }
 * Protected
 */
async function recordMood(req, res) {
  try {
    const userId = req.user.id;
    const { mood, note, recorded_at } = req.body;

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

    const recordedAt = recorded_at || new Date().toISOString().split('T')[0];

    const moodEntry = await Mood.upsert({
      userId,
      mood,
      note: note || null,
      recordedAt,
    });

    return res.status(201).json({
      success: true,
      message: 'Mood recorded',
      mood: moodEntry,
    });
  } catch (err) {
    console.error('Record mood error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record mood' });
  }
}

/**
 * GET /api/mood
 * Query: limit
 * Protected — returns mood trend history
 */
async function getMoods(req, res) {
  try {
    const userId = req.user.id;
    const limit = Number(req.query.limit) || 30;
    const moods = await Mood.listByUser(userId, limit);
    // Return oldest first for trend charts
    moods.reverse();
    return res.json({ success: true, moods });
  } catch (err) {
    console.error('Get moods error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load moods' });
  }
}

module.exports = { recordMood, getMoods };
