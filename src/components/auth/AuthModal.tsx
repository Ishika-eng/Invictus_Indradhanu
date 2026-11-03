import React, { useState } from 'react';
import { 
  Phone, 
  ShieldCheck, 
  X, 
  ArrowRight, 
  KeyRound, 
  Loader2, 
  AlertCircle, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../services/supabase';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, sendOtp, verifyOtp } = useAuth();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setStep('phone');
    setPhoneNumber('');
    setOtpCode('');
    setErrorMessage(null);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleaned = phoneNumber.replace(/\s+/g, '');
    if (!cleaned || cleaned.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    const result = await sendOtp(cleaned);
    setIsLoading(false);

    if (result.success) {
      setStep('otp');
    } else {
      setErrorMessage(
        result.error ||
          'Failed to send OTP. If SMS provider is not configured in Supabase yet, verify settings in Supabase Auth.'
      );
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    const result = await verifyOtp(phoneNumber, otpCode);
    setIsLoading(false);

    if (result.success) {
      setStep('success');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } else {
      setErrorMessage(result.error || 'Invalid OTP code. Please try again.');
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
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-agri-600 text-white flex items-center justify-center shadow-soft">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-moss-900 leading-tight">
              Farmer Phone Authentication
            </h3>
            <p className="text-xs text-moss-500">
              {step === 'phone' && 'Enter your mobile number to receive a secure OTP'}
              {step === 'otp' && `Enter 6-digit verification code sent to ${phoneNumber}`}
              {step === 'success' && 'Phone verified successfully!'}
            </p>
          </div>
        </div>

        {/* Supabase Status Hint */}
        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Supabase Setup Notice:</strong> Configure <code className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> & <code className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> with your SMS gateway to send real carrier OTPs.
            </p>
          </div>
        )}

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Step 1: Phone Input Form */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1.5">
                Mobile Number (India)
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
                  maxLength={13}
                  required
                  autoFocus
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-sm font-bold text-moss-900 focus:outline-none focus:border-agri-600 shadow-sm"
                />
              </div>
              <p className="text-[11px] text-moss-500 mt-1">
                A 6-digit verification code will be sent via SMS.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 disabled:opacity-50 text-white font-bold text-sm shadow-soft transition-all active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Requesting OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Input Form */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-1.5">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-moss-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-canvas-100 border border-canvas-300 text-base font-mono font-bold tracking-widest text-moss-900 focus:outline-none focus:border-agri-600 shadow-sm text-center"
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-agri-700 hover:underline"
                >
                  Change phone number
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="text-xs text-moss-500 hover:text-moss-800"
                >
                  Resend code
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 disabled:opacity-50 text-white font-bold text-sm shadow-soft transition-all active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === 'success' && (
          <div className="text-center py-6 space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-agri-100 text-agri-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-display font-extrabold text-lg text-moss-900">
              Authentication Verified!
            </h4>
            <p className="text-xs text-moss-600">
              Syncing your farmer profile and farm plots...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

