import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleCallback } from '../lib/auth';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      setError('Missing authorization code');
      return;
    }

    handleCallback(code, state)
      .then(() => navigate('/', { replace: true }))
      .catch((e) => setError(e.message));
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-border p-8 text-center">
          <h1 className="text-lg font-medium mb-2 text-red-400">Authentication Failed</h1>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <a href="/login" className="text-sm text-blue-400 hover:underline">Back to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-sm text-muted-foreground animate-pulse">Authenticating...</p>
    </div>
  );
}
