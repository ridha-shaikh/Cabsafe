import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authenticateWithCognito, parseCognitoError } from '../services/cognitoService';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ShieldCheck, ArrowRight, AlertCircle, Lock, CheckCircle2, KeyRound } from 'lucide-react';
import CreateUserModal from '../components/profile/CreateUserModal';

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<'REGISTER' | 'VERIFY'>('REGISTER');
  const [createModalEmail, setCreateModalEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsUnconfirmed(false);
    setSuccessMsg(null);

    try {
      const authResult = await authenticateWithCognito(email, password);
      login(
        authResult.email,
        authResult.idToken,
        authResult.accessToken,
        authResult.name
      );
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      const isNotConfirmed =
        err?.code === 'UserNotConfirmedException' ||
        err?.name === 'UserNotConfirmedException' ||
        err?.message?.includes('not confirmed');

      if (isNotConfirmed) {
        setIsUnconfirmed(true);
      }

      const message = parseCognitoError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background animate-fade-in">
      {/* LEFT SIDE: Deep Immersive Petrol/Navy */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-center items-start p-20 relative overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(135deg, #091221 0%, #113645 50%, #0d4a46 100%)',
        }}
      >
        {/* Abstract Mobility Network SVG overlay */}
        <svg
          className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            </pattern>
            <filter id="glow-sm" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-md" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <path
            d="M-100,500 C200,400 400,600 800,200 C1000,0 1200,300 1500,100"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
          />
          <path
            d="M-100,600 C150,550 300,700 700,400 C900,200 1100,400 1500,200"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />

          <circle
            cx="200"
            cy="460"
            r="1.5"
            fill="#ffffff"
            filter="url(#glow-sm)"
            className="animate-pulse"
            style={{ animationDelay: '100ms' }}
          />
          <circle
            cx="500"
            cy="500"
            r="1.5"
            fill="#ffffff"
            filter="url(#glow-sm)"
            className="animate-pulse-slow"
            style={{ animationDelay: '800ms' }}
          />
          <circle
            cx="950"
            cy="80"
            r="1.5"
            fill="#ffffff"
            filter="url(#glow-sm)"
            className="animate-pulse"
            style={{ animationDelay: '400ms' }}
          />
          <circle
            cx="1300"
            cy="220"
            r="1.5"
            fill="#ffffff"
            filter="url(#glow-sm)"
            className="animate-pulse-slow"
            style={{ animationDelay: '1200ms' }}
          />
          <circle
            cx="450"
            cy="620"
            r="1.5"
            fill="#ffffff"
            filter="url(#glow-sm)"
            className="animate-pulse"
            style={{ animationDelay: '1500ms' }}
          />
          <circle
            cx="850"
            cy="280"
            r="1.5"
            fill="#ffffff"
            filter="url(#glow-sm)"
            className="animate-pulse-slow"
            style={{ animationDelay: '300ms' }}
          />
          <circle
            cx="300"
            cy="530"
            r="2.5"
            fill="#ffffff"
            filter="url(#glow-sm)"
            className="animate-pulse-slow"
            style={{ animationDelay: '250ms' }}
          />
          <circle
            cx="1100"
            cy="180"
            r="2.5"
            fill="#ffffff"
            filter="url(#glow-sm)"
            className="animate-pulse"
            style={{ animationDelay: '900ms' }}
          />
          <circle
            cx="1450"
            cy="120"
            r="2.5"
            fill="#ffffff"
            filter="url(#glow-sm)"
            className="animate-pulse-slow"
            style={{ animationDelay: '100ms' }}
          />
          <circle
            cx="100"
            cy="565"
            r="2.5"
            fill="#ffffff"
            filter="url(#glow-sm)"
            className="animate-pulse"
            style={{ animationDelay: '600ms' }}
          />
          <circle
            cx="1200"
            cy="380"
            r="2.5"
            fill="#ffffff"
            filter="url(#glow-sm)"
            className="animate-pulse-slow"
            style={{ animationDelay: '1100ms' }}
          />
          <circle
            cx="600"
            cy="480"
            r="2.5"
            fill="#ffffff"
            filter="url(#glow-sm)"
            className="animate-pulse"
            style={{ animationDelay: '2000ms' }}
          />
          <circle
            cx="650"
            cy="350"
            r="3.5"
            fill="#ffffff"
            filter="url(#glow-md)"
            className="animate-pulse-slow"
            style={{ animationDelay: '0ms' }}
          />
          <circle
            cx="800"
            cy="200"
            r="4"
            fill="#ffffff"
            filter="url(#glow-md)"
            className="animate-pulse"
            style={{ animationDelay: '700ms' }}
          />
          <circle
            cx="250"
            cy="640"
            r="3.5"
            fill="#ffffff"
            filter="url(#glow-md)"
            className="animate-pulse-slow"
            style={{ animationDelay: '1300ms' }}
          />
          <circle
            cx="700"
            cy="400"
            r="4.5"
            fill="#ffffff"
            filter="url(#glow-md)"
            className="animate-pulse"
            style={{ animationDelay: '450ms' }}
          />
          <circle
            cx="1000"
            cy="300"
            r="3.5"
            fill="#ffffff"
            filter="url(#glow-md)"
            className="animate-pulse-slow"
            style={{ animationDelay: '1600ms' }}
          />
          <circle
            cx="1400"
            cy="280"
            r="3.5"
            fill="#ffffff"
            filter="url(#glow-md)"
            className="animate-pulse"
            style={{ animationDelay: '350ms' }}
          />
        </svg>

        <div className="z-10 text-left max-w-lg w-full">
          <div className="mb-12">
            <div className="h-20 w-40 bg-white rounded-2xl shadow-lg border border-white/20 overflow-hidden flex items-center justify-center">
              <img
                src="/logo.png"
                alt="CabSafe Logo"
                className="w-full h-full object-cover scale-[1.45]"
              />
            </div>
          </div>
          <h1 className="text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Protecting
            <br />
            every
            <br />
            passenger.
          </h1>
          <p className="text-xl text-white/70 leading-relaxed font-medium">
            Safer journeys, every day.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <div className="h-16 w-32 bg-white rounded-xl mx-auto mb-4 overflow-hidden flex items-center justify-center">
              <img
                src="/logo.png"
                alt="CabSafe Logo"
                className="w-full h-full object-cover scale-[1.45]"
              />
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-text-main mb-2 tracking-tight">
            Welcome back
          </h2>
          <p className="text-text-secondary mb-8 font-medium text-lg">
            Sign in to your command center.
          </p>

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm animate-fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1">
                <span>{error}</span>
                {isUnconfirmed && (
                  <button
                    type="button"
                    onClick={() => {
                      setCreateModalEmail(email);
                      setCreateModalMode('VERIFY');
                      setIsCreateOpen(true);
                      setError(null);
                    }}
                    className="mt-2.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Enter Verification Code Now
                  </button>
                )}
              </div>
            </div>
          )}

          <Card className="border border-border/50 shadow-2xl shadow-text-main/5 bg-white">
            <CardContent className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-main uppercase tracking-wide">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. user@cabsafe.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-background border-border focus:ring-primary focus:border-primary py-3 px-4 font-medium transition-shadow hover:shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-main uppercase tracking-wide">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-background border-border focus:ring-primary focus:border-primary py-3 px-4 font-medium transition-shadow hover:shadow-sm"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full py-4 mt-8 text-lg font-bold bg-[#4A7C59] hover:bg-[#386044] text-white shadow-lg shadow-[#4A7C59]/20 transition-all flex justify-center items-center rounded-xl"
                  disabled={loading}
                >
                  {loading ? (
                    'Signing In...'
                  ) : (
                    <span className="flex items-center">
                      Sign In <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalMode('REGISTER');
                    setCreateModalEmail('');
                    setIsCreateOpen(true);
                  }}
                  className="text-xs font-bold text-primary hover:text-primary-dark underline tracking-wide"
                >
                  + Create New Dispatcher Account
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreateModalMode('VERIFY');
                    setCreateModalEmail(email);
                    setIsCreateOpen(true);
                  }}
                  className="text-xs font-semibold text-text-secondary hover:text-text-main hover:underline"
                >
                  Verify Email Code
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateUserModal
        isOpen={isCreateOpen}
        initialMode={createModalMode}
        initialEmail={createModalEmail || email}
        onClose={() => setIsCreateOpen(false)}
        onUserCreated={(newEmail) => {
          setEmail(newEmail);
        }}
        onUserConfirmed={(confirmedEmail) => {
          setEmail(confirmedEmail);
          setSuccessMsg(`Account ${confirmedEmail} verified successfully! Please enter your password to sign in.`);
          setIsCreateOpen(false);
        }}
      />
    </div>
  );
}
