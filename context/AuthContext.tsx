'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setMockUser: (role: 'customer' | 'admin' | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(false);

  // Check if supabase is initialized
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isRealSupabase = url && anon && !url.includes('your-project-id') && !url.includes('placeholder-project');
    if (isRealSupabase) {
      setIsSupabaseAvailable(true);
    } else {
      setIsSupabaseAvailable(false);
      // Setup mock preview profile by default so UI doesn't crash
      setProfile({
        id: 'mock-user-id',
        email: 'guest@zelix.shop',
        full_name: 'Guest User',
        phone: null,
        avatar_url: null,
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('Catch fetching profile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const prof = await fetchProfile(user.id);
    if (prof) setProfile(prof);
  };

  useEffect(() => {
    if (!isSupabaseAvailable) return;

    // Get current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id).then((prof) => {
          setProfile(prof);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          const prof = await fetchProfile(newSession.user.id);
          setProfile(prof);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseAvailable]);

  const signOut = async () => {
    if (isSupabaseAvailable) {
      await supabase.auth.signOut();
    } else {
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  };

  // Allow manual toggling of mock role for preview mode
  const setMockUser = (role: 'customer' | 'admin' | null) => {
    if (isSupabaseAvailable) return; // Ignore if real Supabase is running
    if (role === null) {
      setUser(null);
      setProfile(null);
    } else {
      setUser({
        id: 'mock-user-id',
        email: role === 'admin' ? 'admin@zelix.shop' : 'customer@zelix.shop',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User);
      setProfile({
        id: 'mock-user-id',
        email: role === 'admin' ? 'admin@zelix.shop' : 'customer@zelix.shop',
        full_name: role === 'admin' ? 'Zelix Administrator' : 'Zelix Customer',
        phone: '+91 99999 88888',
        avatar_url: null,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAdmin,
        signOut,
        refreshProfile,
        setMockUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
