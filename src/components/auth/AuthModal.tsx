import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Phone, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../services/supabase';

type AuthMode = 'signin' | 'signup';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, signInWithEmail, signUpWithEmail } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setMode('signin');
    setEmail('');
    setPassword('');
    setPhoneNumber('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    const result = await signInWithEmail(email, password);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('Successfully signed in! Loading your farm data...');
      setTimeout(() => {
        handleClose();
      }, 1200);
    } else {
      setErrorMessage(result.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide an email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanedPhone || cleanedPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for agricultural alerts.');
      return;
    }

    setIsLoading(true);
    const result = await signUpWithEmail(email, password, `+91${cleanedPhone}`);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(result.message || 'Account created successfully!');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } else {
      setErrorMessage(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-moss-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-canvas rounded-2xl border border-agri-600/30 shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-moss-400 hover:text-moss-700 hover:bg-canvas-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-agri-600 text-white flex items-center justify-center shadow-soft">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-moss-900 leading-tight">
              Farmer Authentication
            </h3>
            <p className="text-xs text-moss-500">
              {mode === 'signin' ? 'Sign in to access your registered farms & advisories' : 'Create a development account for Indradhanu'}
            </p>
          </div>
        </div>

        {/* Development Auth Notice Banner */}
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Development Mode Active:</span> Email & password authentication is enabled. SMS OTP carrier fees are avoided while preserving phone numbers for crop alerts.
          </div>
        </div>

        {/* Supabase Unconfigured Warning */}
        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Supabase Notice:</strong> Check that <code className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> are configured.
            </p>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center bg-canvas-200 p-1 rounded-xl mb-4 text-xs font-bold text-moss-700">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-white text-agri-900 shadow-sm'
                : 'text-moss-600 hover:text-moss-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(null); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-agri-900 shadow-sm'
                : 'text-moss-600 hover:text-moss-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="flex-1">{errorMessage}</p>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-agri-50 border border-agri-200 text-agri-900 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-agri-600 shrink-0 mt-0.5" />
            <p className="flex-1 font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Sign In Form */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-moss-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-sm font-semibold text-moss-900 focus:outline-none focus:border-agri-600 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-moss-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-sm font-semibold text-moss-900 focus:outline-none focus:border-agri-600 shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 disabled:opacity-50 text-white font-bold text-sm shadow-soft transition-all active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Create Account Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-moss-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-sm font-semibold text-moss-900 focus:outline-none focus:border-agri-600 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                Password * (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-moss-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-sm font-semibold text-moss-900 focus:outline-none focus:border-agri-600 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1">
                Contact Mobile Number *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-moss-600 font-mono">
                  +91
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="98765 43210"
                  maxLength={10}
                  required
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-sm font-bold text-moss-900 focus:outline-none focus:border-agri-600 shadow-sm"
                />
              </div>
              <p className="text-[11px] text-moss-500 mt-1">
                Used for localized climate advisories via SMS, Voice IVR and WhatsApp.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 disabled:opacity-50 text-white font-bold text-sm shadow-soft transition-all active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
