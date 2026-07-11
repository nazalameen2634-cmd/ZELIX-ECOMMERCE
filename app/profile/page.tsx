'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // If loading, show a blank or loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, they will be caught by middleware or we can handle it here
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-32 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl mx-auto w-full"
      >
        <div className="mb-12 border-b border-zinc-800 pb-8">
          <h1 className="text-3xl font-serif tracking-[0.1em] uppercase mb-2">My Account</h1>
          <p className="text-zinc-500 text-sm tracking-wide">Manage your ZELIX profile</p>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900/50 p-6 md:p-8 rounded-lg border border-zinc-800 backdrop-blur-sm">
            <h2 className="text-sm font-semibold tracking-widest uppercase text-zinc-400 mb-6">Profile Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs tracking-widest text-zinc-500 uppercase mb-2">Full Name</label>
                <div className="text-lg">{user.name || 'Not provided'}</div>
              </div>

              <div>
                <label className="block text-xs tracking-widest text-zinc-500 uppercase mb-2">Email Address</label>
                <div className="text-lg">{user.email}</div>
              </div>
              
              <div>
                <label className="block text-xs tracking-widest text-zinc-500 uppercase mb-2">Phone Number</label>
                <div className="text-lg">{user.phone || 'Not provided'}</div>
              </div>
              
              <div>
                <label className="block text-xs tracking-widest text-zinc-500 uppercase mb-2">Account Role</label>
                <div className="inline-block px-3 py-1 bg-zinc-800 rounded-full text-xs tracking-widest uppercase">
                  {user.role}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              onClick={signOut}
              className="px-8 py-3 bg-white text-black font-medium tracking-widest uppercase text-sm hover:bg-zinc-200 transition-colors w-full md:w-auto"
            >
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
