import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Wand2, Leaf, Clock, Book, Target } from 'lucide-react';
import { recommendationAPI } from '../services/api';
import { Card, SectionTitle, Button } from './ui';

const ICONS = {
  break: Clock,
  breathing: Leaf,
  study_technique: Book,
  journaling: Wand2,
  productivity: Target,
};

const TYPE_LABELS = {
  break: 'Take a Break',
  breathing: 'Breathing Exercise',
  study_technique: 'Study Technique',
  journaling: 'Journaling',
  productivity: 'Productivity',
};

export function Recommendations() {
  const [mood, setMood] = useState('neutral');
  const [context, setContext] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const moods = ['happy', 'neutral', 'sad', 'stressed', 'angry'];

  async function fetchRecommendations() {
    setLoading(true);
    try {
      const res = await recommendationAPI.get({ mood, context });
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error('recommendations', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Personalized Recommendations"
        subtitle="Gentle suggestions for breaks, breathing, study techniques, journaling, and productivity."
      />

      <Card className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-calm-700">Current mood</label>
          <div className="flex gap-2 flex-1">
            {moods.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  mood === m
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-calm-200 text-calm-600 hover:bg-calm-50'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-calm-700 mb-1">
            What's on your mind? (optional)
          </label>
          <input
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. I have an exam tomorrow and feel anxious"
            className="w-full rounded-xl border border-calm-200 bg-white px-4 py-3 text-calm-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <Button
          variant="primary"
          onClick={fetchRecommendations}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Getting suggestions…' : 'Get Recommendations'}
        </Button>
      </Card>

      <Card className="grid grid-cols-1 gap-3">
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Wand2 size={32} className="mx-auto mb-3 text-calm-300" />
            <p className="text-calm-500 text-sm">
              No recommendations yet. Select your mood and get suggestions.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, i) => {
              const Icon = ICONS[rec.type] || Book;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 rounded-2xl border border-calm-100 bg-white hover:shadow-soft transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-calm-100 flex items-center justify-center text-calm-600 shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-calm-900">
                        {TYPE_LABELS[rec.type] || rec.type}
                      </span>
                      <span className="text-[10px] font-bold bg-calm-100 text-calm-600 px-2 py-0.5 rounded">
                        {rec.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-calm-600 text-sm mt-1 leading-relaxed">
                      {rec.content}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
