import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number; // ms — 0 = permanent until dismissed
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exiting, setExiting] = useState<Set<string>>(new Set());

  const dismiss = useCallback((id: string) => {
    setExiting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300); // match CSS transition duration
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration = 4000) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const success = useCallback(
    (message: string, duration?: number) => toast(message, 'success', duration),
    [toast],
  );
  const error = useCallback(
    (message: string, duration?: number) => toast(message, 'error', duration ?? 6000),
    [toast],
  );
  const info = useCallback(
    (message: string, duration?: number) => toast(message, 'info', duration),
    [toast],
  );
  const warning = useCallback(
    (message: string, duration?: number) => toast(message, 'warning', duration),
    [toast],
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <Toaster toasts={toasts} exiting={exiting} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ─── Variant config ───────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<
  ToastVariant,
  { container: string; icon: React.ReactNode; bar: string }
> = {
  success: {
    container:
      'bg-emerald-950/90 border-emerald-500/40 text-emerald-100',
    icon: <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />,
    bar: 'bg-emerald-500',
  },
  error: {
    container:
      'bg-red-950/90 border-red-500/40 text-red-100',
    icon: <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />,
    bar: 'bg-red-500',
  },
  info: {
    container:
      'bg-blue-950/90 border-blue-500/40 text-blue-100',
    icon: <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />,
    bar: 'bg-blue-500',
  },
  warning: {
    container:
      'bg-amber-950/90 border-amber-500/40 text-amber-100',
    icon: <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />,
    bar: 'bg-amber-500',
  },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastItem({
  toast,
  exiting,
  onDismiss,
}: {
  toast: Toast;
  exiting: boolean;
  onDismiss: (id: string) => void;
}) {
  const styles = VARIANT_STYLES[toast.variant];
  const [progress, setProgress] = useState(100);
  const startRef = useRef<number>(Date.now());
  const frameRef = useRef<number>(0);
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    if (!duration) return;
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [duration]);

  return (
    <div
      className={[
        'relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md',
        'w-full max-w-sm overflow-hidden',
        'transition-all duration-300 ease-out',
        exiting
          ? 'opacity-0 translate-x-6 scale-95'
          : 'opacity-100 translate-x-0 scale-100',
        styles.container,
      ].join(' ')}
    >
      {/* Icon */}
      {styles.icon}

      {/* Message */}
      <p className="flex-1 text-sm font-medium leading-snug pt-px">{toast.message}</p>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="opacity-50 hover:opacity-100 transition-opacity ml-1 shrink-0 mt-0.5"
        aria-label="Fechar notificação"
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      {!!duration && (
        <div
          className={`absolute bottom-0 left-0 h-0.5 rounded-full transition-none ${styles.bar}`}
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
}

// ─── Toaster (renders all toasts) ────────────────────────────────────────────

function Toaster({
  toasts,
  exiting,
  onDismiss,
}: {
  toasts: Toast[];
  exiting: Set<string>;
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} exiting={exiting.has(t.id)} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
