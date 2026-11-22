import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToasts((prev) => {
      // Prevent consecutive identical toast spam
      if (prev.length > 0 && prev[prev.length - 1].message === message && prev[prev.length - 1].type === type) {
        return prev;
      }
      const id = `toast-${Date.now()}-${Math.random()}`;
      setTimeout(() => {
        setToasts((curr) => curr.filter((t) => t.id !== id));
      }, 5000);
      return [...prev.slice(-3), { id, message, type }];
    });
  }, []);

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({ showToast, success, error, info }),
    [showToast, success, error, info]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-3 right-3 left-3 sm:left-auto sm:bottom-4 sm:right-4 z-50 flex flex-col gap-2 sm:max-w-md pointer-events-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-md animate-ui-scale ${
              toast.type === 'success'
                ? 'bg-card/95 border-green-500/30 text-green-500'
                : toast.type === 'error'
                ? 'bg-card/95 border-red-500/30 text-red-500'
                : 'bg-card/95 border-blue-500/30 text-blue-500'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
            <span className="text-sm flex-1 text-foreground">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-muted-foreground hover:text-foreground shrink-0 p-1 rounded-lg hover:bg-foreground/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
