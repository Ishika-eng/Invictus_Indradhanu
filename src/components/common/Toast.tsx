import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'warning' | 'info';
  onClose: () => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  durationMs = 4000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  const config = {
    success: {
      bg: 'bg-agri-900 text-white border-agri-500/40',
      icon: CheckCircle2,
      iconColor: 'text-agri-300',
    },
    warning: {
      bg: 'bg-amber-950 text-white border-amber-500/40',
      icon: AlertTriangle,
      iconColor: 'text-amber-300',
    },
    info: {
      bg: 'bg-moss-900 text-white border-moss-700',
      icon: Info,
      iconColor: 'text-skyalt-300',
    }
  }[type];

  const Icon = config.icon;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-soft-lg backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${config.bg}`}>
      <Icon className={`w-5 h-5 ${config.iconColor} shrink-0`} />
      <span className="text-xs font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/10 text-canvas-300 hover:text-white transition-colors ml-2"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
