/**
 * Emotion analysis service.
 * Provides keyword/rule-based emotion detection from text.
 * Used as a fast, offline-first classifier alongside Gemini.
 */

const EMOTIONS = ['happy', 'sad', 'stressed', 'angry', 'neutral'];

const KEYWORDS = {
  happy: [
    'happy', 'joy', 'joyful', 'great', 'good', 'amazing', 'wonderful',
    'excited', 'grateful', 'thankful', 'love', 'loving', 'proud',
    'celebrat', 'fantastic', 'excellent', 'cheerful', 'glad',
  ],
  sad: [
    'sad', 'sadness', 'depressed', 'depression', 'down', 'upset',
    'cry', 'crying', 'tear', 'lonely', 'loneliness', 'hopeless',
    'miserable', 'heartbroken', 'grief', 'sorrow', 'unhappy',
  ],
  stressed: [
    'stress', 'stressed', 'stressful', 'overwhelm', 'overwhelmed',
    'pressure', 'anxious', 'anxiety', 'panic', 'tense', 'worry',
    'worried', 'burnout', 'burnt out', 'exhausted', 'too much',
    'can not cope', 'cannot cope', 'deadline', 'busy',
  ],
  angry: [
    'angry', 'anger', 'mad', 'furious', 'annoyed', 'frustrated',
    'irritated', 'rage', 'hate', 'resentful', 'agitated',
    'losing my temper', 'pissed', 'cross',
  ],
};

/**
 * Classify emotion from text using keyword matching.
 * Returns { emotion, confidence, scores }
 */
function classifyEmotion(text) {
  const lower = (text || '').toLowerCase();
  const scores = {};

  for (const emotion of EMOTIONS) {
    scores[emotion] = 0;
  }

  for (const [emotion, keywords] of Object.entries(KEYWORDS)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const matches = lower.match(regex);
      if (matches) {
        scores[emotion] += matches.length;
      }
    }
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  let topEmotion = 'neutral';
  let topScore = 0;

  for (const [emotion, score] of Object.entries(scores)) {
    if (score > topScore) {
      topScore = score;
      topEmotion = emotion;
    }
  }

  const confidence = total > 0 ? topScore / total : 0;

  return {
    emotion: topEmotion,
    confidence: Number(confidence.toFixed(2)),
    scores,
  };
}

/**
 * Detect safety / crisis keywords in text.
 * Returns { isCrisis: boolean, keywords: string[] }
 */
function detectCrisis(text) {
  const lower = (text || '').toLowerCase();
  const crisisKeywords = [
    'suicide', 'suicidal', 'kill myself', 'end my life',
    'self harm', 'self-harm', 'hurt myself', 'want to die',
    'ending it all', 'no reason to live', 'give up on life',
  ];

  const found = crisisKeywords.filter((kw) => lower.includes(kw.toLowerCase()));
  return { isCrisis: found.length > 0, keywords: found };
}

/**
 * Safety response for crisis situations.
 */
function getSafetyResponse() {
  return {
    text: 'I am really concerned about you. You do not have to go through this alone. Please reach out right now to someone you trust — a friend, family member, or a qualified professional. If you feel you are in immediate danger, call emergency services (for example, 911 in the US, 999 in the UK, or your local emergency number) or a crisis helpline in your country. You matter, and help is available.',
    emotion: 'neutral',
    isCrisis: true,
    resources: [
      { name: 'Emergency Services', description: 'Call your local emergency number (e.g., 911, 999, 112) if you are in immediate danger.' },
      { name: 'Crisis Text Line', description: 'Text HOME to 741741 (US/Canada) to connect with a crisis counselor.' },
      { name: '988 Suicide & Crisis Lifeline', description: 'Call or text 988 (US) for 24/7 confidential support.' },
      { name: 'Befrienders Worldwide', description: 'https://www.befrienders.org/ — international crisis helplines.' },
    ],
  };
}

module.exports = {
  classifyEmotion,
  detectCrisis,
  getSafetyResponse,
  EMOTIONS,
};
