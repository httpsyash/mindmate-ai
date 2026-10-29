const { Conversation } = require('../models');
const { generateChatResponse } = require('../services/geminiService');
const { classifyEmotion, detectCrisis, getSafetyResponse } = require('../services/emotionService');

/**
 * POST /api/chat/message
 * Body: { message }
 * Protected: requires auth (req.user)
 */
async function sendMessage(req, res) {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const userName = req.user.name || 'there';

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // 1. Detect crisis/safety keywords
    const crisis = detectCrisis(message);

    // 2. Classify emotion of user message
    const emotion = classifyEmotion(message);

    // 3. Save user message to history
    await Conversation.add({
      userId,
      role: 'user',
      message: message.trim(),
      emotion: emotion.emotion,
    });

    // 4. Get recent conversation history for context
    const history = await Conversation.listByUser(userId, 20);

    // 5. If crisis, return safety response (still save assistant message)
    if (crisis.isCrisis) {
      const safety = getSafetyResponse();
      await Conversation.add({
        userId,
        role: 'assistant',
        message: safety.text,
        emotion: 'neutral',
      });

      return res.json({
        success: true,
        crisis: true,
        emotion: emotion.emotion,
        response: safety.text,
        resources: safety.resources,
      });
    }

    // 6. Generate AI response via Gemini
    const ai = await generateChatResponse(message.trim(), history, userName);

    // 7. Save assistant response
    await Conversation.add({
      userId,
      role: 'assistant',
      message: ai.text,
      emotion: ai.emotion,
    });

    return res.json({
      success: true,
      crisis: false,
      emotion: emotion.emotion,
      emotionScores: emotion.scores,
      response: ai.text,
    });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process message' });
  }
}

/**
 * GET /api/chat/history
 * Protected
 */
async function getHistory(req, res) {
  try {
    const userId = req.user.id;
    const limit = Number(req.query.limit) || 50;
    const messages = await Conversation.listByUser(userId, limit);
    // Return oldest first for chat UI
    messages.reverse();
    return res.json({ success: true, messages });
  } catch (err) {
    console.error('History error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load history' });
  }
}

/**
 * DELETE /api/chat/history
 * Clear conversation history for user
 */
async function clearHistory(req, res) {
  try {
    const userId = req.user.id;
    await Conversation.clearByUser(userId);
    return res.json({ success: true, message: 'Conversation history cleared' });
  } catch (err) {
    console.error('Clear history error:', err);
    return res.status(500).json({ success: false, message: 'Failed to clear history' });
  }
}

module.exports = { sendMessage, getHistory, clearHistory };
