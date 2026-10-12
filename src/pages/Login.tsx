import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, loginWithCredentials } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await loginWithCredentials(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full border border-border bg-foreground/[0.02] p-8 text-center flex flex-col items-center">
        <img src="/camos.png" alt="CAMOS Logo" className="w-32 h-32 object-contain mb-6" />
        <h1 className="text-xl font-medium mb-2 text-foreground">Admin Login</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Enter your credentials to access the admin portal.
        </p>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
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
        </form>
      </div>
    </div>
  );
}
