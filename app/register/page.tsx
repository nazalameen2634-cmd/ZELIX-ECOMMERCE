'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name || !formData.phone) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, otp: otpString }),
      });

      const data = await res.json();

      if (res.ok) {
        await refreshProfile();
        router.push('/profile');
      } else {
        setError(data.error || 'Failed to verify OTP and create account');
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
        className="w-full max-w-md p-8 md:p-12 relative overflow-hidden"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-[0.2em] mb-4 uppercase">ZELIX</h1>
          <p className="text-zinc-500 text-sm tracking-widest uppercase">
            {step === 'details' ? 'Create an account' : 'Verify your email'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'details' ? (
            <motion.form 
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp} 
              className="space-y-8"
            >
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
                  placeholder="Phone Number"
                  required
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
                  disabled={loading || !formData.email || !formData.password || !formData.name || !formData.phone}
                  className="w-full bg-white text-black py-4 font-medium tracking-widest uppercase text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
              
              <div className="text-center pt-4">
                <Link href="/login" className="text-zinc-500 hover:text-white text-sm tracking-wide transition-colors">
                  Already have an account? <span className="underline underline-offset-4">Sign In</span>
                </Link>
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="otp"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleRegister} 
              className="space-y-8"
            >
              <p className="text-zinc-500 text-sm text-center">
                We sent a 6-digit code to <br />
                <span className="text-white">{formData.email}</span>
              </p>
              
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    disabled={loading}
                    className="w-12 h-14 bg-zinc-900 border border-zinc-800 text-center text-2xl focus:outline-none focus:border-white focus:bg-black transition-colors rounded-lg disabled:opacity-50"
                  />
                ))}
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
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full bg-white text-black py-4 font-medium tracking-widest uppercase text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Verify & Create Account'
                  )}
                </button>
              </div>

              <div className="text-center pt-4">
                <button 
                  type="button" 
                  onClick={() => setStep('details')}
                  className="text-zinc-500 hover:text-white text-sm tracking-wide transition-colors underline underline-offset-4"
                >
                  Back
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
