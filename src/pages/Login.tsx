import { Users, Shield, Headphones, CreditCard, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, redirectToLogin, devLogin } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      setError(null);
      await redirectToLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize login');
    }
  };

  const handleDevLogin = async (persona: string) => {
    try {
      setError(null);
      await devLogin(persona);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dev login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full border border-border bg-foreground/[0.02] p-8 text-center flex flex-col items-center">
        <img src="/camos.png" alt="CAMOS Logo" className="w-32 h-32 object-contain mb-6" />
        <p className="text-sm text-muted-foreground mb-8">
          Restricted Access. Authentication is strictly managed via Authentik SSO. Local passwords are disabled.
        </p>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 border border-border bg-foreground text-background font-medium py-3 px-6 hover:bg-foreground/90 transition-colors cursor-pointer"
        >
          <Users className="w-5 h-5" />
          Login with Authentik (Staff)
        </button>

        <div className="w-full mt-6 pt-6 border-t border-border">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 text-left font-medium">
            Quick Dev Login (Bypass Authentik)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDevLogin('admin1')}
              className="flex items-center gap-1.5 justify-center p-2 text-xs border border-border hover:bg-foreground/5 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              Owner (admin1)
            </button>
            <button
              onClick={() => handleDevLogin('support1')}
              className="flex items-center gap-1.5 justify-center p-2 text-xs border border-border hover:bg-foreground/5 transition-colors cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5 text-blue-500" />
              Support (support1)
            </button>
            <button
              onClick={() => handleDevLogin('billing1')}
              className="flex items-center gap-1.5 justify-center p-2 text-xs border border-border hover:bg-foreground/5 transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-green-500" />
              Billing (billing1)
            </button>
            <button
              onClick={() => handleDevLogin('tech1')}
              className="flex items-center gap-1.5 justify-center p-2 text-xs border border-border hover:bg-foreground/5 transition-colors cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-purple-500" />
              Tech (tech1)
            </button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border w-full text-xs text-muted-foreground">
          auth.vaultscope.de
        </div>
      </div>
    </div>
  );
}
