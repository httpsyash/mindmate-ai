import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Calendar, Sparkles, MessageSquare, ChevronRight } from 'lucide-react';
import { moodAPI, plannerAPI, recommendationAPI } from '../services/api';
import { Card, SectionTitle, Button } from '../components/ui';
import { SafetyBanner } from '../components/SafetyBanner';

export default function Dashboard() {
  const [moods, setMoods] = useState([]);
  const [plans, setPlans] = useState([]);
  const [todaysMood, setTodaysMood] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [mRes, pRes] = await Promise.all([moodAPI.get(7), plannerAPI.get(5)]);
      setMoods(mRes.data.moods || []);
      setPlans(pRes.data.plans || []);
      const today = new Date().toISOString().split('T')[0];
      setTodaysMood((mRes.data.moods || []).find((m) => m.recorded_at === today));
    } catch (err) {
      console.error('dashboard load', err);
    }
  }

  const moodEmoji = { happy: '😊', sad: '😔', stressed: '😰', angry: '😠', neutral: '😐' };

  return (
    <div className="space-y-6">
      <SectionTitle title="Welcome back" subtitle="Here's a quick look at your MindMate progress." />

      <SafetyBanner />

      <div className="grid grid-cols-1 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-calm-500">Today's mood</p>
              <h3 className="text-2xl font-semibold text-calm-900 flex items-center gap-2">
                {todaysMood ? moodEmoji[todaysMood.mood] + ' ' + todaysMood.mood.charAt(0).toUpperCase() + todaysMood.mood.slice(1) : '— Not recorded'}
              </h3>
            </div>
            <Activity size={24} className="text-brand-600" />
          </div>
          {todaysMood && todaysMood.note && (
            <p className="mt-3 text-sm text-calm-600 italic">"{todaysMood.note}"</p>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-calm-500">Study plans</p>
              <h3 className="text-2xl font-semibold text-calm-900">{plans.length}</h3>
            </div>
            <Calendar size={24} className="text-brand-600" />
          </div>
          {plans.length > 0 && (
            <p className="mt-3 text-sm text-calm-500">
              Latest: <span className="font-medium text-calm-900">{plans[0].title}</span>
            </p>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-calm-500">Chat messages</p>
              <h3 className="text-2xl font-semibold text-calm-900">{moods.length}</h3>
            </div>
            <MessageSquare size={24} className="text-brand-600" />
          </div>
          <p className="mt-3 text-sm text-calm-500">
            Track your mood to see trends over time.
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-calm-900">Quick actions</h3>
              <p className="text-calm-500 text-sm mt-1">Pick what you'd like to do next</p>
            </div>
            <Sparkles size={20} className="text-brand-600" />
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/chat" className="flex items-center gap-3 p-4 rounded-xl border border-calm-200 bg-white hover:bg-calm-50 transition-colors">
              <MessageSquare size={20} className="text-brand-600" />
              <div>
                <div className="text-sm font-medium text-calm-900">Talk to MindMate</div>
                <div className="text-[11px] text-calm-500">Context-aware conversation</div>
              </div>
              <ChevronRight size={16} className="ml-auto text-calm-400" />
            </Link>
            <Link to="/mood" className="flex items-center gap-3 p-4 rounded-xl border border-calm-200 bg-white hover:bg-calm-50 transition-colors">
              <Activity size={20} className="text-calm-600" />
              <div>
                <div className="text-sm font-medium text-calm-900">Log your mood</div>
                <div className="text-[11px] text-calm-500">Daily mood tracking</div>
              </div>
              <ChevronRight size={16} className="ml-auto text-calm-400" />
            </Link>
            <Link to="/planner" className="flex items-center gap-3 p-4 rounded-xl border border-calm-200 bg-white hover:bg-calm-50 transition-colors">
              <Calendar size={20} className="text-calm-600" />
              <div>
                <div className="text-sm font-medium text-calm-900">Study planner</div>
                <div className="text-[11px] text-calm-500">Personalized schedule</div>
              </div>
              <ChevronRight size={16} className="ml-auto text-calm-400" />
            </Link>
            <Link to="/recommendations" className="flex items-center gap-3 p-4 rounded-xl border border-calm-200 bg-white hover:bg-calm-50 transition-colors">
              <Sparkles size={20} className="text-calm-600" />
              <div>
                <div className="text-sm font-medium text-calm-900">Recommendations</div>
                <div className="text-[11px] text-calm-500">Breaks, breathing, journaling</div>
              </div>
              <ChevronRight size={16} className="ml-auto text-calm-400" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
