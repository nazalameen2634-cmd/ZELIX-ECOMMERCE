'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

function VerifyOtpForm() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [resendCount, setResendCount] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { refreshProfile } = useAuth();

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return; // Only numbers allowed

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Get last char if multiple
    setOtp(newOtp);

    // Auto focus next
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
      // Focus last filled input or next empty
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6 || !email) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        await refreshProfile();
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setError(data.error || 'Invalid OTP');
        setLoading(false);
        // Shake animation state could be added here by triggering a key remount
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resendCount >= 3 || !email) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setResendTimer(60);
        setResendCount((prev) => prev + 1);
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
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
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6"
              >
                <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold tracking-widest uppercase">Verified</h2>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-12">
          <h1 className="text-2xl font-medium tracking-[0.1em] mb-4">VERIFICATION</h1>
          <p className="text-zinc-500 text-sm tracking-wide">
            Enter the 6-digit code sent to<br/>
            <span className="text-white mt-1 block">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-10">
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
                className="w-12 h-14 bg-zinc-900 border border-zinc-800 text-center text-2xl focus:outline-none focus:border-white focus:bg-black transition-colors rounded-lg disabled:opacity-50"
              />
            ))}
          </motion.div>

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
              disabled={loading || isSuccess || otp.join('').length !== 6}
              className="w-full bg-white text-black py-4 font-medium tracking-widest uppercase text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading && !isSuccess ? (
                <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                'Verify'
              )}
            </button>
          </div>

          <div className="text-center text-sm text-zinc-500">
            {resendCount >= 3 ? (
              <span className="text-red-400">Maximum resend attempts reached.</span>
            ) : resendTimer > 0 ? (
              <span>Resend code in {resendTimer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-white hover:underline uppercase tracking-wide text-xs"
              >
                Resend Code
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <VerifyOtpForm />
    </Suspense>
  );
}
