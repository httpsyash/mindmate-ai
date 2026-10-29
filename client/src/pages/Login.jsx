import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Card, Button, Input } from '../components/ui';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  // 1-Click Gmail / Google Sign-in
  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await authAPI.googleAuth({
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        googleId: user.uid,
        avatar: user.photoURL,
        firebaseIdToken: idToken,
      });

      loginUser(res.data.token, res.data.user);
      toast.success(`Welcome back, ${user.displayName || 'Friend'}!`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        toast('Google popup closed');
      } else if (err.code === 'auth/operation-not-allowed') {
        toast.error('Google provider not enabled in Firebase Console. Sign in with Email below!');
      } else {
        toast.error(err.message || 'Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!form.identifier || !form.password) {
      toast.error('Please enter your email/phone and password');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login({
        identifier: form.identifier.trim(),
        password: form.password,
      });
      loginUser(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-calm-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto mb-3 text-xl shadow-soft">
              <Mail size={22} />
            </div>
            <h2 className="text-2xl font-bold text-calm-900">Welcome back</h2>
            <p className="text-calm-500 text-sm mt-1">Sign in to your MindMate account</p>
          </div>

          {/* 1-Click Gmail / Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full mb-5 flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-calm-300 bg-white hover:bg-calm-50 font-medium text-calm-700 shadow-sm transition-all"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {googleLoading ? 'Connecting to Google…' : 'Sign in with Google (Gmail)'}
          </button>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-calm-200 w-full"></div>
            <span className="bg-white px-3 text-xs uppercase tracking-wider text-calm-400 font-medium absolute">
              or sign in with password
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Gmail, Email, or Mobile"
              placeholder="you@gmail.com or +91 9876543210"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              leftIcon={<Mail size={18} className="text-calm-400" />}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              leftIcon={<Lock size={18} className="text-calm-400" />}
            />

            <Button type="submit" variant="primary" disabled={loading || googleLoading} className="w-full">
              {loading ? 'Signing in…' : 'Sign in'}
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </form>

          <p className="mt-6 text-center text-calm-500 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
