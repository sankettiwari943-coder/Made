import { redirect } from 'next/navigation';
import { createClient } from '../supabase/server';
import { Profile, ProfileWithDetails, UserRole } from '../supabase/types';

/**
 * Get current authenticated user from server session
 */
export async function getUser() {
  const supabase = createClient();
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * Get user profile from public.profiles table
 */
export async function getProfile(userId?: string): Promise<Profile | null> {
  const supabase = createClient();
  let targetId = userId;

  if (!targetId) {
    const user = await getUser();
    if (!user) return null;
    targetId = user.id;
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single();

    if (error || !profile) {
      return null;
    }

    return profile as Profile;
  } catch {
    return null;
  }
}

/**
 * Get profile with relational skills and interests
 */
export async function getProfileWithDetails(userId?: string): Promise<ProfileWithDetails | null> {
  const supabase = createClient();
  let targetId = userId;

  if (!targetId) {
    const user = await getUser();
    if (!user) return null;
    targetId = user.id;
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single();

    if (error || !profile) {
      return null;
    }

    // Fetch skills
    const { data: skillsData } = await supabase
      .from('profile_skills')
      .select('skill')
      .eq('profile_id', targetId);

    // Fetch interests
    const { data: interestsData } = await supabase
      .from('profile_interests')
      .select('interest')
      .eq('profile_id', targetId);

    return {
      ...(profile as Profile),
      skills: (skillsData || []).map((s) => s.skill),
      interests: (interestsData || []).map((i) => i.interest),
    };
  } catch {
    return null;
  }
}

/**
 * Fetch public profile by unique username
 */
export async function getPublicProfileByUsername(username: string): Promise<ProfileWithDetails | null> {
  const supabase = createClient();
  const normalizedUsername = username.trim().toLowerCase();

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, bio, primary_focus, github_url, linkedin_url, portfolio_url, location, current_build, onboarding_completed, role, created_at, updated_at')
      .eq('username', normalizedUsername)
      .single();

    if (error || !profile) {
      return null;
    }

    const targetId = profile.id;

    const { data: skillsData } = await supabase
      .from('profile_skills')
      .select('skill')
      .eq('profile_id', targetId);

    const { data: interestsData } = await supabase
      .from('profile_interests')
      .select('interest')
      .eq('profile_id', targetId);

    return {
      ...(profile as Profile),
      email: null, // Scrub sensitive email from public view
      skills: (skillsData || []).map((s) => s.skill),
      interests: (interestsData || []).map((i) => i.interest),
    };
  } catch {
    return null;
  }
}

/**
 * Require an authenticated user; redirects to /login if unauthenticated
 */
export async function requireUser() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * Require an authenticated user with profile; handles onboarding routing check
 */
export async function requireProfile(options?: { allowIncompleteOnboarding?: boolean }) {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  if (!profile) {
    // If profile row trigger hasn't fired or is delayed, provide fallback
    const fallbackProfile: Profile = {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Builder',
      username: user.email?.split('@')[0] || 'builder',
      email: user.email || null,
      avatar_url: null,
      bio: null,
      primary_focus: null,
      github_url: null,
      linkedin_url: null,
      portfolio_url: null,
      location: null,
      current_build: null,
      onboarding_completed: false,
      role: 'MEMBER' as UserRole,
      created_at: user.created_at,
      updated_at: user.created_at,
    };

    if (!options?.allowIncompleteOnboarding) {
      redirect('/onboarding');
    }
    return fallbackProfile;
  }

  // If user has not completed onboarding and this route requires it, redirect to /onboarding
  if (!options?.allowIncompleteOnboarding && !profile.onboarding_completed) {
    redirect('/onboarding');
  }

  return profile;
}

export const superAdminEmails = [
  'sankettiwari943@gmail.com',
  'apurvadwivedi666@outlook.com',
];

/**
 * Super Admin check:
 * Returns true if profile role is super_admin / SUPER_ADMIN or user is a designated super admin.
 */
export const isSuperAdmin = (profileOrUser: any, optionalProfile?: any): boolean => {
  const profile = optionalProfile || profileOrUser;
  const user = optionalProfile ? profileOrUser : (profileOrUser?.email ? profileOrUser : null);

  const profileRole = profile?.role?.toString().toLowerCase();
  if (profileRole === 'super_admin') return true;
  if (profile?.is_super_admin === true) return true;

  const email = (user?.email || profile?.email)?.toString().toLowerCase();
  if (email && superAdminEmails.includes(email)) return true;

  const appRole = user?.app_metadata?.role?.toString().toLowerCase();
  if (appRole === 'super_admin') return true;

  const userMetaRole = user?.user_metadata?.role?.toString().toLowerCase();
  if (userMetaRole === 'super_admin') return true;

  return false;
};

/**
 * Admin check:
 * Returns true if profile role is admin / ADMIN or super_admin / SUPER_ADMIN.
 */
export const isAdmin = (profileOrUser: any, optionalProfile?: any): boolean => {
  const profile = optionalProfile || profileOrUser;
  const profileRole = profile?.role?.toString().toLowerCase();
  if (profileRole === 'admin' || profileRole === 'super_admin') return true;
  return isSuperAdmin(profileOrUser, optionalProfile);
};


/**
 * Check if current user is an authenticated Super Admin without redirecting.
 * Used by AdminLayout and protective boundaries to determine whether to render
 * the Control Center or the Access Denied technical security screen.
 */
export async function getSuperAdminAuth(): Promise<{
  isSuperAdmin: boolean;
  user: any | null;
  profile: Profile | null;
}> {
  const user = await getUser();
  if (!user) {
    return { isSuperAdmin: false, user: null, profile: null };
  }

  const profile = await getProfile(user.id);
  const authorized = isSuperAdmin(user, profile);

  return {
    isSuperAdmin: authorized,
    user,
    profile,
  };
}

/**
 * Server authorization helper for Admin permissions
 */
export async function requireAdmin(): Promise<Profile> {
  return requireSuperAdmin();
}

/**
 * Server authorization helper for Super Admin permissions.
 * Throws error in Server Actions or redirects unauthenticated visitors to /login.
 */
export async function requireSuperAdmin(): Promise<Profile> {
  const user = await getUser();
  if (!user) {
    redirect('/login?next=/admin');
  }

  const profile = await getProfile(user.id);
  if (!isSuperAdmin(user, profile)) {
    throw new Error('Unauthorized: SUPER_ADMIN role clearance required.');
  }

  return (profile || {
    id: user.id,
    full_name:
      user.user_metadata?.full_name ||
      (user.email?.toLowerCase().includes('apurva')
        ? 'Apurva Diwedi'
        : user.email?.toLowerCase().includes('sanket')
        ? 'Sanket Tiwari'
        : 'Super Admin'),
    username: user.email?.split('@')[0] || 'admin',
    email: user.email,
    role: 'SUPER_ADMIN' as UserRole,
  }) as Profile;
}


