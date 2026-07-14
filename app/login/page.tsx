'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        await refreshProfile();
        router.push('/profile');
      } else {
        setError(data.error || 'Failed to login');
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
          <h1 className="text-3xl font-bold tracking-[0.2em] mb-4 uppercase">ZELIX</h1>
          <p className="text-muted text-sm tracking-widest uppercase">Sign In to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              disabled={loading}
              className="w-full bg-transparent border-b border-border pb-4 text-center text-lg focus:outline-none focus:border-foreground transition-colors placeholder:text-muted disabled:opacity-50"
            />
            
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={loading}
                className="w-full bg-transparent border-b border-border pb-4 text-center text-lg focus:outline-none focus:border-foreground transition-colors placeholder:text-muted disabled:opacity-50"
              />
              <div className="text-right mt-3">
                <Link href="/forgot-password" className="text-muted hover:text-foreground text-xs tracking-wide transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-red-500 text-sm tracking-wide"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-foreground text-background py-4 font-medium tracking-widest uppercase text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </div>
          
          <div className="text-center pt-4">
            <Link href="/register" className="text-muted hover:text-foreground text-sm tracking-wide transition-colors">
              Don't have an account? <span className="underline underline-offset-4">Create one</span>
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
