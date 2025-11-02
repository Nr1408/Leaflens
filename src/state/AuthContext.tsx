import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, getEmailByUsername } from '../services/supabaseClient';
import { Linking } from 'react-native';
import Constants from 'expo-constants';

type User = { username: string; email: string } | null;
type RegisterResult = { ok: true } | { ok: false; code: string; message?: string };
type LoginResult =
  | { ok: true }
  | { ok: false; code: 'unverified_email' | 'invalid_credentials' | 'not_found' | 'unknown'; message?: string; email?: string };
type AuthContextType = {
  user: User;
  login: (identifier: string, password: string) => Promise<LoginResult>; // identifier = username or email
  register: (username: string, email: string, password: string) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  resendVerification: (email: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  resetPassword: (identifierOrEmail: string) => Promise<{ ok: boolean; message?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// All auth state is handled by Supabase; no local SecureStore user db.

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    // One-time deep cleanup of any legacy/local auth keys and stray Supabase auth tokens
    (async () => {
      try {
        const markerKey = 'leaflens_local_auth_cleared_v2';
        const already = await AsyncStorage.getItem(markerKey);
        if (!already) {
          const keys = (await AsyncStorage.getAllKeys()) || [];
          const toRemove = keys.filter(k =>
            /^leaflens_/i.test(k) || // our old keys
            /^sb-.*-auth-token/i.test(k) || // supabase v2 auth token keys
            /^supabase/i.test(k) // any other supabase-prefixed keys
          );
          if (toRemove.length) {
            await AsyncStorage.multiRemove(toRemove);
            console.log('[LeafLens] Cleared local auth keys:', toRemove);
          }
          await AsyncStorage.setItem(markerKey, '1');
        }
      } catch {}
    })();

    // Subscribe to Supabase auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Debug: log which Supabase project we're talking to (once)
      try {
        // URL like https://<ref>.supabase.co
        // We only log the ref to avoid leaking full URL accidentally.
        // eslint-disable-next-line no-console
        const url = (supabase as any)?.supabaseUrl || 'unknown';
        const ref = typeof url === 'string' && url.includes('https://') ? url.replace('https://','').split('.')[0] : 'unknown';
        console.log('[LeafLens][Supabase] project ref:', ref);
      } catch {}
      if (session?.user) {
        const derivedUsername = (session.user.user_metadata as any)?.username
          || session.user.email?.split('@')[0]
          || 'user';
        const mail = session.user.email || '';
        setUser({ username: derivedUsername, email: mail });
      } else {
        setUser(null);
      }
    });
    // Handle OAuth deep links to finalize PKCE flow
    const handleUrl = async (url?: string | null) => {
      if (!url) return;
      try {
        const { error } = await (supabase.auth as any).exchangeCodeForSession(url);
        if (error) console.warn('[LeafLens][Supabase] exchangeCodeForSession error:', error.message);
      } catch (e: any) {
        // ignore
      }
    };
    const linkingHandler = ({ url }: { url: string }) => { handleUrl(url); };
    const subscription = Linking.addEventListener('url', linkingHandler as any);
    // Also check if app was opened from a deep link
    Linking.getInitialURL().then(handleUrl);
    return () => { sub.subscription.unsubscribe(); (subscription as any)?.remove?.(); };
  }, []);

  // Legacy storage helpers removed now that Supabase is the source of truth.

  const login = async (identifier: string, password: string): Promise<LoginResult> => {
    const id = identifier.trim();
    let email = id;
    if (!id.includes('@')) {
      const resolved = await getEmailByUsername(id);
      if (!resolved) {
        return { ok: false, code: 'not_found', message: 'Username not found' };
      }
      email = resolved;
    }
    const { error, data } = await supabase.auth.signInWithPassword({ email: email.toLowerCase(), password });
    if (error) {
      const msg = (error as any)?.message?.toLowerCase?.() || '';
      let code: 'unverified_email' | 'invalid_credentials' | 'not_found' | 'unknown';
      if (/confirm|verify/.test(msg)) code = 'unverified_email';
      else if (/invalid|credential|password/.test(msg)) code = 'invalid_credentials';
      else code = 'unknown';
      return { ok: false, code, message: (error as any)?.message, email };
    }
    // user state will be set via onAuthStateChange
    return { ok: true };
  };

  const register = async (username: string, email: string, password: string): Promise<RegisterResult> => {
    const uname = username.trim();
    const mail = email.trim().toLowerCase();
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: mail,
      password,
      options: {
        data: { username: uname },
      },
    });
    if (error || !data.user) {
      const code = (error as any)?.status === 422 || /already/i.test((error as any)?.message || '') ? 'auth_email_exists' : 'auth_error';
      return { ok: false, code, message: (error as any)?.message };
    }
    // onAuthStateChange will populate user
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const resendVerification = async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      console.warn('[LeafLens][Supabase] resend verification error:', error.message);
      return false;
    }
    return true;
  };

  // Google OAuth sign-in using PKCE flow and app deep link
  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const scheme = (Constants.expoConfig as any)?.scheme || (Constants.manifest as any)?.scheme;
      const redirectTo = scheme ? `${scheme}:///auth/callback` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
        flowType: 'pkce',
      } as any);
      if (error) {
        console.warn('[LeafLens][Supabase] Google OAuth error:', error.message);
        return false;
      }
      // On native, this opens the system browser; session will be set via onAuthStateChange when returning.
      return true;
    } catch (e: any) {
      console.warn('[LeafLens] Google OAuth exception:', e?.message || String(e));
      return false;
    }
  };

  // Forgot-password: resolve username to email (if needed) and send reset link
  const resetPassword = async (identifierOrEmail: string): Promise<{ ok: boolean; message?: string }> => {
    try {
      let email = (identifierOrEmail || '').trim();
      if (!email) return { ok: false, message: 'Please enter your email or username first.' };
      if (!email.includes('@')) {
        const resolved = await getEmailByUsername(email);
        if (!resolved) return { ok: false, message: 'Username not found' };
        email = resolved;
      }
      const scheme = (Constants.expoConfig as any)?.scheme || (Constants.manifest as any)?.scheme;
      const redirectTo = scheme ? `${scheme}:///reset-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), { redirectTo });
      if (error) return { ok: false, message: error.message };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, message: e?.message || 'Failed to start password reset' };
    }
  };

  const value = useMemo(() => ({ user, login, register, logout, resendVerification, signInWithGoogle, resetPassword }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
