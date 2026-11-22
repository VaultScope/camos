import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-background text-foreground flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-card shadow-lg p-6 sm:p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h1 className="text-xl font-medium mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-5">
              The application encountered an unexpected error. Please refresh the page to continue.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left mb-5">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Error details
                </summary>
                <pre className="mt-2 text-[10px] bg-foreground/5 p-3 rounded-xl overflow-auto max-h-40 border border-border">
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
