'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { ProjectSchema, ProjectUpdateSchema, PROJECT_CATEGORIES, PROJECT_STATUSES } from '@/lib/projects/validations';
import { Container } from '@/components/layout/Container';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SystemConfigRequired } from '@/components/auth/SystemConfigRequired';

const PRESET_TECH = [
  'TypeScript', 'Python', 'Rust', 'PyTorch', 'Next.js', 'PostgreSQL', 'FastAPI', 'C++', 'Go', 'WebAssembly', 'Docker', 'Linux', 'Mapbox GL', 'Figma'
];

export default function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const projectId = params.id;
  const { isConfigured } = getSupabaseEnv();

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Engineering');
  const [status, setStatus] = useState<string>('BUILDING');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Build Logs state
  const [updates, setUpdates] = useState<any[]>([]);
  const [logTitle, setLogTitle] = useState('');
  const [logContent, setLogContent] = useState('');
  const [isAddingLog, setIsAddingLog] = useState(false);

  // Collaborators & Invitations state
  const [members, setMembers] = useState<any[]>([]);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);

  // Status & Confirmation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const loadProjectData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?next=/dashboard/projects/${projectId}/edit`);
        return;
      }

      setUserId(user.id);

      // 1. Fetch Project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError || !project) {
        setGeneralError('Project record not found or inaccessible.');
        setIsLoading(false);
        return;
      }

      if (project.owner_id !== user.id) {
        setGeneralError('Unauthorized: Only project owners can edit repository specifications.');
        setIsLoading(false);
        return;
      }

      setIsOwner(true);
      setTitle(project.title);
      setSlug(project.slug);
      setShortDescription(project.short_description);
      setDescription(project.description);
      setCategory(project.category);
      setStatus(project.status);
      setGithubUrl(project.github_url || '');
      setLiveUrl(project.live_url || '');
      setDemoUrl(project.demo_url || '');
      setIsPublic(project.is_public);
      if (project.cover_image) setCoverPreview(project.cover_image);

      // 2. Fetch Tech
      const { data: techData } = await supabase
        .from('project_technologies')
        .select('technology')
        .eq('project_id', projectId);

      if (techData) setTechnologies(techData.map((t) => t.technology));

      // 3. Fetch Updates (Build Logs)
      const { data: updatesData } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (updatesData) setUpdates(updatesData);

      // 4. Fetch Members
      const { data: membersData } = await supabase
        .from('project_members')
        .select('id, user_id, role, profiles(id, full_name, username)')
        .eq('project_id', projectId);

      if (membersData) setMembers(membersData);

      setIsLoading(false);
    };

    loadProjectData();
  }, [isConfigured, projectId, router]);

  if (!isConfigured) {
    return <SystemConfigRequired />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="technical-label">LOADING PROJECT CONFIGURATION...</span>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center' }}>
        <Container size="narrow">
          <span className="technical-label" style={{ color: 'var(--color-danger)' }}>
            [ ACCESS RESTRICTED ]
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginTop: 'var(--space-2)' }}>
            Unauthorized Action
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            You do not possess owner privileges for this repository.
          </p>
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Button href="/dashboard/projects" variant="primary" size="sm">
              ← Return to Your Projects
            </Button>
          </div>
        </Container>
      </div>
    );
  }

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

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, cover: 'Image size exceeds 5MB limit.' }));
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // Save Project Changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setSaveStatus('saving');

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
      setSaveStatus('error');
      return;
    }

    const supabase = createClient();

    try {
      let finalCoverUrl = coverPreview;
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

      // Update project row
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          title: payload.title,
          short_description: payload.short_description,
          description: payload.description,
          category: payload.category,
          status: payload.status,
          cover_image: finalCoverUrl,
          github_url: payload.github_url || null,
          live_url: payload.live_url || null,
          demo_url: payload.demo_url || null,
          is_public: payload.is_public,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (updateError) {
        setGeneralError(updateError.message);
        setSaveStatus('error');
        return;
      }

      // Sync technologies
      await supabase.from('project_technologies').delete().eq('project_id', projectId);
      if (technologies.length > 0) {
        const techRows = technologies.map((t) => ({ project_id: projectId, technology: t }));
        await supabase.from('project_technologies').insert(techRows);
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch {
      setGeneralError('Network error while updating project.');
      setSaveStatus('error');
    }
  };

  // Add Build Log Update
  const handleAddBuildLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle.trim() || !logContent.trim() || !userId) return;

    setIsAddingLog(true);
    const supabase = createClient();

    try {
      const { data: newUpdate, error } = await supabase
        .from('project_updates')
        .insert({
          project_id: projectId,
          author_id: userId,
          title: logTitle.trim(),
          content: logContent.trim(),
        })
        .select('*')
        .single();

      if (!error && newUpdate) {
        setUpdates([newUpdate, ...updates]);
        setLogTitle('');
        setLogContent('');
      }
    } catch {
      // Ignore
    } finally {
      setIsAddingLog(false);
    }
  };

  // Delete Build Log Update
  const handleDeleteLog = async (logId: string) => {
    const supabase = createClient();
    await supabase.from('project_updates').delete().eq('id', logId);
    setUpdates(updates.filter((u) => u.id !== logId));
  };

  // Invite Collaborator
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim() || !userId) return;

    setInviteStatus('Searching for builder...');
    const supabase = createClient();

    try {
      const { data: targetUser } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .eq('username', inviteUsername.trim().toLowerCase())
        .single();

      if (!targetUser) {
        setInviteStatus('Error: Builder with this handle does not exist.');
        return;
      }

      if (targetUser.id === userId) {
        setInviteStatus('Error: You are already the project owner.');
        return;
      }

      // Add to project_members directly or send invitation
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: targetUser.id,
          role: 'COLLABORATOR',
        });

      if (memberError) {
        setInviteStatus(`Status: ${memberError.message}`);
      } else {
        setInviteStatus(`Success: Added @${targetUser.username} as collaborator.`);
        setMembers([...members, { user_id: targetUser.id, role: 'COLLABORATOR', profiles: targetUser }]);
        setInviteUsername('');
      }
    } catch {
      setInviteStatus('Network error while inviting collaborator.');
    }
  };

  // Delete Entire Project
  const handleDeleteProject = async () => {
    setIsDeleting(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (!error) {
        router.push('/dashboard/projects');
        router.refresh();
      } else {
        setGeneralError(`Could not delete project: ${error.message}`);
        setIsDeleting(false);
      }
    } catch {
      setGeneralError('Network error while attempting project deletion.');
      setIsDeleting(false);
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
            <span className="technical-label">EDIT SPECIFICATION</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <Link href={`/projects/${slug}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary-hover)' }}>
              View Case Study ↗
            </Link>
            <Link href="/dashboard/projects" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)', textDecoration: 'underline' }}>
              ← Your Projects
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          {/* Main Edit Form */}
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
                Edit: {title}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Coordinate: <code>/projects/{slug}</code>
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

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <Input
                label="Project Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
                required
              />

              <Input
                label="Short Description"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                error={errors.short_description}
                required
              />

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

              <Textarea
                label="Full Description (About the Build)"
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
                  {technologies.map((t) => (
                    <span
                      key={t}
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
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTech(t)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Input
                    placeholder="Add technology..."
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
              </div>

              {/* Cover Image */}
              <div>
                <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                  COVER IMAGE
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
                        alt="Cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={handleCoverChange}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                  />
                </div>
              </div>

              {/* Links */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                <Input
                  label="GitHub URL"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  error={errors.github_url}
                />
                <Input
                  label="Live Demo URL"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  error={errors.live_url}
                />
                <Input
                  label="Demo Video URL"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  error={errors.demo_url}
                />
              </div>

              {/* Visibility */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-technical)', borderRadius: 'var(--radius-xs)' }}>
                <input
                  type="checkbox"
                  id="isPublicEdit"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
                <label htmlFor="isPublicEdit" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <strong>Public Visibility</strong> — Publish to MADE community directories.
                </label>
              </div>

              <div style={{ marginTop: 'var(--space-2)' }}>
                <Button variant="primary" size="lg" disabled={saveStatus === 'saving'}>
                  {saveStatus === 'saving' ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
                </Button>
              </div>
            </form>
          </div>

          {/* Section 2: Build Logs Management */}
          <div
            id="logs"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-8)',
            }}
          >
            <div style={{ marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
              <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
                BUILD LOGS & MILESTONES
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginTop: '2px' }}>
                Document Engineering Milestones
              </h3>
            </div>

            {/* Add Log Form */}
            <form onSubmit={handleAddBuildLog} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)', padding: 'var(--space-4)', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-technical)' }}>
              <Input
                label="Milestone Title"
                placeholder="e.g. WEEK 04 // Deployed WebAssembly Worker Threads"
                value={logTitle}
                onChange={(e) => setLogTitle(e.target.value)}
                required
              />

              <Textarea
                label="Log Details"
                placeholder="What did you implement, benchmark, or solve?"
                value={logContent}
                onChange={(e) => setLogContent(e.target.value)}
                required
              />

              <Button variant="outline" size="sm" disabled={isAddingLog} style={{ alignSelf: 'flex-start' }}>
                {isAddingLog ? 'Logging...' : '+ Add Build Log'}
              </Button>
            </form>

            {/* Existing Logs List */}
            {updates.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {updates.map((u) => (
                  <div
                    key={u.id}
                    style={{
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      gap: 'var(--space-4)',
                    }}
                  >
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {u.title}
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {u.content}
                      </p>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteLog(u.id)}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        color: 'var(--color-danger)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                No build logs recorded yet. Add your first milestone above.
              </p>
            )}
          </div>

          {/* Section 3: Collaborators */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-8)',
            }}
          >
            <div style={{ marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
              <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
                TEAM & COLLABORATORS
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginTop: '2px' }}>
                Add MADE Builders
              </h3>
            </div>

            <form onSubmit={handleInvite} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Input
                placeholder="Enter builder username (e.g. aarav)..."
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
              />
              <Button variant="outline" size="md">
                Add Collaborator
              </Button>
            </form>

            {inviteStatus && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: inviteStatus.startsWith('Error') ? 'var(--color-danger)' : 'var(--color-success)', marginBottom: 'var(--space-4)' }}>
                {inviteStatus}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {members.map((m) => (
                <div
                  key={m.id || m.user_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-2) var(--space-4)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {m.profiles?.full_name || 'Builder'} (@{m.profiles?.username || 'member'})
                  </span>
                  <Badge variant={m.role === 'OWNER' ? 'accent' : 'default'} useBrackets>
                    {m.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Danger Zone (Delete Project) */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
            }}
          >
            <div>
              <span className="technical-label" style={{ color: 'var(--color-danger)' }}>
                DANGER ZONE // REPOSITORY DELETION
              </span>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Permanently delete this project specification, technologies, and associated build logs.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
            >
              DELETE PROJECT
            </Button>
          </div>

          {/* Confirmation Modal */}
          {showDeleteModal && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(12, 12, 14, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--color-danger)',
                  borderRadius: 'var(--radius-xs)',
                  padding: 'var(--space-8)',
                  maxWidth: '480px',
                  width: '100%',
                }}
              >
                <span className="technical-label" style={{ color: 'var(--color-danger)' }}>
                  CONFIRM DELETION
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 'var(--space-2)' }}>
                  Delete {title}?
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-2)', lineHeight: 1.5 }}>
                  This action is permanent and cannot be reversed. All tech stack bindings and build logs will be deleted.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                  <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDeleteProject}
                    disabled={isDeleting}
                    style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
