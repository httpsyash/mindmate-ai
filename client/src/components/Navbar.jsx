import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  MessageSquare,
  Activity,
  Calendar,
  Sparkles,
  LogOut,
  User,
  Brain,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Chat', icon: MessageSquare, path: '/chat' },
  { label: 'Mood', icon: Activity, path: '/mood' },
  { label: 'Planner', icon: Calendar, path: '/planner' },
  { label: 'Recommendations', icon: Sparkles, path: '/recommendations' },
];

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-calm-200">
      <div className="flex items-center justify-between px-5 py-3">
        <div
          onClick={() => navigate(user ? '/dashboard' : '/')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-soft">
            M
          </div>
          <span className="font-bold text-xl text-calm-900 tracking-tight">MindMate</span>
          <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">AI</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.path);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-calm-600 hover:bg-calm-100 hover:text-brand-600 transition-colors"
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-calm-900">{user.name}</span>
                <span className="text-xs text-calm-500">{user.email || user.mobile}</span>
              </div>
              <button
                onClick={logoutUser}
                className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-brand-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-soft hover:bg-brand-500 transition-colors"
            >
              Get started
            </button>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-calm-600 hover:bg-calm-100 rounded-lg"
            aria-label="Open menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-calm-100 bg-white overflow-hidden"
          >
            <div className="px-5 py-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl font-medium text-calm-600 hover:bg-calm-100 hover:text-brand-600 transition-colors"
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
              <div className="pt-4 border-t border-calm-100">
                <button
                  onClick={logoutUser}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} /> Sign out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
