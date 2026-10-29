import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Calendar, Check, ChevronRight } from 'lucide-react';
import { moodAPI } from '../services/api';
import { Card, SectionTitle, Button } from './ui';

const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'neutral', label: 'Neutral', emoji: '😐', color: 'bg-calm-100 text-calm-700 border-calm-200' },
  { id: 'sad', label: 'Sad', emoji: '😔', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 'stressed', label: 'Stressed', emoji: '😰', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'angry', label: 'Angry', emoji: '😠', color: 'bg-red-100 text-red-700 border-red-200' },
];

export function MoodTracker() {
  const [moods, setMoods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [todayRecorded, setTodayRecorded] = useState(false);

  useEffect(() => {
    loadMoods();
  }, []);

  async function loadMoods() {
    try {
      const res = await moodAPI.get(30);
      setMoods(res.data.moods || []);
      const today = new Date().toISOString().split('T')[0];
      setTodayRecorded((res.data.moods || []).some((m) => m.recorded_at === today));
    } catch (err) {
      console.error('load moods', err);
    }
  }

  async function recordMood() {
    if (!selected) return;
    setSaving(true);
    try {
      await moodAPI.record({ mood: selected, note });
      setSelected(null);
      setNote('');
      await loadMoods();
    } catch (err) {
      console.error('record mood', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Daily Mood Check-in"
        subtitle="Recording your mood helps you see emotional trends over time."
      />

      <Card className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-calm-900">How are you feeling today?</h3>
            <p className="text-calm-500 text-sm">Select one mood for today</p>
          </div>
          {todayRecorded && (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium flex items-center gap-1">
              <Check size={12} /> Recorded today
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-3">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                selected === m.id
                  ? m.color.replace('bg-', 'bg-').replace('text-', 'text-') + ' border-' + m.color.split(' ')[2].replace('border-', '') + '-500'
                  : 'border-calm-200 bg-white hover:bg-calm-50 hover:border-calm-300'
              }`}
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-sm font-medium text-calm-700">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-calm-700 mb-2">Add a note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind?..."
            className="w-full rounded-xl border border-calm-200 bg-white px-4 py-3 text-calm-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            rows={2}
          />
        </div>

        <div className="mt-6">
          <Button
            variant="primary"
            onClick={recordMood}
            disabled={!selected || saving || todayRecorded}
            className="w-full"
          >
            {saving ? 'Saving…' : 'Record Mood'}
          </Button>
        </div>
      </Card>

      <MoodChart moods={moods} />
    </div>
  );
}

function MoodChart({ moods }) {
  if (moods.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Activity size={32} className="mx-auto mb-3 text-calm-300" />
          <p className="text-calm-500 text-sm">No mood entries yet. Record your first mood above.</p>
        </div>
      </Card>
    );
  }

  // Map mood to a numeric value for the chart
  const moodValue = { happy: 4, neutral: 3, sad: 2, stressed: 1, angry: 0 };
  const data = moods
    .slice()
    .reverse()
    .map((m) => ({ mood: m.mood, value: moodValue[m.mood] || 0, date: m.recorded_at }));

  return (
    <Card>
      <SectionTitle title="Mood Trends" subtitle="Your mood over the last 30 days" />
      <div className="h-64 w-full">
        {/* Simple sparkline-style trend using SVG for zero-dependency rendering */}
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            points={data.map((d, i) => `${i * (90 / Math.max(data.length - 1, 1))} ${100 - d.value * 18}`).join(' ')}
            fill="none"
            stroke="#14b8a6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((d, i) => (
            <circle
              key={i}
              cx={i * (90 / Math.max(data.length - 1, 1))}
              cy={100 - d.value * 18}
              r="2.5"
              fill="#14b8a6"
            />
          ))}
        </svg>
        <div className="mt-4 flex flex-wrap gap-6 text-xs text-calm-500">
          {Object.entries(moodValue).map(([mood, val]) => (
            <span key={mood} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MOODS.find((m) => m.id === mood)?.color.includes('emerald') ? '#10b981' : MOODS.find((m) => m.id === mood)?.color.includes('rose') ? '#f43f5e' : '#94a3b8' }} />
              {mood.charAt(0).toUpperCase() + mood.slice(1)}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
