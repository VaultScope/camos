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
    if (mfaRequired && (!totpCode || totpCode.trim().length !== 6)) {
      setError('Please enter your 6-digit authenticator code');
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full border border-border bg-foreground/[0.02] p-8 text-center flex flex-col items-center">
        <img src="/camos.png" alt="CAMOS Logo" className="w-32 h-32 object-contain mb-6" />
        <h1 className="text-xl font-medium mb-2 text-foreground">
          {mfaRequired ? 'Two-Factor Verification' : 'Admin Login'}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {mfaRequired
            ? 'Enter the 6-digit code from your authenticator app.'
            : 'Enter your credentials to access the admin portal.'}
        </p>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          {!mfaRequired ? (
            <>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 border border-border bg-foreground text-background font-medium py-3 px-6 hover:bg-foreground/90 transition-colors cursor-pointer"
              >
                <Users className="w-5 h-5" />
                Sign in
              </button>
            </>
          ) : (
            <>
              <div className="text-left space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  className="w-full bg-background border border-border px-3 py-3 text-center text-xl tracking-widest font-mono focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 border border-border bg-foreground text-background font-medium py-3 px-6 hover:bg-foreground/90 transition-colors cursor-pointer"
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
                className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
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
