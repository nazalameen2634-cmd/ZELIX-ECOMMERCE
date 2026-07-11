'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, signOut, refreshProfile } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // If loading, show a blank or loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, they will be caught by middleware or we can handle it here
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Profile updated successfully.');
        setIsEditing(false);
        await refreshProfile(); // Refresh AuthContext
      } else {
        setError(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black px-4 pt-32 pb-16 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl mx-auto w-full"
      >
        <div className="mb-12 border-b border-gray-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif tracking-[0.1em] uppercase mb-2">My Account</h1>
            <p className="text-gray-500 text-sm tracking-wide">Manage your ZELIX profile</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/products" className="text-xs tracking-widest uppercase font-semibold text-gray-500 hover:text-black transition-colors underline underline-offset-4">
              Continue Shopping
            </Link>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs tracking-widest uppercase font-semibold text-gray-500 hover:text-black transition-colors underline underline-offset-4"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-6">Profile Details</h2>
            
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 text-sm text-red-500">
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 text-sm text-green-600">
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {!isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2">Full Name</label>
                  <div className="text-lg font-medium">{user.name || 'Not provided'}</div>
                </div>

                <div>
                  <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2">Email Address</label>
                  <div className="text-lg font-medium">{user.email}</div>
                </div>
                
                <div>
                  <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2">Phone Number</label>
                  <div className="text-lg font-medium">{user.phone || 'Not provided'}</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={saving}
                    className="w-full border-b border-gray-300 pb-2 text-lg focus:outline-none focus:border-black transition-colors bg-transparent disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2">Email Address</label>
                  <input
                    type="text"
                    value={user.email}
                    disabled
                    className="w-full border-b border-gray-200 pb-2 text-lg text-gray-400 bg-transparent cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-2">Email cannot be changed.</p>
                </div>
                
                <div>
                  <label className="block text-xs tracking-widest text-gray-400 uppercase mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={saving}
                    className="w-full border-b border-gray-300 pb-2 text-lg focus:outline-none focus:border-black transition-colors bg-transparent disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving || !name}
                    className="px-8 py-3 bg-black text-white font-semibold tracking-widest uppercase text-xs hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {saving ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name || '');
                      setPhone(user.phone || '');
                      setError('');
                      setSuccess('');
                    }}
                    disabled={saving}
                    className="px-8 py-3 bg-white text-black border border-gray-300 font-semibold tracking-widest uppercase text-xs hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {!isEditing && (
            <div className="pt-8">
              <button
                onClick={signOut}
                className="px-8 py-3 bg-white border border-gray-300 text-black font-semibold tracking-widest uppercase text-xs hover:bg-gray-50 transition-colors w-full md:w-auto"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
