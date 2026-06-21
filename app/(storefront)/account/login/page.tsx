'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Key, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AccountLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, setMockUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Check if supabase variables are set
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isRealSupabase = url && anon && !url.includes('your-project-id') && !url.includes('placeholder-project');
    setIsSupabaseAvailable(!!isRealSupabase);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.email === 'admin@zelix.shop') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSupabaseAvailable) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast(error.message.toUpperCase(), 'error');
        } else {
          toast('LOGGED IN SUCCESSFULLY', 'success');
          if (email === 'admin@zelix.shop') {
            router.push('/admin');
          } else {
            router.push('/account');
          }
        }
      } else {
        // Mock Sandbox Login
        if (email === 'admin@zelix.shop') {
          setMockUser('admin');
          toast('ADMIN PANEL PREVIEW ACCESS GRANTED', 'success');
          router.push('/admin');
        } else {
          setMockUser('customer');
          toast('CUSTOMER PREVIEW ACCESS GRANTED', 'success');
          router.push('/account');
        }
      }
    } catch (err) {
      console.warn('Supabase login failure. Falling back to sandbox preview.', err);
      if (email === 'admin@zelix.shop') {
        setMockUser('admin');
        toast('ADMIN PREVIEW ACCESS GRANTED (OFFLINE)', 'success');
        router.push('/admin');
      } else {
        setMockUser('customer');
        toast('CUSTOMER PREVIEW ACCESS GRANTED (OFFLINE)', 'success');
        router.push('/account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSupabaseAvailable) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          toast(error.message.toUpperCase(), 'error');
        } else {
          toast('REGISTRATION SUCCESSFUL. CHECK EMAIL FOR VALIDATION.', 'success');
          setActiveTab('login');
        }
      } else {
        // Mock Sandbox register
        setMockUser('customer');
        toast('MOCK REGISTERED AND LOGGED IN', 'success');
        router.push('/account');
      }
    } catch (err) {
      console.warn('Supabase registration failure. Falling back to sandbox preview.', err);
      setMockUser('customer');
      toast('MOCK REGISTERED AND LOGGED IN (OFFLINE)', 'success');
      router.push('/account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (isSupabaseAvailable) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/account`,
          },
        });
        if (error) toast(error.message.toUpperCase(), 'error');
      } else {
        setMockUser('customer');
        toast('GOOGLE LOGIN SIMULATED IN PREVIEW', 'success');
        router.push('/account');
      }
    } catch (err) {
      console.warn('Supabase OAuth failure. Falling back to sandbox preview.', err);
      setMockUser('customer');
      toast('GOOGLE LOGIN SIMULATED (OFFLINE)', 'success');
      router.push('/account');
    }
  };

  return (
    <div className="bg-black min-h-[80vh] flex items-center justify-center py-16 px-6">
      <div className="w-full max-w-[420px] bg-[rgba(10,10,10,0.85)] glass p-8 rounded-[4px] shadow-[0_24px_80px_rgba(0,0,0,0.85)] border border-[rgba(245,240,235,0.06)]">
        
        {/* Tab Selection */}
        <div className="flex border-b border-white/5 mb-8 relative">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-4 font-mono text-[11px] font-bold tracking-widest uppercase text-center transition-colors cursor-pointer ${
              activeTab === 'login' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-4 font-mono text-[11px] font-bold tracking-widest uppercase text-center transition-colors cursor-pointer ${
              activeTab === 'register' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            SIGN UP
          </button>
          
          {/* Animated active bar */}
          <motion.div
            layoutId="activeAuthTab"
            style={{ width: '50%', left: activeTab === 'login' ? '0%' : '50%' }}
            className="absolute bottom-0 h-[1.5px] bg-[#C9A96E] transition-all duration-300"
          />
        </div>

        {/* Tab Views */}
        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            /* Login view */
            <motion.form
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleLogin}
              className="flex flex-col gap-4"
            >
              <Input
                label="EMAIL ADDRESS"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="ACCOUNT PASSWORD"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              {!isSupabaseAvailable && (
                <p className="text-[10px] font-mono text-neutral-500 uppercase leading-relaxed mt-1">
                  💡 PREVIEW ACTIVE: ENTER <span className="text-white font-bold">admin@zelix.shop</span> TO LOG IN TO THE ADMIN PANEL. ANY OTHER EMAIL LOGS IN AS CUSTOMER.
                </p>
              )}

              <Button type="submit" isLoading={loading} variant="primary" className="w-full mt-4">
                <LogIn size={12} className="mr-1" /> ACCESS ACCOUNT
              </Button>
            </motion.form>
          ) : (
            /* Register view */
            <motion.form
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleRegister}
              className="flex flex-col gap-4"
            >
              <Input
                label="YOUR FULL NAME"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                label="EMAIL ADDRESS"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="CHOOSE PASSWORD"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button type="submit" isLoading={loading} variant="primary" className="w-full mt-4">
                <UserPlus size={12} className="mr-1" /> CREATE PROFILE
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Social Authentication divider */}
        <div className="flex items-center my-6 gap-3">
          <div className="flex-1 h-[1px] bg-white/5" />
          <span className="font-mono text-[9px] text-neutral-600 tracking-wider">OR SYSTEM</span>
          <div className="flex-1 h-[1px] bg-white/5" />
        </div>

        {/* Google OAuth button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-4 border border-white/10 rounded-sm font-mono text-[10px] font-bold tracking-widest text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          AUTHENTICATE WITH GOOGLE
        </button>
      </div>
    </div>
  );
}
