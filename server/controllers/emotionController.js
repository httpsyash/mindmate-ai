const { classifyEmotion, detectCrisis, getSafetyResponse, EMOTIONS } = require('../services/emotionService');

/**
 * POST /api/emotion/analyze
 * Body: { text }
 * Analyzes emotion from text (keyword-based, offline)
 */
async function analyze(req, res) {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }

    const result = classifyEmotion(text);
    const crisis = detectCrisis(text);

    let safety = null;
    if (crisis.isCrisis) {
      safety = getSafetyResponse();
    }

    return res.json({
      success: true,
      emotion: result.emotion,
      confidence: result.confidence,
      scores: result.scores,
      availableEmotions: EMOTIONS,
      crisis: crisis.isCrisis,
      safety,
    });
  } catch (err) {
    console.error('Emotion analyze error:', err);
    return res.status(500).json({ success: false, message: 'Emotion analysis failed' });
  }
}

module.exports = { analyze };
