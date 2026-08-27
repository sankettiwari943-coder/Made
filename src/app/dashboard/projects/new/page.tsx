'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { ProjectSchema, generateSlug, PROJECT_CATEGORIES, PROJECT_STATUSES } from '@/lib/projects/validations';
import { Container } from '@/components/layout/Container';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

const PRESET_TECH = [
  'TypeScript', 'Python', 'Rust', 'PyTorch', 'Next.js', 'PostgreSQL', 'FastAPI', 'C++', 'Go', 'WebAssembly', 'Docker', 'Linux', 'Mapbox GL', 'Figma'
];

export default function NewProjectPage() {
  const router = useRouter();
  const { isConfigured } = getSupabaseEnv();

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('AI / ML');
  const [status, setStatus] = useState<string>('BUILDING');
  const [technologies, setTechnologies] = useState<string[]>(['TypeScript', 'Next.js']);
  const [techInput, setTechInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // Cover Image
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const checkSession = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?next=/dashboard/projects/new');
        return;
      }

      setUserId(user.id);
      setIsLoading(false);
    };

    checkSession();
  }, [isConfigured, router]);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="technical-label">INITIALIZING PROJECT ARCHITECT...</span>
      </div>
    );
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, cover: 'Image size exceeds 5MB limit.' }));
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, cover: 'Only JPG, PNG, WEBP, and GIF images are supported.' }));
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.cover;
      return next;
    });
  };

  const addTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      setTechnologies([...technologies, trimmed]);
      setTechInput('');
    }
  };

  const removeTech = (techToRemove: string) => {
    setTechnologies(technologies.filter((t) => t !== techToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      short_description: shortDescription.trim(),
      description: description.trim(),
      category,
      status: status as any,
      technologies,
      github_url: githubUrl.trim() || undefined,
      live_url: liveUrl.trim() || undefined,
      demo_url: demoUrl.trim() || undefined,
      is_public: isPublic,
    };

    const validationResult = ProjectSchema.safeParse(payload);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    const supabase = createClient();

    try {
      // 1. Generate unique slug
      let baseSlug = generateSlug(payload.title);
      let uniqueSlug = baseSlug;
      let counter = 1;

      while (true) {
        const { data: existingSlug } = await supabase
          .from('projects')
          .select('id')
          .eq('slug', uniqueSlug)
          .maybeSingle();

        if (!existingSlug) break;
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      // 2. Upload cover image if provided
      let finalCoverUrl = null;
      if (coverFile && userId) {
        const fileExt = coverFile.name.split('.').pop() || 'png';
        const filePath = `covers/${userId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('project-covers')
          .upload(filePath, coverFile, { upsert: true });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('project-covers')
            .getPublicUrl(filePath);
          finalCoverUrl = publicUrlData.publicUrl;
        }
      }

      // 3. Insert project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          owner_id: userId || '',
          title: payload.title,
          slug: uniqueSlug,
          short_description: payload.short_description,
          description: payload.description,
          category: payload.category,
          status: payload.status,
          cover_image: finalCoverUrl,
          github_url: payload.github_url || null,
          live_url: payload.live_url || null,
          demo_url: payload.demo_url || null,
          is_public: payload.is_public,
        })
        .select('id, slug')
        .single();

      if (projectError || !newProject) {
        setGeneralError(`Database error: ${projectError?.message || 'Could not save project.'}`);
        setIsSubmitting(false);
        return;
      }

      // 4. Insert technologies
      if (technologies.length > 0) {
        const techRows = technologies.map((t) => ({
          project_id: newProject.id,
          technology: t,
        }));
        await supabase.from('project_technologies').insert(techRows);
      }

      // Success -> Redirect to project page
      router.push(`/projects/${newProject.slug}`);
      router.refresh();
    } catch (err: any) {
      setGeneralError('Network error while deploying project record.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-28)' }}>
      <Container size="narrow">
        {/* Top Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/dashboard/projects" className="technical-label" style={{ color: 'var(--text-muted)' }}>
              PROJECTS
            </Link>
            <span style={{ color: 'var(--border-regular)' }}>//</span>
            <span className="technical-label">NEW BUILD ARCHITECTURE</span>
          </div>

          <Link href="/dashboard/projects" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
            ← Back to Projects
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
              Start a New Project
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Publish an active engineering repository, system prototype, or open source tool.
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Title */}
            <Input
              label="Project Title"
              placeholder="e.g. AEGIS Intelligence Substrate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              required
            />

            {/* Short Description */}
            <Input
              label="Short One-Line Description"
              placeholder="e.g. AI-powered geospatial disaster response intelligence and evacuation routing."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              error={errors.short_description}
              helperText="10 to 240 characters. Displayed in project directories."
              required
            />

            {/* Category & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <div>
                <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                  CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-technical)',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                  }}
                >
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                  DEVELOPMENT STATUS
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-technical)',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                  }}
                >
                  {PROJECT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      [ {st} ]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Full Description */}
            <Textarea
              label="About the Build (Full Description)"
              placeholder="Detail the technical architecture, problem statement, challenges solved, and roadmap."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              required
            />

            {/* Technologies */}
            <div>
              <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                THE TECH STACK
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                {technologies.map((tech) => (
                  <span
                    key={tech}
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
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Input
                  placeholder="Add technology (e.g. PyTorch, Rust)..."
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTech(techInput);
                    }
                  }}
                />
                <Button variant="outline" size="sm" type="button" onClick={() => addTech(techInput)}>
                  Add
                </Button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
                {PRESET_TECH.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => addTech(p)}
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
                    +{p}
                  </button>
                ))}
              </div>
              {errors.technologies && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
                  {errors.technologies}
                </span>
              )}
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                COVER SCHEMATIC / ARCHITECTURE DIAGRAM (OPTIONAL)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                {coverPreview && (
                  <div
                    style={{
                      width: '120px',
                      aspectRatio: '16 / 9',
                      border: '1px solid var(--border-technical)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-canvas)',
                    }}
                  >
                    <img
                      src={coverPreview}
                      alt="Cover Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleCoverChange}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
              {errors.cover && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
                  {errors.cover}
                </span>
              )}
            </div>

            {/* Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <Input
                label="GitHub URL (Optional)"
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                error={errors.github_url}
              />
              <Input
                label="Live Demo URL (Optional)"
                placeholder="https://..."
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                error={errors.live_url}
              />
              <Input
                label="Demo Video URL (Optional)"
                placeholder="https://youtube.com/..."
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                error={errors.demo_url}
              />
            </div>

            {/* Visibility Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-technical)', borderRadius: 'var(--radius-xs)' }}>
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
              />
              <label htmlFor="isPublic" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <strong>Public Repository</strong> — Make this project visible on the MADE public directory.
              </label>
            </div>

            <Button variant="primary" size="lg" disabled={isSubmitting} showArrow style={{ alignSelf: 'flex-start' }}>
              {isSubmitting ? 'DEPLOYING REPOSITORY...' : 'DEPLOY PROJECT'}
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
}
