'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { OnboardingSchema, UsernameRegex } from '@/lib/auth/validations';
import { Container } from '@/components/layout/Container';
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

export default function ProfileEditPage() {
  const router = useRouter();
  const { isConfigured } = getSupabaseEnv();

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [primaryFocus, setPrimaryFocus] = useState('Engineering');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [currentBuild, setCurrentBuild] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?next=/profile/edit');
        return;
      }

      setUserId(user.id);

      // Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (profile.full_name) setFullName(profile.full_name);
        if (profile.username) {
          setUsername(profile.username);
          setOriginalUsername(profile.username);
        }
        if (profile.primary_focus) setPrimaryFocus(profile.primary_focus);
        if (profile.bio) setBio(profile.bio);
        if (profile.location) setLocation(profile.location);
        if (profile.current_build) setCurrentBuild(profile.current_build);
        if (profile.github_url) setGithubUrl(profile.github_url);
        if (profile.linkedin_url) setLinkedinUrl(profile.linkedin_url);
        if (profile.portfolio_url) setPortfolioUrl(profile.portfolio_url);
        if (profile.avatar_url) {
          setPreviewUrl(profile.avatar_url);
          setCurrentAvatarUrl(profile.avatar_url);
        }
      }

      // Fetch Skills
      const { data: skillsData } = await supabase
        .from('profile_skills')
        .select('skill')
        .eq('profile_id', user.id);

      if (skillsData) {
        setSkills(skillsData.map((s) => s.skill));
      }

      // Fetch Interests
      const { data: interestsData } = await supabase
        .from('profile_interests')
        .select('interest')
        .eq('profile_id', user.id);

      if (interestsData) {
        setInterests(interestsData.map((i) => i.interest));
      }

      setIsLoading(false);
    };

    loadProfile();
  }, [isConfigured, router]);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="technical-label">LOADING PROFILE EDITOR...</span>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    // Show instant local preview while typing
    setPreviewUrl(URL.createObjectURL(file));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.avatar;
      return next;
    });
  };

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage(null);
    setSaveStatus('saving');

    const normalizedUsername = username.trim().toLowerCase();

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
      setSaveStatus('error');
      return;
    }

    const supabase = createClient();

    try {
      let finalAvatarUrl = currentAvatarUrl;

      // 1. Upload to Supabase 'avatars' bucket if changed
      if (avatarFile && userId) {
        setUploading(true);
        const fileExt = avatarFile.name.split('.').pop() || 'png';
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `user-avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
          setErrorMessage(uploadError.message || 'Failed to upload profile photo.');
          setSaveStatus('error');
          setUploading(false);
          return;
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalAvatarUrl = publicUrl;
      }

      // 2. Check Username uniqueness if changed
      if (normalizedUsername !== originalUsername) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', normalizedUsername)
          .neq('id', userId || '')
          .maybeSingle();

        if (existingUser) {
          setErrors({ username: 'This username is already taken.' });
          setSaveStatus('error');
          setUploading(false);
          return;
        }
      }

      // 3. Update Profile table with the real public URL
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: payload.fullName,
          username: payload.username,
          avatar_url: finalAvatarUrl,
          primary_focus: payload.primaryFocus,
          bio: payload.bio || null,
          location: payload.location || null,
          current_build: payload.currentBuild || null,
          github_url: payload.githubUrl || null,
          linkedin_url: payload.linkedinUrl || null,
          portfolio_url: payload.portfolioUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId || '');

      if (profileError) {
        setErrorMessage(profileError.message);
        setSaveStatus('error');
        setUploading(false);
        return;
      }

      // 4. Sync Skills
      if (userId) {
        await supabase.from('profile_skills').delete().eq('profile_id', userId);
        if (skills.length > 0) {
          const skillRows = skills.map((s) => ({ profile_id: userId, skill: s }));
          await supabase.from('profile_skills').insert(skillRows);
        }
      }

      // 5. Sync Interests
      if (userId) {
        await supabase.from('profile_interests').delete().eq('profile_id', userId);
        if (interests.length > 0) {
          const interestRows = interests.map((i) => ({ profile_id: userId, interest: i }));
          await supabase.from('profile_interests').insert(interestRows);
        }
      }

      setOriginalUsername(normalizedUsername);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      setErrorMessage('Network error while saving profile.');
      setSaveStatus('error');
    }
  };

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-28)' }}>
      <Container size="narrow">
        {/* Top Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/dashboard" className="technical-label" style={{ color: 'var(--text-muted)' }}>
              WORKSPACE
            </Link>
            <span style={{ color: 'var(--border-regular)' }}>//</span>
            <span className="technical-label">EDIT PROFILE</span>
          </div>

          <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
            ← Back to Dashboard
          </Link>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-technical)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-10) var(--space-8)',
          }}
        >
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              Edit Builder Profile
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Update your public credentials, skills, and current build status.
            </p>
          </div>

          {saveStatus === 'saved' && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid var(--color-success)',
                borderRadius: 'var(--radius-xs)',
                padding: 'var(--space-3) var(--space-4)',
                marginBottom: 'var(--space-6)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--color-success)',
              }}
            >
              [ SUCCESS ]: CHANGES SAVED
            </div>
          )}

          {errorMessage && (
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
              [ ERROR ]: {errorMessage}
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                required
              />

              <Input
                label="Username (@handle)"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                error={errors.username}
                required
              />
            </div>

            {/* Avatar Section */}
            <div>
              <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                PROFILE PHOTO
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
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Avatar Preview"
                      onError={() => setPreviewUrl(null)}
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
                <div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={handleFileChange}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  />
                  {errors.avatar && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
                      {errors.avatar}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Discipline Selection */}
            <div>
              <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                PRIMARY DISCIPLINE
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
            </div>

            <Textarea
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              helperText="Maximum 280 characters."
              error={errors.bio}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
              <Input
                label="Location"
                placeholder="e.g. San Francisco, CA / Mumbai, IN"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <Input
                label="Current Build / Project"
                placeholder="e.g. AEGIS Intelligence"
                value={currentBuild}
                onChange={(e) => setCurrentBuild(e.target.value)}
              />
            </div>

            {/* Skills */}
            <div>
              <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                TECHNICAL SKILLS
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
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Input
                  placeholder="Add skill..."
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

            {/* Interests */}
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
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Input
                  placeholder="Add interest..."
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

            {/* Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <Input
                label="GitHub URL"
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                error={errors.githubUrl}
              />
              <Input
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/..."
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                error={errors.linkedinUrl}
              />
              <Input
                label="Portfolio URL"
                placeholder="https://..."
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                error={errors.portfolioUrl}
              />
            </div>

            <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)' }}>
              <Button variant="primary" size="lg" disabled={saveStatus === 'saving' || uploading}>
                {saveStatus === 'saving' || uploading ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
