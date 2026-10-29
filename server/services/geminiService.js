const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

let genAI = null;
let model = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: modelName });
    console.log(`✅ Gemini AI initialized with model: ${modelName}`);
  } catch (err) {
    console.error('❌ Failed to initialize Gemini AI:', err.message);
  }
} else {
  console.log('⚠️  GEMINI_API_KEY not set — AI features will return fallback responses');
}

/**
 * Generate a chat response from Gemini with context awareness.
 * @param {string} userMessage - The user's message
 * @param {Array} history - Previous conversation messages [{role, message}]
 * @param {string} userName - User's name for personalization
 */
async function generateChatResponse(userMessage, history = [], userName = 'there') {
  if (!model) {
    return {
      text: `Hi ${userName}! I'm MindMate. I'm here to listen and help. Please configure your Gemini API key to enable full AI conversation.`,
      emotion: 'neutral',
    };
  }

  try {
    // Build conversation context
    const contextMessages = history
      .slice(-10) // last 10 messages for context
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.message}`)
      .join('\n');

    const systemPrompt = `You are MindMate, a warm, empathetic, context-aware AI mental wellness and study companion.

Your role:
- Listen with empathy and respond in a supportive, non-judgmental tone.
- Help with stress, sadness, anger, and everyday emotional challenges.
- Offer gentle, practical suggestions (breaks, breathing, journaling, study techniques).
- If a user expresses serious safety concerns (self-harm, suicide, crisis), encourage them to reach out to trusted people, qualified professionals, or emergency/crisis services immediately. Do not provide medical diagnosis or replace professional help.
- Be concise, kind, and encouraging.

Current user: ${userName}

${contextMessages ? `Recent conversation:\n${contextMessages}\n` : ''}
User: ${userMessage}
Assistant:`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return { text, emotion: 'neutral' };
  } catch (err) {
    console.error('Gemini chat error:', err.message);
    return {
      text: `I'm here for you, ${userName}. I'm listening closely. How can I best support you today?`,
      emotion: 'neutral',
    };
  }
}

/**
 * Generate a personalized study plan.
 * @param {Object} params - {subjects, availableHoursPerDay, deadline, preparationLevel, userName}
 */
async function generateStudyPlan(params) {
  if (!model) {
    return {
      plan: null,
      error: 'GEMINI_API_KEY not configured',
    };
  }

  try {
    const subjectsStr = Array.isArray(params.subjects)
      ? params.subjects.map((s) => (typeof s === 'string' ? s : s.name)).join(', ')
      : String(params.subjects);

    const prompt = `You are an AI study planner. Create a realistic, personalized daily study schedule.

User: ${params.userName || 'Student'}
Subjects: ${subjectsStr}
Available study time per day: ${params.availableHoursPerDay || 2} hours
Deadline: ${params.deadline || 'flexible'}
Preparation level: ${params.preparationLevel || 'medium'}

Requirements:
- Break time into focused blocks (e.g., 25-50 min study + 5-10 min break).
- Prioritize subjects based on deadline and preparation level.
- Include rest, sleep, and buffer time.
- Return a JSON array of 5-7 days:
  [
    {
      "day": "Monday",
      "date": "2026-10-30",
      "totalStudyMinutes": 120,
      "blocks": [
        { "time": "09:00", "subject": "${params.subjects[0] || 'Subject'}", "durationMinutes": 45, "type": "study" },
        { "time": "09:45", "subject": "Break / Refresh", "durationMinutes": 15, "type": "break" }
      ]
    }
  ]
Respond ONLY with valid JSON array. No markdown code blocks, no explanation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean any markdown fencing if returned
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let plan;
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      plan = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    } else {
      plan = JSON.parse(text);
    }

    return { plan, note: '✨ AI Personalized Study Schedule' };
  } catch (err) {
    console.error('Gemini study plan error:', err.message);
    return {
      plan: null,
      error: 'Unable to generate AI plan at this time.',
    };
  }
}

/**
 * Generate personalized recommendations based on mood/context.
 * @param {string} mood - current mood
 * @param {string} context - additional context
 */
async function generateRecommendations(mood, context = '') {
  if (!model) {
    return [
      { type: 'break', title: 'Take a short break', content: 'Step away from your screen for 5–10 minutes.' },
      { type: 'breathing', title: 'Box breathing', content: 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 times.' },
      { type: 'study_technique', title: 'Pomodoro Technique', content: 'Work for 25 minutes, then take a 5-minute break.' },
      { type: 'journaling', title: 'Brain Dump', content: 'Spend 3 minutes writing whatever comes to mind.' },
    ];
  }

  try {
    const prompt = `You are MindMate, a wellness companion. Based on the user's mood ("${mood}")${context ? ` and context: "${context}"` : ''}, suggest 3–4 personalized recommendations.

Allowed types: break, breathing, study_technique, journaling, productivity.

For each, provide JSON object: { "type": "...", "title": "...", "content": "1-2 practical sentences" }
Respond ONLY with a valid JSON array of objects. No markdown code blocks.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let recommendations;
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      recommendations = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    } else {
      recommendations = JSON.parse(text);
    }

    return recommendations;
  } catch (err) {
    console.error('Gemini recommendations error:', err.message);
    return [
      { type: 'break', title: 'Take a short break', content: 'Step away for a few minutes and stretch.' },
      { type: 'breathing', title: 'Box breathing', content: 'Inhale 4s, hold 4s, exhale 4s, hold 4s.' },
      { type: 'journaling', title: 'Quick reflection', content: 'Write down one small thing you can accomplish today.' },
    ];
  }
}

module.exports = {
  generateChatResponse,
  generateStudyPlan,
  generateRecommendations,
  hasGemini: Boolean(model),
};
