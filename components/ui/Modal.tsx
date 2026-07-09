'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  theme?: 'light' | 'dark';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  theme = 'dark',
}: ModalProps) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    full: 'max-w-[90vw]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${maxWidthClasses[maxWidth]} ${theme === 'light' ? 'bg-[#FFFFFF] border-[rgba(0,0,0,0.06)] shadow-lg' : 'bg-neutral-950 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'} border rounded-sm z-10 overflow-hidden flex flex-col`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b ${theme === 'light' ? 'border-[rgba(0,0,0,0.06)]' : 'border-white/5'}`}>
              {title ? (
                <h3 className={`font-mono text-[11px] font-extrabold uppercase tracking-widest ${theme === 'light' ? 'text-[#111111]' : 'text-neutral-300'}`}>
                  {title}
                </h3>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className={`${theme === 'light' ? 'text-neutral-500 hover:text-black' : 'text-neutral-400 hover:text-white'} transition-colors cursor-pointer`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 px-6 py-6 overflow-y-auto max-h-[80vh] hide-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
