require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS ---
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'https://client-swart-chi.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Health check ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mindmate-ai-server', time: new Date().toISOString() });
});

// --- API routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/emotion', require('./routes/emotionRoutes'));
app.use('/api/mood', require('./routes/moodRoutes'));
app.use('/api/planner', require('./routes/plannerRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 MindMate AI server running on http://localhost:${PORT}`);
});

module.exports = app;
