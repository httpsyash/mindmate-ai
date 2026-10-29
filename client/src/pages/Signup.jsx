import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Card, Button, Input } from '../components/ui';
import { auth } from '../firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

export default function Signup() {
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'done'
  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'mobile'
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);
  const [smsError, setSmsError] = useState(null);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  // 1-Click Gmail / Google Verification
  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setSmsError(null);
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
      setStep('done');
      toast.success(`Welcome, ${user.displayName || 'Friend'}! Gmail verified.`);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      console.error('Google Sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        toast('Google popup closed');
      } else if (err.code === 'auth/operation-not-allowed') {
        toast.error('Google provider not enabled in Firebase Console. You can sign up with Email below!');
      } else {
        toast.error(err.message || 'Google verification failed. Use Email sign up below.');
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  // Email / Mobile signup
  async function handleSignup(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.name || !form.password) {
      toast.error('Please enter your name and password');
      return;
    }

    if (authMethod === 'email' && !form.email) {
      toast.error('Please enter your Gmail / email address');
      return;
    }

    if (authMethod === 'mobile' && !form.mobile) {
      toast.error('Please enter your mobile number');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setSmsError(null);
    try {
      const res = await authAPI.signup({
        name: form.name.trim(),
        email: form.email ? form.email.trim() : null,
        mobile: form.mobile ? form.mobile.trim() : null,
        password: form.password,
      });

      loginUser(res.data.token, res.data.user);
      setStep('done');
      toast.success('Account created successfully!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      console.error('signup error', err);
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  // Attempt Firebase Phone SMS OTP (optional fallback)
  async function handlePhoneOtp(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.name || !form.mobile || !form.password) {
      toast.error('Please fill in name, mobile, and password');
      return;
    }
    setLoading(true);
    setSmsError(null);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }

      const result = await signInWithPhoneNumber(auth, form.mobile.trim(), window.recaptchaVerifier);
      setConfirmResult(result);
      setStep('otp');
      toast.success('OTP sent to your mobile number');
    } catch (err) {
      console.error('Firebase phone auth error:', err);
      setSmsError('SMS is restricted for this region. We recommend using Gmail above or Email sign up!');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-calm-50 flex items-center justify-center p-4">
      <div id="recaptcha-container"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {step === 'form' && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto mb-3 text-xl shadow-soft">
                  <ShieldCheck size={22} />
                </div>
                <h2 className="text-2xl font-bold text-calm-900">Create account</h2>
                <p className="text-calm-500 text-sm mt-1">Join MindMate — your AI wellness & study companion</p>
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
                {googleLoading ? 'Connecting to Google…' : 'Continue with Google (Gmail)'}
              </button>

              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-calm-200 w-full"></div>
                <span className="bg-white px-3 text-xs uppercase tracking-wider text-calm-400 font-medium absolute">
                  or sign up with email
                </span>
              </div>

              {/* Method Switcher */}
              <div className="flex bg-calm-100 p-1 rounded-xl mb-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    authMethod === 'email' ? 'bg-white text-calm-900 shadow-sm font-semibold' : 'text-calm-500 hover:text-calm-700'
                  }`}
                >
                  Gmail / Email
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('mobile')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    authMethod === 'mobile' ? 'bg-white text-calm-900 shadow-sm font-semibold' : 'text-calm-500 hover:text-calm-700'
                  }`}
                >
                  Phone Number
                </button>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <Input
                  label="Full name"
                  placeholder="Alex Rivera"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  leftIcon={<ShieldCheck size={18} className="text-calm-400" />}
                />

                {authMethod === 'email' ? (
                  <Input
                    label="Gmail / Email address"
                    type="email"
                    placeholder="alex@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    leftIcon={<Mail size={18} className="text-calm-400" />}
                  />
                ) : (
                  <Input
                    label="Mobile number"
                    placeholder="+91 9876543210"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    leftIcon={<Phone size={18} className="text-calm-400" />}
                  />
                )}

                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  leftIcon={<Lock size={18} className="text-calm-400" />}
                />

                <Button type="submit" variant="primary" disabled={loading || googleLoading} className="w-full">
                  {loading ? 'Creating account…' : 'Create Account'}
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </form>

              <p className="mt-6 text-center text-calm-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-600 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}

          {step === 'done' && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl mx-auto mb-4 animate-pulse">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-calm-900">You're all set!</h2>
              <p className="text-calm-500 text-sm mt-2">Redirecting to your dashboard…</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
