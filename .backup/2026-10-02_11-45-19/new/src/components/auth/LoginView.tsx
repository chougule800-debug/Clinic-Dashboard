import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { OWNER_CONTACT_MESSAGE, OWNER_PHONE_RAW } from '../../config/doctorsConfig';
import {
  Stethoscope,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Phone,
  MessageCircle,
  ShieldCheck,
  UserPlus,
  Eye,
  EyeOff,
  User
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, signup, isSupabaseReady } = useClinic();
  const [mode, setMode] = useState<'login' | 'setup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setupName, setSetupName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials.');
    }
    setIsSubmitting(false);
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!setupName.trim()) {
      setError('Please enter the doctor name.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsSubmitting(true);
    const result = await signup(email, password, setupName);
    if (!result.success) {
      setError(result.error || 'Sign up failed.');
    } else {
      setInfo(
        'Owner account created. You can now sign in with your credentials (check email for confirmation if enabled).'
      );
      setMode('login');
    }
    setIsSubmitting(false);
  };

  const waHelpUrl = OWNER_PHONE_RAW
    ? `https://wa.me/91${OWNER_PHONE_RAW}?text=${encodeURIComponent(
        'Hello, I would like to request login credentials for the clinic portal.'
      )}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 flex flex-col justify-center items-center p-4 antialiased text-slate-100 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mx-auto mb-3 shadow-lg shadow-teal-900/50">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
            Clinic Portal
          </h1>
          <p className="text-xs text-teal-200/80 mt-1 font-medium">
            Homeopathy Case Taking &amp; Clinical Management
          </p>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-400" />
              {mode === 'login' ? 'Doctor Sign In' : 'First-Time Setup'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'setup' : 'login');
                setError(null);
                setInfo(null);
              }}
              className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold"
            >
              {mode === 'login' ? 'First-Time Setup' : 'Back to Sign In'}
            </button>
          </div>

          {!isSupabaseReady && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs">
              <strong className="block mb-1">Supabase not configured</strong>
              Set <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
              <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> in your{' '}
              <code className="font-mono">.env</code> file, then restart the dev server.
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs">
              {info}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Login ID / Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="doctor@clinic.com"
                    autoComplete="email"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isSupabaseReady}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSetup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Doctor Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={setupName}
                    onChange={e => setSetupName(e.target.value)}
                    placeholder="Dr. Full Name"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="doctor@clinic.com"
                    autoComplete="email"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password (min 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Choose a strong password"
                    autoComplete="new-password"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isSupabaseReady}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating...' : 'Create Owner Account'}</span>
              </button>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                First-time setup creates the clinic owner account. Only the owner can invite
                additional doctors from the Doctor Profile view.
              </p>
            </form>
          )}

          <div className="pt-3 border-t border-slate-800">
            <div className="p-3 bg-teal-950/60 border border-teal-700/50 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-[11px]">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>New Doctor Account</span>
              </div>
              <p className="text-[11px] text-teal-100/90 leading-relaxed">
                {OWNER_CONTACT_MESSAGE || 'Contact the clinic owner to request credentials.'}
              </p>
              {waHelpUrl && (
                <a
                  href={waHelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Owner</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-500" />
            <span>Multi-doctor isolation &amp; encrypted cloud storage</span>
          </p>
        </div>
      </div>
    </div>
  );
};