'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('If an account exists, a reset code has been sent.');
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setError(data.error || 'Failed to request password reset');
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 md:p-12"
      >
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold tracking-[0.1em] mb-4 uppercase">Reset Password</h1>
          <p className="text-muted text-sm tracking-wide">Enter your email to receive a reset code</p>
        </div>

        <form onSubmit={handleSendResetOtp} className="space-y-8">
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              disabled={loading}
              className="w-full bg-transparent border-b border-border pb-4 text-center text-lg focus:outline-none focus:border-foreground transition-colors placeholder:text-muted disabled:opacity-50"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-foreground text-background py-4 font-medium tracking-widest uppercase text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send Reset Code'
              )}
            </button>
          </div>
          
          <div className="text-center pt-4">
            <Link href="/login" className="text-muted hover:text-foreground text-sm tracking-wide transition-colors">
              Remembered your password? <span className="underline underline-offset-4">Sign In</span>
            </Link>
          </div>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-center text-green-400 text-sm tracking-wide"
            >
              {message}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-center text-red-500 text-sm tracking-wide"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
