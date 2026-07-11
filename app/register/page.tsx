'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        await refreshProfile();
        router.push('/profile');
      } else {
        setError(data.error || 'Failed to create account');
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 md:p-12"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-[0.2em] mb-4 uppercase">ZELIX</h1>
          <p className="text-zinc-500 text-sm tracking-widest uppercase">Create an account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-8">
          <div className="space-y-6">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              disabled={loading}
              className="w-full bg-transparent border-b border-zinc-800 pb-4 text-center text-lg focus:outline-none focus:border-white transition-colors placeholder:text-zinc-700 disabled:opacity-50"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              disabled={loading}
              className="w-full bg-transparent border-b border-zinc-800 pb-4 text-center text-lg focus:outline-none focus:border-white transition-colors placeholder:text-zinc-700 disabled:opacity-50"
            />

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number (Optional)"
              disabled={loading}
              className="w-full bg-transparent border-b border-zinc-800 pb-4 text-center text-lg focus:outline-none focus:border-white transition-colors placeholder:text-zinc-700 disabled:opacity-50"
            />
            
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              disabled={loading}
              className="w-full bg-transparent border-b border-zinc-800 pb-4 text-center text-lg focus:outline-none focus:border-white transition-colors placeholder:text-zinc-700 disabled:opacity-50"
            />
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
              disabled={loading || !formData.email || !formData.password || !formData.name}
              className="w-full bg-white text-black py-4 font-medium tracking-widest uppercase text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                'Register'
              )}
            </button>
          </div>
          
          <div className="text-center pt-4">
            <Link href="/login" className="text-zinc-500 hover:text-white text-sm tracking-wide transition-colors">
              Already have an account? <span className="underline underline-offset-4">Sign In</span>
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
