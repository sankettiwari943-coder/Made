'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { OnboardingSchema, UsernameRegex } from '@/lib/auth/validations';
import { Container } from '@/components/layout/Container';
import { Logo } from '@/components/brand/Logo';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

const DISCIPLINES = [
  'Engineering',
  'AI / ML',
  'Design',
  'Cybersecurity',
  'Web & Cloud',
  'Mobile',
  'Systems & Compilers',
  'Research',
  'Other',
];

const PRESET_SKILLS = [
  'TypeScript', 'Python', 'Rust', 'C++', 'Go', 'PyTorch', 'Next.js', 'PostgreSQL', 'Linux', 'Docker', 'WebAssembly', 'Figma'
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isConfigured } = getSupabaseEnv();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [primaryFocus, setPrimaryFocus] = useState('Engineering');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>(['TypeScript', 'Next.js']);
  const [skillInput, setSkillInput] = useState('');
  const [interests, setInterests] = useState<string[]>(['Distributed Systems', 'Open Source']);
  const [interestInput, setInterestInput] = useState('');

  const [currentBuild, setCurrentBuild] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check auth session & existing profile state
  useEffect(() => {
    if (!isConfigured) {
      setInitialLoading(false);
      return;
    }

    const loadSession = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?next=/onboarding');
        return;
      }

      setUserId(user.id);

      // Check if profile exists and if onboarding was already completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (profile.onboarding_completed) {
          router.push('/dashboard');
          return;
        }

        if (profile.full_name) setFullName(profile.full_name);
        if (profile.username) setUsername(profile.username);
        if (profile.bio) setBio(profile.bio);
        if (profile.primary_focus) setPrimaryFocus(profile.primary_focus);
        if (profile.location) setLocation(profile.location);
        if (profile.current_build) setCurrentBuild(profile.current_build);
        if (profile.avatar_url) setAvatarPreview(profile.avatar_url);
      } else {
        const metaName = user.user_metadata?.full_name || '';
        if (metaName) setFullName(metaName);
        const emailPrefix = user.email?.split('@')[0] || '';
        if (emailPrefix) {
          const sanitized = emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20);
          setUsername(sanitized);
        }
      }

      setInitialLoading(false);
    };

    loadSession();
  }, [isConfigured, router]);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  if (initialLoading) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="technical-label">INITIALIZING WORKSPACE SESSION...</span>
      </div>
    );
  }

  // Handle avatar file selection & validation
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: 'Image size exceeds 2MB limit.' }));
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, avatar: 'Only JPG, PNG, WEBP, and GIF images are supported.' }));
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.avatar;
      return next;
    });
  };

  // Skill & Interest tags management
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const addInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setInterestInput('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setInterests(interests.filter((i) => i !== interestToRemove));
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const fieldErrors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      fieldErrors.fullName = 'Full name must be at least 2 characters.';
    }
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !UsernameRegex.test(cleanUsername)) {
      fieldErrors.username = 'Username must be 3-24 characters (lowercase letters, numbers, and underscores only).';
    }
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const fieldErrors: Record<string, string> = {};
    if (!primaryFocus) {
      fieldErrors.primaryFocus = 'Please select your primary focus.';
    }
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  // Step Navigation
  const handleNext = () => {
    setGeneralError(null);
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    setGeneralError(null);
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  // Complete Onboarding Submission
  const handleComplete = async () => {
    setGeneralError(null);
    setIsSubmitting(true);
    const supabase = createClient();

    const normalizedUsername = username.trim().toLowerCase();

    // Final schema validation
    const payload = {
      fullName: fullName.trim(),
      username: normalizedUsername,
      bio: bio.trim(),
      primaryFocus,
      location: location.trim(),
      currentBuild: currentBuild.trim(),
      skills,
      interests,
      githubUrl: githubUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      portfolioUrl: portfolioUrl.trim() || undefined,
    };

    const validationResult = OnboardingSchema.safeParse(payload);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      let finalAvatarUrl = avatarPreview;

      // 1. Upload Avatar if selected
      if (avatarFile && userId) {
        const fileExt = avatarFile.name.split('.').pop() || 'png';
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `user-avatars/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          finalAvatarUrl = publicUrl;
        } else {
          console.error('Avatar upload error:', uploadError);
        }
      }

      // 2. Check Username Uniqueness on database
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', normalizedUsername)
        .neq('id', userId || '')
        .maybeSingle();

      if (existingUser) {
        setStep(1);
        setErrors({ username: 'This username is already taken. Please choose another.' });
        setIsSubmitting(false);
        return;
      }

      // 3. Upsert Profile Record
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId || '',
          full_name: payload.fullName,
          username: payload.username,
          bio: payload.bio || null,
          primary_focus: payload.primaryFocus,
          location: payload.location || null,
          current_build: payload.currentBuild || null,
          github_url: payload.githubUrl || null,
          linkedin_url: payload.linkedinUrl || null,
          portfolio_url: payload.portfolioUrl || null,
          avatar_url: finalAvatarUrl,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        setGeneralError(`Database error: ${profileError.message}`);
        setIsSubmitting(false);
        return;
      }

      // 4. Sync Skills
      if (userId && skills.length > 0) {
        await supabase.from('profile_skills').delete().eq('profile_id', userId);
        const skillRows = skills.map((s) => ({ profile_id: userId, skill: s }));
        await supabase.from('profile_skills').insert(skillRows);
      }

      // 5. Sync Interests
      if (userId && interests.length > 0) {
        await supabase.from('profile_interests').delete().eq('profile_id', userId);
        const interestRows = interests.map((i) => ({ profile_id: userId, interest: i }));
        await supabase.from('profile_interests').insert(interestRows);
      }

      // Success -> Redirect to Dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setGeneralError('An unexpected error occurred while saving your builder profile.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-16) 0 var(--space-24)', minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <Container size="narrow">
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-10) var(--space-8)',
          }}
        >
          {/* Header & Step Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
            <Logo variant="wordmark" height={26} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="technical-label">STEP {step} OF 3</span>
              <span style={{ color: 'var(--border-regular)' }}>//</span>
              <span className="technical-label">
                {step === 1 ? 'IDENTITY' : step === 2 ? 'CRAFT' : 'BUILDS & LINKS'}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                lineHeight: 1.1,
              }}
            >
              Welcome to MADE.
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
              Tell us a little about what you build and what you want to make.
            </p>
          </div>

          {generalError && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-xs)',
                padding: 'var(--space-3) var(--space-4)',
                marginBottom: 'var(--space-6)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--color-danger)',
              }}
            >
              [ ERROR ]: {generalError}
            </div>
          )}

          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Input
                label="Full Name"
                placeholder="Sanket Tiwari"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                required
              />

              <div>
                <Input
                  label="Username"
                  placeholder="sanket"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  error={errors.username}
                  helperText="Your public profile coordinate: made.build/builders/[username]"
                  required
                />
              </div>

              <Input
                label="Location (Optional)"
                placeholder="e.g. San Francisco, CA / Mumbai, IN / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                error={errors.location}
              />

              <div>
                <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                  Profile Photo (Optional)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div
                    className="w-16 h-16 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-technical)',
                      backgroundColor: 'var(--bg-canvas)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        onError={() => setAvatarPreview(null)}
                        className="w-full h-full object-cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span
                        className="text-xs font-mono text-zinc-500"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}
                      >
                        No Image
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={handleAvatarChange}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
                {errors.avatar && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
                    {errors.avatar}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: CRAFT & DISCIPLINE */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div>
                <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-3)' }}>
                  PRIMARY DISCIPLINE / FOCUS
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {DISCIPLINES.map((d) => {
                    const isSelected = primaryFocus === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setPrimaryFocus(d)}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          padding: '6px 12px',
                          backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-canvas)',
                          color: isSelected ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                          border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-technical)',
                          borderRadius: 'var(--radius-xs)',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 700 : 500,
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                {errors.primaryFocus && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
                    {errors.primaryFocus}
                  </span>
                )}
              </div>

              <Textarea
                label="Short Bio"
                placeholder="What excites you? What kinds of systems do you build or want to build?"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                helperText="Maximum 280 characters."
                error={errors.bio}
              />

              {/* Skills Tags */}
              <div>
                <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                  TECHNICAL SKILLS & TOOLS
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  {skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        padding: '3px 8px',
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1px solid var(--accent-primary)',
                        color: 'var(--accent-primary-hover)',
                        borderRadius: 'var(--radius-xs)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Input
                    placeholder="Add a skill (e.g. PyTorch, Rust)..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(skillInput);
                      }
                    }}
                  />
                  <Button variant="outline" size="sm" type="button" onClick={() => addSkill(skillInput)}>
                    Add
                  </Button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', marginRight: '4px' }}>
                    Presets:
                  </span>
                  {PRESET_SKILLS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => addSkill(preset)}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        marginRight: '6px',
                      }}
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests Tags */}
              <div>
                <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                  AREAS OF INTEREST
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  {interests.map((i) => (
                    <span
                      key={i}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        padding: '3px 8px',
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1px solid var(--border-technical)',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-xs)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {i}
                      <button
                        type="button"
                        onClick={() => removeInterest(i)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Input
                    placeholder="Add an interest (e.g. Distributed Systems, Robotics)..."
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addInterest(interestInput);
                      }
                    }}
                  />
                  <Button variant="outline" size="sm" type="button" onClick={() => addInterest(interestInput)}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BUILDS & LINKS */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Input
                label="Current Build / Project Name (Optional)"
                placeholder="e.g. AEGIS Intelligence Platform"
                value={currentBuild}
                onChange={(e) => setCurrentBuild(e.target.value)}
                helperText="What are you actively designing, experimenting with, or shipping?"
                error={errors.currentBuild}
              />

              <Input
                label="GitHub Profile URL (Optional)"
                placeholder="https://github.com/your-handle"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                error={errors.githubUrl}
              />

              <Input
                label="LinkedIn Profile URL (Optional)"
                placeholder="https://linkedin.com/in/your-profile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                error={errors.linkedinUrl}
              />

              <Input
                label="Personal Portfolio / Artifacts URL (Optional)"
                placeholder="https://yourportfolio.dev"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                error={errors.portfolioUrl}
              />
            </div>
          )}

          {/* Bottom Actions Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'var(--space-8)',
              paddingTop: 'var(--space-6)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            {step > 1 ? (
              <Button variant="outline" size="md" onClick={handleBack} disabled={isSubmitting}>
                ← BACK
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button variant="primary" size="md" showArrow onClick={handleNext}>
                CONTINUE
              </Button>
            ) : (
              <Button variant="primary" size="md" showArrow onClick={handleComplete} disabled={isSubmitting}>
                {isSubmitting ? 'ESTABLISHING PROFILE...' : 'COMPLETE ONBOARDING'}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
