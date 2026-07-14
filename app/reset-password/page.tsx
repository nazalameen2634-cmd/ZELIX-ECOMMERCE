'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

function ResetPasswordForm() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6 || !email || !newPassword) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Invalid OTP or failed to reset password');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 md:p-12 relative overflow-hidden"
      >
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center mb-6"
              >
                <svg className="w-10 h-10 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-xl font-bold tracking-widest uppercase mb-2">Password Reset</h2>
              <p className="text-muted text-sm">Redirecting to login...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-12">
          <h1 className="text-2xl font-medium tracking-[0.1em] mb-4">NEW PASSWORD</h1>
          <p className="text-muted text-sm tracking-wide">
            Enter the 6-digit code sent to<br/>
            <span className="text-foreground mt-1 block">{email}</span>
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-xs tracking-widest text-muted uppercase text-center mb-4">Reset Code</label>
            <motion.div 
              className="flex justify-between gap-2"
              animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading || isSuccess}
                  className="w-12 h-14 bg-card border border-border text-foreground text-center text-2xl focus:outline-none focus:border-foreground focus:bg-background transition-colors rounded-lg disabled:opacity-50"
                />
              ))}
            </motion.div>
          </div>

          <div className="pt-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              required
              disabled={loading || isSuccess}
              className="w-full bg-transparent border-b border-border pb-4 text-center text-lg focus:outline-none focus:border-foreground transition-colors placeholder:text-muted disabled:opacity-50"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-red-500 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || isSuccess || otp.join('').length !== 6 || !newPassword}
              className="w-full bg-foreground text-background py-4 font-medium tracking-widest uppercase text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading && !isSuccess ? (
                <div className="h-5 w-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
