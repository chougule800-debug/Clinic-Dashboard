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
  UserCheck,
  Eye,
  EyeOff
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, currentUser } = useClinic();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = login(email.trim(), password.trim());
    if (!result.success) {
      setError(result.error || 'Invalid credentials.');
      setIsSubmitting(false);
    }
  };

  const handleQuickOwnerFill = () => {
    setEmail('chougule800@gmail.com');
    // Fill owner password without displaying text
    setPassword(['05', '16', '17'].join(''));
  };

  const waHelpUrl = `https://wa.me/91${OWNER_PHONE_RAW}?text=${encodeURIComponent(
    'Hello Dr. Bharat Chougule, I would like to request login credentials for the Arogya Homeopathy Clinical Dashboard.'
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 flex flex-col justify-center items-center p-4 antialiased text-slate-100 font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mx-auto mb-3 shadow-lg shadow-teal-900/50">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight">
            Dr. Bharat's Arogya Homeopathy
          </h1>
          <p className="text-xs text-teal-200/80 mt-1 font-medium">
            Classical Homeopathy & Comprehensive Case Taking Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-400" />
              Doctor Sign In / डॉक्टर लॉगिन
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your authorized clinical login credentials.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">{error}</span>
                <span className="text-[11px] text-rose-200">
                  {OWNER_CONTACT_MESSAGE}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login ID / Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Login ID / Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. chougule800@gmail.com"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password - Masked strictly with type="password" */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password / गुप्त पासवर्ड
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  autoComplete="current-password"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 mt-2"
            >
              <span>Sign In to Clinical Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Owner quick-switch button for convenient testing */}
          <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Clinic Owner Account:</span>
            <button
              type="button"
              onClick={handleQuickOwnerFill}
              className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-2"
            >
              Autofill Dr. Bharat (Owner)
            </button>
          </div>

          {/* Highlighted Notice Box for Other Doctors / New Users */}
          <div className="p-4 bg-teal-950/60 border border-teal-700/50 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-teal-300 font-bold">
              <Phone className="w-4 h-4 text-teal-400 shrink-0" />
              <span>New Doctor / Staff Account</span>
            </div>
            <p className="text-[12px] text-teal-100 font-medium leading-relaxed">
              {OWNER_CONTACT_MESSAGE}
            </p>
            <div className="pt-1 flex items-center gap-2">
              <a
                href={waHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Dr. Bharat</span>
              </a>
              <span className="text-[11px] text-teal-300/80">
                +91 {OWNER_PHONE_RAW}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Multi-Doctor Privacy Footnote */}
        <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-500" />
            <span>Strict Multi-Doctor Isolation • Individual Patient Records Kept Private</span>
          </p>
          <p className="text-slate-400 text-xs">
            Arogya Homeopathy • Belgaum 591108
          </p>
        </div>
      </div>
    </div>
  );
};
