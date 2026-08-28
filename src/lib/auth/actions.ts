'use server';

import { createClient, createServiceClient } from '../supabase/server';
import { SignUpSchema } from './validations';

export interface SignUpActionResult {
  success: boolean;
  error?: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
  user?: {
    id: string;
    email?: string;
  } | null;
}

/**
 * Check if an email is already associated with an account / profile
 */
export async function checkEmailExistsAction(email: string): Promise<{ exists: boolean }> {
  if (!email || !email.includes('@')) {
    return { exists: false };
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const supabase = createClient();
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      return { exists: true };
    }

    return { exists: false };
  } catch {
    return { exists: false };
  }
}

/**
 * Server Action: Sign up new user with pre-registration duplicate checks
 */
export async function signUpAction(formData: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  origin?: string;
}): Promise<SignUpActionResult> {
  // 1. Zod Validation
  const validationResult = SignUpSchema.safeParse({
    fullName: formData.fullName,
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
  });

  if (!validationResult.success) {
    const fieldErrors = validationResult.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors)[0]?.[0] || 'Invalid signup data.';
    return {
      success: false,
      error: firstError,
      fieldErrors,
      code: 'VALIDATION_ERROR',
    };
  }

  const cleanEmail = formData.email.trim().toLowerCase();
  const cleanFullName = formData.fullName.trim();

  try {
    const supabase = createClient();

    // 2. Pre-check if profile already exists with this email
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      return {
        success: false,
        error: 'An account with this email already exists. Please sign in instead.',
        code: 'ACCOUNT_EXISTS',
      };
    }

    // 3. Supabase Auth Sign Up
    const appOrigin = formData.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: formData.password,
      options: {
        data: {
          full_name: cleanFullName,
        },
        emailRedirectTo: `${appOrigin}/auth/callback`,
      },
    });

    if (error) {
      const errMsg = error.message.toLowerCase();
      if (
        errMsg.includes('already registered') ||
        errMsg.includes('already exists') ||
        errMsg.includes('user already')
      ) {
        return {
          success: false,
          error: 'An account with this email already exists. Please sign in instead.',
          code: 'ACCOUNT_EXISTS',
        };
      }

      if (errMsg.includes('password should be')) {
        return {
          success: false,
          error: 'Password does not meet security criteria (min 8 characters, uppercase, number).',
          code: 'WEAK_PASSWORD',
        };
      }

      return {
        success: false,
        error: error.message,
        code: 'AUTH_ERROR',
      };
    }

    // Check if user already existed (Supabase sometimes returns existing user with empty identities)
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return {
        success: false,
        error: 'An account with this email already exists. Please sign in instead.',
        code: 'ACCOUNT_EXISTS',
      };
    }

    return {
      success: true,
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An unexpected authentication error occurred.',
      code: 'INTERNAL_ERROR',
    };
  }
}
