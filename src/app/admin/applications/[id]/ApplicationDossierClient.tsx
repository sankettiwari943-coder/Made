'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CareerApplication,
  ApplicationNote,
  ApplicationStatusHistory,
  ApplicationStatus,
} from '@/lib/supabase/types';
import {
  updateApplicationStatusAction,
  addApplicationNoteAction,
  deleteApplicationNoteAction,
  getSecureResumeDownloadUrl,
} from '@/lib/admin/actions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

const STATUS_OPTIONS: { label: string; value: ApplicationStatus }[] = [
  { label: 'SUBMITTED', value: 'SUBMITTED' },
  { label: 'UNDER REVIEW', value: 'UNDER_REVIEW' },
  { label: 'SHORTLISTED', value: 'SHORTLISTED' },
  { label: 'INTERVIEW', value: 'INTERVIEW' },
  { label: 'ACCEPTED', value: 'ACCEPTED' },
  { label: 'REJECTED', value: 'REJECTED' },
  { label: 'WITHDRAWN', value: 'WITHDRAWN' },
];

export function ApplicationDossierClient({
  initialApplication,
  initialNotes,
  initialHistory,
  adminId,
}: {
  initialApplication: CareerApplication;
  initialNotes: ApplicationNote[];
  initialHistory: ApplicationStatusHistory[];
  adminId: string;
}) {
  const [application, setApplication] = useState<CareerApplication>(initialApplication);
  const [notes, setNotes] = useState<ApplicationNote[]>(initialNotes);
  const [history, setHistory] = useState<ApplicationStatusHistory[]>(initialHistory);

  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(initialApplication.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const candidateFullName =
    (application.full_name && application.full_name !== application.email ? application.full_name : null) ||
    (application.name && application.name !== application.email ? application.name : null) ||
    (application.applicant_name && application.applicant_name !== application.email ? application.applicant_name : null) ||
    (application.profiles?.full_name && application.profiles.full_name !== application.email ? application.profiles.full_name : null) ||
    (application.profiles?.name && application.profiles.name !== application.email ? application.profiles.name : null) ||
    (application.applicant?.full_name && application.applicant.full_name !== application.email ? application.applicant.full_name : null) ||
    (application.applicant?.name && application.applicant.name !== application.email ? application.applicant.name : null) ||
    'Anonymous Applicant';

  const applicantEmail =
    application.email ||
    application.applicant_email ||
    application.contact_email ||
    application.profiles?.email ||
    (application.profiles as any)?.contact_email ||
    application.applicant?.email ||
    (application.applicant as any)?.contact_email ||
    (application as any).user_email ||
    application.auth_user?.email ||
    'No email provided';

  const resumeLink =
    application.resume_url ||
    application.resume ||
    application.cv_url ||
    application.file_url ||
    (application.resume_path && (application.resume_path.startsWith('http://') || application.resume_path.startsWith('https://'))
      ? application.resume_path
      : null) ||
    null;

  const handleStatusChange = async () => {
    if (selectedStatus === application.status) return;

    setIsUpdatingStatus(true);
    setStatusMessage(null);

    try {
      const res = await updateApplicationStatusAction(
        application.id,
        selectedStatus,
        application.status,
        candidateFullName !== 'Anonymous Applicant' ? candidateFullName : 'Applicant'
      );

      if (res?.error) {
        alert(res.error);
        return;
      }

      setApplication((prev) => ({ ...prev, status: selectedStatus }));
      setHistory((prev) => [
        {
          id: String(Date.now()),
          application_id: application.id,
          changed_by: adminId,
          old_status: application.status,
          new_status: selectedStatus,
          created_at: new Date().toISOString(),
          changer: { full_name: 'Current Admin' } as any,
        },
        ...prev,
      ]);

      setStatusMessage('Status updated. [ EMAIL DISPATCH: System email provider not configured yet. Status recorded internally. ]');
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const noteText = newNote.trim();
    if (!noteText || isAddingNote) return;

    setIsAddingNote(true);
    setNoteError(null);

    try {
      const res = await addApplicationNoteAction(application.id, noteText);
      if (res?.error) {
        setNoteError(res.error);
        return;
      }

      setNotes((prev) => [
        {
          id: res?.id || String(Date.now()),
          application_id: application.id,
          author_id: adminId,
          content: noteText,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author: { full_name: 'Admin' } as any,
        },
        ...prev,
      ]);
      setNewNote('');
    } catch (err: any) {
      console.error('Failed to add note:', err);
      setNoteError(err?.message || 'Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await deleteApplicationNoteAction(noteId, application.id);
      if (res?.error) {
        alert(res.error);
        return;
      }
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete note');
    }
  };

  const handleFetchSignedResume = async () => {
    if (!application.resume_path) return;
    setIsLoadingResume(true);
    setResumeError(null);

    try {
      const signedUrl = await getSecureResumeDownloadUrl(application.resume_path);
      setResumeUrl(signedUrl);
      window.open(signedUrl, '_blank');
    } catch (err: any) {
      setResumeError('Could not generate signed download token or file missing.');
    } finally {
      setIsLoadingResume(false);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span className="technical-label" style={{ color: 'var(--accent-primary)' }}>
              CANDIDATE DOSSIER
            </span>
            <Badge variant={application.status === 'ACCEPTED' ? 'live' : 'default'} useBrackets>
              {application.status}
            </Badge>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              REF: {application.reference_code}
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1,
              marginTop: 'var(--space-2)',
            }}
          >
            {candidateFullName}
          </h1>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginTop: 'var(--space-1)' }}>
            APPLYING FOR: {application.role?.title || 'Open Position'} ({application.role?.department || 'GENERAL'})
          </span>
        </div>

        <Link href="/admin/applications" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
          ← Back to All Applications
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)', alignItems: 'start' }}>
        {/* Left Column: Application Details & Responses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* Section: Applicant Details */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-6)',
            }}
          >
            <span className="technical-label" style={{ color: 'var(--text-dim)', display: 'block', marginBottom: 'var(--space-3)' }}>
              01 // APPLICANT PROFILE
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>FULL NAME</span>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{candidateFullName}</p>
              </div>

              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>EMAIL ADDRESS</span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {applicantEmail !== 'No email provided' ? (
                    <a
                      href={`mailto:${applicantEmail}`}
                      className="text-white hover:underline"
                      style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}
                    >
                      {applicantEmail}
                    </a>
                  ) : (
                    'No email provided'
                  )}
                </p>
              </div>

              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>BUILDER HANDLE</span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {(application.applicant?.username || application.profiles?.username) ? (
                    <Link href={`/builders/${application.applicant?.username || application.profiles?.username}`} target="_blank" style={{ color: 'var(--accent-primary-hover)', textDecoration: 'underline' }}>
                      @{application.applicant?.username || application.profiles?.username} ↗
                    </Link>
                  ) : (
                    'Not claimed'
                  )}
                </p>
              </div>

              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>SUBMISSION DATE</span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {new Date(application.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Section: Written Responses */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)',
            }}
          >
            <span className="technical-label" style={{ color: 'var(--text-dim)' }}>
              02 // WRITTEN SUBMISSION
            </span>

            <div>
              <span className="technical-label" style={{ color: 'var(--accent-primary-hover)', display: 'block', marginBottom: 'var(--space-2)' }}>
                WHY DO YOU WANT TO BUILD AT MADE?
              </span>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {application.cover_message}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
              <span className="technical-label" style={{ color: 'var(--accent-primary-hover)', display: 'block', marginBottom: 'var(--space-2)' }}>
                WHAT HAVE YOU BUILT? (KEY PROJECTS & ARCHITECTURE)
              </span>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {application.what_they_build}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
              <span className="technical-label" style={{ color: 'var(--accent-primary-hover)', display: 'block', marginBottom: 'var(--space-2)' }}>
                TECHNICAL BACKGROUND & EXPERIENCE
              </span>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {application.experience}
              </p>
            </div>

            {application.additional_information && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
                <span className="technical-label" style={{ color: 'var(--accent-primary-hover)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  ADDITIONAL CONTEXT
                </span>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {application.additional_information}
                </p>
              </div>
            )}
          </div>

          {/* Section: Links & Verified Artifacts */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-6)',
            }}
          >
            <span className="technical-label" style={{ color: 'var(--text-dim)', display: 'block', marginBottom: 'var(--space-4)' }}>
              03 // EXTERNAL ARTIFACTS & REPOSITORIES
            </span>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              {application.github_url ? (
                <Button href={application.github_url} variant="outline" size="sm" target="_blank">
                  GitHub Profile ↗
                </Button>
              ) : (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>No GitHub provided</span>
              )}

              {application.linkedin_url && (
                <Button href={application.linkedin_url} variant="outline" size="sm" target="_blank">
                  LinkedIn Profile ↗
                </Button>
              )}

              {application.portfolio_url && (
                <Button href={application.portfolio_url} variant="outline" size="sm" target="_blank">
                  Live Portfolio / Build ↗
                </Button>
              )}
            </div>

            {/* Resume Private Access */}
            <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
              <span className="technical-label" style={{ color: 'var(--accent-primary-hover)', display: 'block', marginBottom: 'var(--space-2)' }}>
                SECURE RESUME ACCESS
              </span>
              {resumeLink ? (
                <div>
                  <a
                    href={resumeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-wider uppercase bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white rounded transition-colors"
                  >
                    <span>View Resume Document ↗</span>
                  </a>
                </div>
              ) : application.resume_path ? (
                <div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                    Resume is encrypted in private storage. Authorized Super Admins can generate a 5-minute signed token.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleFetchSignedResume}
                    disabled={isLoadingResume}
                  >
                    {isLoadingResume ? 'Generating Token...' : 'Open Signed Resume ↗'}
                  </Button>
                  {resumeError && (
                    <span style={{ display: 'block', color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: 'var(--space-2)' }}>
                      {resumeError}
                    </span>
                  )}
                </div>
              ) : (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  No uploaded resume attached.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status Workflow, Notes, and History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* Status Decision Matrix */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--accent-primary)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-6)',
            }}
          >
            <span className="technical-label" style={{ color: 'var(--accent-primary-hover)', display: 'block', marginBottom: 'var(--space-4)' }}>
              DECISION // APPLICATION STAGE
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label className="technical-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                  STAGE
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-technical)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleStatusChange}
                disabled={isUpdatingStatus || selectedStatus === application.status}
                style={{ width: '100%' }}
              >
                {isUpdatingStatus ? 'Updating Stage...' : 'Commit Status Update'}
              </Button>

              {statusMessage && (
                <div
                  style={{
                    backgroundColor: 'rgba(30, 90, 255, 0.1)',
                    border: '1px solid var(--accent-primary)',
                    borderRadius: 'var(--radius-xs)',
                    padding: 'var(--space-3)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-primary-hover)',
                    lineHeight: 1.5,
                  }}
                >
                  {statusMessage}
                </div>
              )}
            </div>
          </div>

          {/* Internal Private Notes */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span className="technical-label" style={{ color: 'var(--text-dim)' }}>
                INTERNAL ADMIN NOTES
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-dim)' }}>
                PRIVATE // APPLICANT BLOCKED
              </span>
            </div>

            <form onSubmit={handleAddNote} style={{ marginBottom: 'var(--space-4)' }}>
              <Textarea
                placeholder="Add private evaluation notes, interview questions, or assessment remarks..."
                value={newNote}
                onChange={(e) => {
                  setNewNote(e.target.value);
                  if (noteError) setNoteError(null);
                }}
                disabled={isAddingNote}
              />
              {noteError && (
                <div
                  style={{
                    color: 'var(--color-danger)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    marginTop: 'var(--space-2)',
                  }}
                >
                  {noteError}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={isAddingNote || !newNote.trim()}
                >
                  {isAddingNote ? 'SAVING...' : '+ ADD NOTE'}
                </Button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {notes.length === 0 ? (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  No internal notes recorded yet.
                </span>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-technical)',
                      borderRadius: 'var(--radius-xs)',
                      padding: 'var(--space-3) var(--space-4)',
                    }}
                  >
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                      {note.content}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-dim)' }}>
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-danger)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.625rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status Timeline History */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-technical)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-6)',
            }}
          >
            <span className="technical-label" style={{ color: 'var(--text-dim)', display: 'block', marginBottom: 'var(--space-4)' }}>
              STATUS TIMELINE & AUDIT
            </span>

            {history.length === 0 ? (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Initial submission state.
              </span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {history.map((h) => (
                  <div
                    key={h.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      paddingBottom: 'var(--space-2)',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{h.old_status || 'INIT'}</span>
                      <span style={{ color: 'var(--text-dim)', margin: '0 4px' }}>→</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{h.new_status}</span>
                    </div>
                    <span style={{ color: 'var(--text-dim)' }}>
                      {new Date(h.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
