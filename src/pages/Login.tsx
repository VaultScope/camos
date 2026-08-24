import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full border border-border bg-foreground/[0.02] p-8 text-center flex flex-col items-center">
        <img src="/camos.png" alt="CAMOS Logo" className="w-32 h-32 object-contain mb-6" />
        <p className="text-sm text-muted-foreground mb-8">
          Restricted Access. Authentication is strictly managed via Authentik SSO. Local passwords are disabled.
        </p>
        
        <Link to="/" className="w-full flex items-center justify-center gap-3 border border-border bg-foreground text-background font-medium py-3 px-6 hover:bg-foreground/90 transition-colors">
          <Users className="w-5 h-5" />
          Login with Authentik (Staff)
        </Link>
        
        <div className="mt-8 pt-8 border-t border-border w-full text-xs text-muted-foreground">
          auth.vaultscope.de
        </div>
      </div>
    </div>
  );
}
