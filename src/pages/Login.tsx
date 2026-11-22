import { Users, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, loginWithCredentials } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedCode = totpCode.trim().replace(/[\s-]/g, '');
    if (mfaRequired && (!cleanedCode || (cleanedCode.length !== 6 && cleanedCode.length !== 20))) {
      setError('Please enter your 6-digit authenticator code or recovery code');
      return;
    }

    try {
      setError(null);
      if (mfaRequired) {
        await loginWithCredentials(email, password, totpCode);
      } else {
        await loginWithCredentials(email, password);
      }
      navigate('/', { replace: true });
    } catch (err: any) {
      if (err?.mfaRequired || err?.message === 'MFA_REQUIRED') {
        setMfaRequired(true);
        return;
      }
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full rounded-3xl border border-border bg-card shadow-xl p-6 sm:p-8 text-center flex flex-col items-center">
        <img
          src="/camos.png"
          alt="CAMOS Logo"
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain mb-5 rounded-2xl"
          decoding="async"
        />
        <h1 className="text-xl font-semibold tracking-tight mb-2 text-foreground">
          {mfaRequired ? 'Two-Factor Verification' : 'Admin Login'}
        </h1>
        <p className="text-sm text-muted-foreground mb-7">
          {mfaRequired
            ? 'Enter the 6-digit code from your authenticator app.'
            : 'Enter your credentials to access the admin portal.'}
        </p>

        {error && (
          <div className="w-full mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-3.5">
          {!mfaRequired ? (
            <>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-background border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50 transition-colors"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl bg-background border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50 transition-colors"
              />
              <button
                type="submit"
                className="w-full mt-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-foreground text-background font-medium py-3 px-6 hover:bg-foreground/90 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4" />
                Sign in
              </button>
            </>
          ) : (
            <>
              <div className="text-left space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  6-Digit Authenticator or Recovery Code
                </label>
                <input
                  type="text"
                  maxLength={24}
                  autoFocus
                  placeholder="123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.toUpperCase().replace(/[^0-9A-F-]/g, ''))}
                  required
                  className="w-full rounded-xl bg-background border border-border px-3.5 py-3 text-center text-xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-foreground text-background font-medium py-3 px-6 hover:bg-foreground/90 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5" />
                Verify & Continue
              </button>
              <button
                type="button"
                onClick={() => {
                  setMfaRequired(false);
                  setTotpCode('');
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1 cursor-pointer"
              >
                Back to email & password
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
