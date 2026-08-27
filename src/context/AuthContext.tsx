'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import type { Profile, UserRole } from '@/lib/supabase/types';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const { isConfigured } = getSupabaseEnv();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to fetch profile data from Supabase DB
  const fetchUserProfile = useCallback(
    async (authUser: User): Promise<Profile | null> => {
      if (!isConfigured) return null;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (error) {
          console.warn('[AuthProvider] Failed to fetch profile from database:', error.message);
        }

        if (data) {
          return data as Profile;
        }

        // Graceful fallback for new registrations before DB trigger completion
        const fallbackProfile: Profile = {
          id: authUser.id,
          full_name:
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            authUser.email?.split('@')[0] ||
            'Builder',
          username: authUser.email?.split('@')[0] || 'builder',
          email: authUser.email || null,
          avatar_url: authUser.user_metadata?.avatar_url || null,
          bio: null,
          primary_focus: null,
          github_url: null,
          linkedin_url: null,
          portfolio_url: null,
          location: null,
          current_build: null,
          onboarding_completed: false,
          role: (authUser.user_metadata?.role as UserRole) || 'MEMBER',
          created_at: authUser.created_at,
          updated_at: authUser.created_at,
        };

        return fallbackProfile;
      } catch (err) {
        console.error('[AuthProvider] Unexpected error fetching user profile:', err);
        return null;
      }
    },
    [isConfigured]
  );

  // Manual refresh of profile
  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const updatedProfile = await fetchUserProfile(user);
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
  }, [user, fetchUserProfile]);

  // Manual refresh of session
  const refreshSession = useCallback(async () => {
    if (!isConfigured) return;
    try {
      const supabase = createClient();
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const userProfile = await fetchUserProfile(currentUser);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('[AuthProvider] Error refreshing session:', err);
    }
  }, [isConfigured, fetchUserProfile]);

  // Primary Auth Listener & Lifecycle
  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const supabase = createClient();

    // 1. Initial Session Check
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.warn('[AuthProvider] Initial session fetch error:', error.message);
        }

        if (!isMounted) return;

        setSession(initialSession);
        const initialUser = initialSession?.user ?? null;
        setUser(initialUser);

        if (initialUser) {
          const userProfile = await fetchUserProfile(initialUser);
          if (isMounted) {
            setProfile(userProfile);
          }
        } else {
          if (isMounted) {
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('[AuthProvider] Error during initial session check:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // 2. Active Subscription to onAuthStateChange
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMounted) return;

        setSession(newSession);
        const newUser = newSession?.user ?? null;
        setUser(newUser);

        if (newUser) {
          const userProfile = await fetchUserProfile(newUser);
          if (isMounted) {
            setProfile(userProfile);
          }
        } else {
          if (isMounted) {
            setProfile(null);
          }
        }

        if (isMounted) {
          setIsLoading(false);
        }

        // Synchronize Server Components on auth state transition
        if (
          event === 'SIGNED_IN' ||
          event === 'SIGNED_OUT' ||
          event === 'USER_UPDATED' ||
          event === 'PASSWORD_RECOVERY'
        ) {
          router.refresh();
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isConfigured, fetchUserProfile, router]);

  // Sign out flow
  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('[AuthProvider] Sign out error:', err);
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const role: UserRole | null = profile?.role ?? (user?.user_metadata?.role as UserRole) ?? null;
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isSuperAdmin = role === 'SUPER_ADMIN';

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      profile,
      role,
      isAdmin,
      isSuperAdmin,
      isLoading,
      isConfigured,
      signOut,
      refreshProfile,
      refreshSession,
    }),
    [
      user,
      session,
      profile,
      role,
      isAdmin,
      isSuperAdmin,
      isLoading,
      isConfigured,
      signOut,
      refreshProfile,
      refreshSession,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
};
