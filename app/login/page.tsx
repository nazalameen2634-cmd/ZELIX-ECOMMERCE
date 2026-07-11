'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('OTP has been sent to your email.');
        // Navigate after a short delay for the toast to be seen
        setTimeout(() => {
          // Pass email via query string to prefill the verify page
          router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setError(data.error || 'Failed to send OTP');
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 md:p-12"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-[0.2em] mb-4">ZELIX</h1>
          <p className="text-zinc-500 text-sm tracking-widest uppercase">Enter your email to continue</p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-8">
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              disabled={loading}
              className="w-full bg-transparent border-b border-zinc-800 pb-4 text-center text-lg focus:outline-none focus:border-white transition-colors placeholder:text-zinc-700 disabled:opacity-50"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-white text-black py-4 font-medium tracking-widest uppercase text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send OTP'
              )}
            </button>
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
