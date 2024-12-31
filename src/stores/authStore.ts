import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { checkAdminStatus } from '../lib/auth';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
  signIn: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  loading: false,
  error: null,
  signUp: async (email: string, password: string, isAdmin = false) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      set({ user: data.user, isAdmin: checkAdminStatus(data.user), loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign up',
        loading: false 
      });
    }
  },
  signIn: async (email: string, password: string, isAdmin = false) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const isAdminUser = checkAdminStatus(data.user);
      set({ user: data.user, isAdmin: isAdminUser, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign in',
        loading: false 
      });
    }
  },
  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isAdmin: false, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign out',
        loading: false 
      });
    }
  }
}));