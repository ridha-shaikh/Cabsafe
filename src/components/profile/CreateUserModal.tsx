import React, { useState, useEffect } from 'react';
import {
  registerWithCognito,
  confirmCognitoSignUp,
  resendCognitoConfirmationCode,
  validateEmail,
  validatePassword,
  parseCognitoError,
} from '../../services/cognitoService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  X,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Mail,
  KeyRound,
  RotateCw,
  ArrowRight,
  Info,
} from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'REGISTER' | 'VERIFY';
  initialEmail?: string;
  onUserCreated?: (email: string) => void;
  onUserConfirmed?: (email: string) => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  initialMode = 'REGISTER',
  initialEmail = '',
  onUserCreated,
  onUserConfirmed,
}: CreateUserModalProps) {
  const [mode, setMode] = useState<'REGISTER' | 'VERIFY' | 'SUCCESS'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      if (initialEmail) {
        setEmail(initialEmail);
      }
      setError(null);
      setInfo(null);
      setCode('');
    }
  }, [isOpen, initialMode, initialEmail]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    // 1. Validation
    if (!validateEmail(email)) {
      setError('Please provide a valid email address (e.g. name@domain.com).');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message || 'Password does not meet requirements.');
      return;
    }

    setLoading(true);

    try {
      await registerWithCognito(email, password, name);
      setMode('VERIFY');
      setInfo(
        `Verification code sent to ${email}. Please check your inbox (including spam folder) and enter the 6-digit code.`
      );
      if (onUserCreated) {
        onUserCreated(email);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const friendlyError = parseCognitoError(err);
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  // Handle Confirmation
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!code.trim()) {
      setError('Please enter the 6-digit confirmation code.');
      return;
    }

    setLoading(true);

    try {
      await confirmCognitoSignUp(email, code);
      setMode('SUCCESS');
      if (onUserConfirmed) {
        onUserConfirmed(email);
      }
    } catch (err: any) {
      console.error('Confirmation error:', err);
      const friendlyError = parseCognitoError(err);
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend Code
  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    if (!validateEmail(email)) {
      setError('Please enter a valid email address before requesting a new code.');
      return;
    }

    setResending(true);
    setError(null);

    try {
      await resendCognitoConfirmationCode(email);
      setInfo(`A fresh verification code has been dispatched to ${email}.`);
      setResendCooldown(30);
    } catch (err: any) {
      console.error('Resend error:', err);
      const friendlyError = parseCognitoError(err);
      setError(friendlyError);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-border">
        {/* Header */}
        <div className="p-6 bg-[#171d24] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
              {mode === 'REGISTER' ? (
                <UserPlus className="w-5 h-5" />
              ) : mode === 'VERIFY' ? (
                <KeyRound className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {mode === 'REGISTER'
                  ? 'Create New User'
                  : mode === 'VERIFY'
                  ? 'Verify Email Address'
                  : 'Account Verified'}
              </h3>
              <p className="text-xs text-white/60">
                {mode === 'REGISTER'
                  ? 'Register a new user account'
                  : mode === 'VERIFY'
                  ? 'Enter the confirmation code sent to your email'
                  : 'Account is ready to sign in'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <div>
                <span>{error}</span>
                {error.includes('already exists') && mode === 'REGISTER' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('VERIFY');
                      setError(null);
                    }}
                    className="block mt-1 font-bold text-red-800 underline hover:text-red-950"
                  >
                    Need to enter or resend verification code? Click here
                  </button>
                )}
              </div>
            </div>
          )}

          {info && (
            <div className="mb-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5 text-blue-700 text-xs">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
              <span>{info}</span>
            </div>
          )}

          {/* MODE 1: REGISTRATION */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="e.g. priya@cabsafe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full text-sm"
                />
                <p className="text-[11px] text-text-secondary mt-1">
                  Must contain 8+ characters, uppercase, lowercase, numbers, and symbols.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 text-sm py-2.5 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 text-sm py-2.5 bg-[#4A7C59] hover:bg-[#386044] text-white rounded-xl font-bold flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    'Registering...'
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Create Account
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('VERIFY');
                    setError(null);
                    setInfo(null);
                  }}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Already have an unconfirmed account? Enter verification code
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: VERIFICATION SCREEN */}
          {mode === 'VERIFY' && (
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                  Email Address to Confirm
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="e.g. user@cabsafe.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full text-sm pl-9"
                  />
                  <Mail className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main uppercase tracking-wider mb-1.5">
                  6-Digit Verification Code
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.trim())}
                  required
                  className="w-full text-center text-xl font-mono tracking-widest font-bold py-3"
                />
                <p className="text-[11px] text-text-secondary mt-1">
                  Check your inbox for an email with your verification code.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resending}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 disabled:opacity-50 disabled:no-underline"
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`}
                  />
                  {resending
                    ? 'Resending...'
                    : resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : 'Resend verification code'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('REGISTER');
                    setError(null);
                    setInfo(null);
                  }}
                  className="text-xs text-text-secondary hover:text-text-main"
                >
                  Back to Register
                </button>
              </div>

              <div className="pt-3 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 text-sm py-2.5 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 text-sm py-2.5 bg-[#4A7C59] hover:bg-[#386044] text-white rounded-xl font-bold flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    'Verifying...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Confirm Account
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* MODE 3: SUCCESS */}
          {mode === 'SUCCESS' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-text-main">
                  Account Verified Successfully!
                </h4>
                <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
                  <span className="font-semibold text-text-main">{email}</span> has been verified. You can now sign in to access the fleet command center.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => {
                  if (onUserConfirmed) {
                    onUserConfirmed(email);
                  }
                  onClose();
                }}
                className="w-full py-3 bg-[#4A7C59] hover:bg-[#386044] text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-2"
              >
                Continue to Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
