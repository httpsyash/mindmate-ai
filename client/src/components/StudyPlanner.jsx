import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, Target, RefreshCw } from 'lucide-react';
import { plannerAPI } from '../services/api';
import { Card, SectionTitle, Button, Input } from './ui';

export function StudyPlanner() {
  const [form, setForm] = useState({
    subjects: '',
    availableHoursPerDay: 2,
    deadline: '',
    preparationLevel: 'medium',
  });
  const [plan, setPlan] = useState(null);
  const [source, setSource] = useState(null);
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);

  const subjectsList = form.subjects
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  async function createPlan(e) {
    e.preventDefault();
    if (subjectsList.length === 0) return;
    setLoading(true);
    try {
      const res = await plannerAPI.create({
        subjects: subjectsList,
        availableHoursPerDay: form.availableHoursPerDay,
        deadline: form.deadline || null,
        preparationLevel: form.preparationLevel,
      });
      setPlan(res.data.plan);
      setSource(res.data.source);
      setNote(res.data.note || null);
    } catch (err) {
      console.error('create plan', err);
      alert('Failed to generate study plan. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="AI Study Planner"
        subtitle="Get a personalized schedule based on your subjects, time, deadline, and prep level."
      />

      <Card className="grid grid-cols-1 gap-5">
        <form onSubmit={createPlan} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-calm-700 mb-1">Subjects</label>
              <input
                value={form.subjects}
                onChange={(e) => setForm({ ...form, subjects: e.target.value })}
                placeholder="e.g. Math, Physics, History"
                className="w-full rounded-xl border border-calm-200 bg-white px-4 py-3 text-calm-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[10px] text-calm-400 mt-1">Comma-separated subjects</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-calm-700 mb-1">Hours per day</label>
                <input
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={form.availableHoursPerDay}
                  onChange={(e) =>
                    setForm({ ...form, availableHoursPerDay: Number(e.target.value) || 2 })
                  }
                  className="w-full rounded-xl border border-calm-200 bg-white px-4 py-3 text-calm-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-calm-700 mb-1">Preparation level</label>
                <select
                  value={form.preparationLevel}
                  onChange={(e) => setForm({ ...form, preparationLevel: e.target.value })}
                  className="w-full rounded-xl border border-calm-200 bg-white px-4 py-3 text-calm-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="medium">Medium</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-calm-700 mb-1">Deadline (optional)</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full rounded-xl border border-calm-200 bg-white px-4 py-3 text-calm-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" disabled={loading} className="w-full">
            {loading ? <RefreshCw size={18} className="mr-2 animate-spin" /> : 'Generate Plan'} <BookOpen size={18} className="ml-2" />
          </Button>
        </form>
      </Card>

      {plan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-4"
        >
          <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-50 border border-brand-100">
            <div>
              <h3 className="font-semibold text-brand-800">Study plan ready</h3>
              <p className="text-[11px] text-brand-600 mt-1">
                Generated via {source === 'ai' ? 'AI (Gemini)' : 'local planner'}{note ? ` — ${note}` : ''}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium">
              {source === 'ai' ? 'AI-generated' : 'Smart schedule'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {plan.map((day, i) => (
              <Card key={day.date || i} className="p-4 hover:border-brand-200 transition-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-calm-400" />
                    <span className="font-semibold text-calm-900">{day.day}</span>
                    <span className="text-xs text-calm-500 ml-auto">{day.date}</span>
                  </div>
                  <span className="text-[10px] font-medium bg-calm-100 text-calm-600 px-2 py-0.5 rounded">
                    {day.totalStudyMinutes} min study
                  </span>
                </div>
                <div className="space-y-2">
                  {day.blocks.map((block, j) => (
                    <div
                      key={j}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm border ${
                        block.type === 'break'
                          ? 'border-calm-100 bg-calm-50 text-calm-600'
                          : 'border-brand-100 bg-brand-50 text-brand-800'
                      }`}
                    >
                      <span className="font-medium">{block.subject}</span>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-calm-400" />
                        <span>{block.time}</span>
                      </div>
                      <span className="text-[10px] font-bold">{block.durationMinutes} min</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
