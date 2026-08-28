'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { CareerRole, Profile } from '@/lib/supabase/types';
import { CareerApplicationSchema, formatApplicationStatus } from '@/lib/careers/validations';
import { submitCareerApplicationAction, checkExistingCareerApplicationAction } from '@/lib/careers/actions';
import { Container } from '@/components/layout/Container';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

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
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [existingAppId, setExistingAppId] = useState<string | null>(null);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [existingRefCode, setExistingRefCode] = useState<string | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

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

  // Check duplicate application helper
  const performDuplicateCheck = useCallback(
    async (roleId: string, candidateEmail?: string) => {
      if (!roleId) return;
      setIsCheckingDuplicate(true);

      const result = await checkExistingCareerApplicationAction(roleId, candidateEmail);
      if (result.exists && result.application) {
        setAlreadyApplied(true);
        setExistingAppId(result.application.id);
        setExistingStatus(result.application.status);
        setExistingRefCode(result.application.reference_code);
      } else {
        setAlreadyApplied(false);
        setExistingAppId(null);
        setExistingStatus(null);
        setExistingRefCode(null);
      }
      setIsCheckingDuplicate(false);
    },
    []
  );

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

      // 3. Pre-Submission Check
      if (currentRole) {
        await performDuplicateCheck(currentRole.id, profileData?.email || userEmail);
      }

      setIsLoading(false);
    };

    init();
  }, [isConfigured, params.slug, router, performDuplicateCheck]);

  // Debounced email duplicate check when email input changes
  useEffect(() => {
    if (!role || !email || !email.includes('@') || isLoading) return;

    const timer = setTimeout(() => {
      performDuplicateCheck(role.id, email);
    }, 600);

    return () => clearTimeout(timer);
  }, [email, role, isLoading, performDuplicateCheck]);

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
    if (alreadyApplied) return;

    setErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    const resolvedFullName = fullName.trim() || profile?.full_name || '';
    const candidateEmail = email.trim() || profile?.email || '';

    const payload = {
      full_name: resolvedFullName,
      name: resolvedFullName,
      email: candidateEmail,
      applicant_email: candidateEmail,
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
      let finalResumePath = null;
      if (resumeFile && userId) {
        const supabase = createClient();
        const fileExt = resumeFile.name.split('.').pop() || 'pdf';
        const filePath = `${userId}/${Date.now()}.${fileExt}`;
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
          setAlreadyApplied(true);
          if (result.existingApplicationId) {
            setExistingAppId(result.existingApplicationId);
          }
          if (result.existingStatus) {
            setExistingStatus(result.existingStatus);
          }
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

  const formattedStatus = formatApplicationStatus(existingStatus);


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

          {/* Informative Banner when Application Already Exists */}
          {alreadyApplied && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--accent-primary)',
                borderRadius: 'var(--radius-xs)',
                padding: 'var(--space-4) var(--space-6)',
                marginBottom: 'var(--space-8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span className="technical-label" style={{ color: 'var(--accent-primary-hover)' }}>
                  [ APPLICATION ON FILE ]
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  You have already submitted an application for this role. Status:{' '}
                  <strong style={{ color: 'var(--accent-primary-hover)' }}>
                    [{formattedStatus}]
                  </strong>
                </span>
              </div>

              {existingAppId && (
                <Button href={`/dashboard/applications/${existingAppId}`} variant="outline" size="sm">
                  View Submission Status →
                </Button>
              )}
            </div>
          )}

          {generalError && !alreadyApplied && (
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
                  disabled={alreadyApplied}
                  required
                />
                <Input
                  label="Contact / Account Email"
                  placeholder="builder@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email || errors.applicant_email}
                  disabled={alreadyApplied}
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
                disabled={alreadyApplied}
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
                  disabled={alreadyApplied}
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                  <Input
                    label="GitHub Profile URL (Optional)"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    error={errors.github_url}
                    disabled={alreadyApplied}
                  />
                  <Input
                    label="LinkedIn Profile URL (Optional)"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    error={errors.linkedin_url}
                    disabled={alreadyApplied}
                  />
                  <Input
                    label="Portfolio / Website URL (Optional)"
                    placeholder="https://..."
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    error={errors.portfolio_url}
                    disabled={alreadyApplied}
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
                    disabled={alreadyApplied}
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
                disabled={alreadyApplied}
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
                disabled={alreadyApplied}
              />
            </div>

            {alreadyApplied ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                  {existingAppId ? (
                    <Button href={`/dashboard/applications/${existingAppId}`} variant="primary" size="lg" showArrow>
                      VIEW SUBMISSION STATUS
                    </Button>
                  ) : (
                    <Button href="/dashboard/applications" variant="primary" size="lg" showArrow>
                      VIEW YOUR APPLICATIONS
                    </Button>
                  )}
                  <Button href="/careers" variant="outline" size="lg">
                    EXPLORE OTHER ROLES
                  </Button>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Submission disabled: You already have an active dossier for this position ({existingRefCode ? `#${existingRefCode}` : 'on file'}).
                </span>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                disabled={isSubmitting || isCheckingDuplicate}
                showArrow
                style={{ alignSelf: 'flex-start' }}
              >
                {isSubmitting
                  ? 'TRANSMITTING APPLICATION...'
                  : isCheckingDuplicate
                  ? 'CHECKING ELIGIBILITY...'
                  : 'SUBMIT APPLICATION'}
              </Button>
            )}
          </form>
        </div>
      </Container>
    </div>
  );
}

