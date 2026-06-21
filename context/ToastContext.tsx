'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast List Container */}
      <div className="fixed top-6 right-6 z-[2000] flex flex-col gap-3 w-full max-w-[360px] pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem
              key={t.id}
              id={t.id}
              message={t.message}
              type={t.type}
              onClose={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Individual Toast Item Component
function ToastItem({
  id,
  message,
  type,
  onClose,
}: Toast & { onClose: (id: string) => void }) {
  const duration = 3000; // 3 seconds

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle className="text-green-500 w-4 h-4 shrink-0" />,
    error: <AlertCircle className="text-red-500 w-4 h-4 shrink-0" />,
    info: <Info className="text-neutral-400 w-4 h-4 shrink-0" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative pointer-events-auto w-full bg-neutral-950 border border-white/10 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
    >
      {/* Content */}
      <div className="flex items-start gap-3 p-4 pr-10">
        {icons[type]}
        <div className="flex-1 text-[11px] font-mono font-semibold tracking-wider uppercase leading-relaxed text-neutral-200">
          {message}
        </div>
        {/* Close Button */}
        <button
          onClick={() => onClose(id)}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Shrinking progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-[2px] ${
          type === 'success'
            ? 'bg-green-500'
            : type === 'error'
            ? 'bg-red-500'
            : 'bg-white/40'
        }`}
      />
    </motion.div>
  );
}
