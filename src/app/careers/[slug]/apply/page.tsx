'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { CareerRole, Profile } from '@/lib/supabase/types';
import { CareerApplicationSchema } from '@/lib/careers/validations';
import { submitCareerApplicationAction } from '@/lib/careers/actions';
import { Container } from '@/components/layout/Container';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

export interface ExistingApplicationRecord {
  id: string;
  status: string;
  created_at: string;
  role_title?: string;
  reference_code?: string;
}

export default function CareerApplyPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const { isConfigured } = getSupabaseEnv();

  const [role, setRole] = useState<CareerRole | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Existing application state
  const [existingApp, setExistingApp] = useState<ExistingApplicationRecord | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatTheyBuild, setWhatTheyBuild] = useState('');
  const [experience, setExperience] = useState('');
  const [coverMessage, setCoverMessage] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Submission State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const init = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?next=/careers/${params.slug}/apply`);
        return;
      }

      setUserId(user.id);
      const userEmail = user.email || '';
      setEmail(userEmail);

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData as Profile);
        if (profileData.full_name) setFullName(profileData.full_name);
        if (profileData.email) setEmail(profileData.email);
        if (profileData.github_url) setGithubUrl(profileData.github_url);
        if (profileData.linkedin_url) setLinkedinUrl(profileData.linkedin_url);
        if (profileData.portfolio_url) setPortfolioUrl(profileData.portfolio_url);
      }

      // 2. Fetch Role
      const { data: roleData } = await supabase
        .from('career_roles')
        .select('*')
        .eq('slug', params.slug)
        .single();

      const currentRole = (roleData as CareerRole) || null;
      setRole(currentRole);

      // 3. Query existing application record
      if (currentRole && user) {
        const { data: existingRecord } = await supabase
          .from('career_applications')
          .select('id, status, created_at, role_title, reference_code')
          .eq('role_id', currentRole.id)
          .or(`applicant_id.eq.${user.id},email.eq.${user.email}`)
          .maybeSingle();

        if (existingRecord) {
          setExistingApp(existingRecord as ExistingApplicationRecord);
        }
      }

      setIsLoading(false);
    };

    init();
  }, [isConfigured, params.slug, router]);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="technical-label">INITIALIZING APPLICATION WORKSPACE...</span>
      </div>
    );
  }

  if (!role) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center' }}>
        <Container size="narrow">
          <span className="technical-label" style={{ color: 'var(--color-danger)' }}>
            [ ROLE NOT FOUND ]
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginTop: 'var(--space-2)' }}>
            Unknown Position
          </h2>
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Button href="/careers" variant="primary" size="sm">
              ← Return to Open Roles
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // 1. Render Locked Dossier View if Application Already Exists
  if (existingApp) {
    const formattedDate = existingApp.created_at
      ? new Date(existingApp.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Submitted';

    return (
      <div style={{ padding: 'var(--space-12) 0 var(--space-28)' }}>
        <Container size="narrow">
          {/* Top Breadcrumb */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-8)',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link href={`/careers/${role.slug}`} className="technical-label" style={{ color: 'var(--text-muted)' }}>
                {role.title.toUpperCase()}
              </Link>
              <span style={{ color: 'var(--border-regular)' }}>//</span>
              <span className="technical-label">APPLICATION DOSSIER</span>
            </div>

            <Link
              href="/careers"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
                textDecoration: 'underline',
              }}
            >
              ← Return to Careers
            </Link>
          </div>

          {/* Locked Dossier Confirmation Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-10) var(--space-8)',
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
                <span
                  className="technical-label"
                  style={{
                    color: 'var(--accent-primary-hover)',
                    letterSpacing: '0.08em',
                  }}
                >
                  [ APPLICATION ALREADY SUBMITTED ]
                </span>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  marginTop: 'var(--space-2)',
                }}
              >
                {role.title}
              </h1>
            </div>

            {/* Dossier Meta Details */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-4)',
                padding: 'var(--space-6)',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-technical)',
                borderRadius: 'var(--radius-xs)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  STATUS
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--accent-primary-hover)',
                    letterSpacing: '0.04em',
                    display: 'inline-block',
                    padding: '2px 8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-technical)',
                  }}
                >
                  {existingApp.status || 'SUBMITTED'}
                </span>
              </div>

              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  SUBMITTED ON
                </span>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {formattedDate}
                </p>
              </div>

              {existingApp.reference_code && (
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--text-dim)',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    REFERENCE CODE
                  </span>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    #{existingApp.reference_code}
                  </p>
                </div>
              )}
            </div>

            {/* Explanatory Message */}
            <p
              style={{
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-8)',
              }}
            >
              You have already submitted an application for this position. Our review team is evaluating your submission.
            </p>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 'var(--space-6)',
              }}
            >
              <Button href="/careers" variant="outline" size="md">
                Return to Careers
              </Button>
              <Button href="/workspace" variant="primary" size="md" showArrow>
                Go to Workspace
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Confirmation view upon successful submission
  if (submittedRef) {
    return (
      <div style={{ padding: 'var(--space-20) 0 var(--space-28)' }}>
        <Container size="narrow">
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--accent-primary)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-12) var(--space-8)',
              textAlign: 'center',
            }}
          >
            <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
              [ APPLICATION RECEIVED ]
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.25rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                marginTop: 'var(--space-3)',
              }}
            >
              Application Submitted
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: 'var(--space-3)', maxWidth: '520px', margin: 'var(--space-3) auto 0' }}>
              Your application for <strong>{role.title}</strong> is now with the MADE core team.
            </p>

            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-technical)', display: 'inline-block', margin: 'var(--space-6) 0' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
                APPLICATION REFERENCE CODE
              </span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                #{submittedRef}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
              <Button href="/dashboard/applications" variant="primary" size="md" showArrow>
                Open Applications Workspace
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, resume: 'Resume file size exceeds 10MB limit.' }));
      return;
    }

    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, resume: 'Only PDF or DOCX documents are supported.' }));
      return;
    }

    setResumeFile(file);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.resume;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (existingApp) return;

    setErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    const resolvedFullName = fullName.trim() || profile?.full_name || '';
    const candidateEmail = (currentUser?.email || email || profile?.email || '').trim().toLowerCase();

    const payload = {
      full_name: resolvedFullName,
      name: resolvedFullName,
      email: currentUser?.email || candidateEmail,
      applicant_email: currentUser?.email || candidateEmail,
      applicant_id: currentUser?.id || userId,
      user_id: currentUser?.id || userId,
      cover_message: coverMessage.trim(),
      what_they_build: whatTheyBuild.trim(),
      experience: experience.trim(),
      github_url: githubUrl.trim() || undefined,
      linkedin_url: linkedinUrl.trim() || undefined,
      portfolio_url: portfolioUrl.trim() || undefined,
      additional_information: additionalInfo.trim() || undefined,
    };

    const validationResult = CareerApplicationSchema.safeParse(payload);
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
      // 1. Upload resume if provided
      const resolvedUserId = currentUser?.id || userId;
      let finalResumePath = null;
      if (resumeFile && resolvedUserId) {
        const fileExt = resumeFile.name.split('.').pop() || 'pdf';
        const filePath = `${resolvedUserId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, resumeFile);

        if (!uploadError) {
          finalResumePath = filePath;
        }
      }

      // 2. Submit via Server Action Guard
      const result = await submitCareerApplicationAction({
        role_id: role.id,
        full_name: payload.full_name,
        name: payload.name,
        email: payload.email,
        applicant_email: payload.applicant_email,
        applicant_id: payload.applicant_id,
        user_id: payload.user_id,
        cover_message: payload.cover_message,
        what_they_build: payload.what_they_build,
        experience: payload.experience,
        github_url: payload.github_url,
        linkedin_url: payload.linkedin_url,
        portfolio_url: payload.portfolio_url,
        resume_path: finalResumePath,
        additional_information: payload.additional_information,
      });

      if (!result.success) {
        if (result.code === 'ALREADY_APPLIED' || result.status === 409) {
          setExistingApp({
            id: result.existingApplicationId || '',
            status: result.existingStatus || 'SUBMITTED',
            created_at: new Date().toISOString(),
            role_title: role.title,
            reference_code: result.referenceCode,
          });
          setGeneralError('You have already applied for this role.');
        } else {
          setGeneralError(result.error || 'Failed to submit application.');
        }
        setIsSubmitting(false);
        return;
      }

      setSubmittedRef(result.referenceCode || 'SUBMITTED');
    } catch {
      setGeneralError('Network error while transmitting application.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-28)' }}>
      <Container size="narrow">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href={`/careers/${role.slug}`} className="technical-label" style={{ color: 'var(--text-muted)' }}>
              {role.title.toUpperCase()}
            </Link>
            <span style={{ color: 'var(--border-regular)' }}>//</span>
            <span className="technical-label">BUILDER APPLICATION</span>
          </div>

          <Link href={`/careers/${role.slug}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
            ← Back to Role
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
            <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
              APPLICATION MATRIX
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                marginTop: '4px',
              }}
            >
              Apply: {role.title}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              We evaluate candidates on technical curiosity, craft, and agency.
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Section 01: Candidate Identifier */}
            <div>
              <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-3)' }}>
                01 // CANDIDATE IDENTIFIER
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                <Input
                  label="Full Name / Candidate Name"
                  placeholder="e.g. Satoshi Nakamoto"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  error={errors.full_name || errors.name}
                  required
                />
                <Input
                  label="Contact / Account Email"
                  placeholder="builder@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email || errors.applicant_email}
                  required
                />
                <div>
                  <span className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                    AUTHENTICATED BUILDER
                  </span>
                  <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-technical)', borderRadius: 'var(--radius-xs)', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--accent-primary-hover)' }}>
                      @{profile?.username || 'builder'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 02: What You Build */}
            <div>
              <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-3)' }}>
                02 // WHAT DO YOU BUILD?
              </span>
              <Textarea
                label="Tell us about the systems, tools, prototypes, or experiments you've engineered."
                placeholder="Detail languages, frameworks, architecture decisions, and challenges you enjoyed solving."
                value={whatTheyBuild}
                onChange={(e) => setWhatTheyBuild(e.target.value)}
                error={errors.what_they_build}
                required
              />
            </div>

            {/* Section 03: Your Work & Links */}
            <div>
              <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-3)' }}>
                03 // YOUR BACKGROUND & PROOFS
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Textarea
                  label="Relevant Background & Technical Experience"
                  placeholder="Where have you studied or worked? What domains are you exploring?"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  error={errors.experience}
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                  <Input
                    label="GitHub Profile URL (Optional)"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    error={errors.github_url}
                  />
                  <Input
                    label="LinkedIn Profile URL (Optional)"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    error={errors.linkedin_url}
                  />
                  <Input
                    label="Portfolio / Website URL (Optional)"
                    placeholder="https://..."
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    error={errors.portfolio_url}
                  />
                </div>

                {/* Resume Upload */}
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                    RESUME / CV (OPTIONAL PDF/DOCX)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf"
                    onChange={handleResumeChange}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                  />
                  {errors.resume && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
                      {errors.resume}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 04: Why MADE? */}
            <div>
              <span className="technical-label" style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: 'var(--space-3)' }}>
                04 // WHY DO YOU WANT TO BUILD WITH MADE?
              </span>
              <Textarea
                label="Why MADE and this specific role?"
                placeholder="What impact or technical systems do you want to create here?"
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
                error={errors.cover_message}
                required
              />
            </div>

            {/* Section 05: Additional Info */}
            <div>
              <span className="technical-label" style={{ color: 'var(--text-dim)', display: 'block', marginBottom: 'var(--space-3)' }}>
                05 // ADDITIONAL CONTEXT (OPTIONAL)
              </span>
              <Textarea
                placeholder="Anything else you would like the team to know?"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              showArrow
              style={{ alignSelf: 'flex-start' }}
            >
              {isSubmitting ? 'TRANSMITTING APPLICATION...' : 'SUBMIT APPLICATION'}
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
}

