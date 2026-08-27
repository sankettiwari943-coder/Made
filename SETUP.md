# MADE — SUPABASE INFRASTRUCTURE & AUTHENTICATION SETUP

This guide details how to configure Supabase Auth, run database schema migrations, enable Row Level Security (RLS), and test the authentication workflow for **MADE**.

---

## 1. Create a Supabase Project

1. Go to [database.new](https://database.new) and create a new project.
2. Select your preferred AWS / GCP region.
3. Securely record your **Database Password**.

---

## 2. Obtain API Credentials

In the Supabase Dashboard:
1. Navigate to **Project Settings** → **API**.
2. Copy the **Project URL** (`https://<project-id>.supabase.co`).
3. Copy the **Project API Keys**:
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` *(Server-side only — never expose to client)*.

Create your local `.env.local` file:
```bash
cp .env.example .env.local
```
Fill in the values:
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-id>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
```

---

## 3. Configure Supabase Authentication

In the Supabase Dashboard:
1. Navigate to **Authentication** → **URL Configuration**.
2. Set **Site URL**: `http://localhost:3000` (or your production URL).
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/reset-password`
   - `https://your-domain.com/auth/callback` (for production)
4. Navigate to **Authentication** → **Email Templates**:
   - **Confirm signup**: Ensure redirect contains `{{ .ConfirmationURL }}`.
   - **Reset password**: Ensure redirect contains `{{ .ConfirmationURL }}`.

---

## 4. Run Database Schema Migrations

Navigate to **SQL Editor** in your Supabase dashboard and execute the following migrations in order:

### 1. Auth & Initial Profiles Migration
📁 `supabase/migrations/01_auth_and_profiles.sql`
* `public.user_role` enum (`'MEMBER'`, `'ADMIN'`, `'SUPER_ADMIN'`).
* `public.profiles` table linked to `auth.users(id) ON DELETE CASCADE`.
* Automated `on_auth_user_created` trigger on `auth.users`.
* `protect_profile_roles()` trigger preventing privilege escalation.
* Strict Row Level Security policies.

### 2. Phase 3: Extended Profiles, Skills, Onboarding & Storage
📁 `supabase/migrations/02_profiles_and_onboarding.sql`
* Extended columns: `primary_focus`, `github_url`, `linkedin_url`, `portfolio_url`, `location`, `current_build`, `onboarding_completed`.
* Relational tables: `public.profile_skills` and `public.profile_interests`.
* Storage bucket: `avatars` with RLS policies allowing authenticated users to upload and manage their own avatars.

### 3. Phase 4: Projects, Technologies, Collaboration & Build Logs
📁 `supabase/migrations/03_projects_and_build_logs.sql`
* Enums: `project_status`, `project_member_role`, `invitation_status`.
* Tables: `public.projects`, `public.project_technologies`, `public.project_members`, `public.project_updates` (Build Logs), `public.project_invitations`.
* Automatic Owner trigger (`on_project_created_owner`).
* Storage bucket: `project-covers` (5MB limit, JPG/PNG/WEBP/GIF) with public read and authenticated owner write policies.
* Strict Row Level Security policies protecting public projects, owner modifications, collaborator build logs, and private repositories.

### 4. Phase 5: Opportunities, Events, Application Tracking & RSVPs
📁 `supabase/migrations/04_opportunities_and_events.sql`
* Enums: `opportunity_type`, `opportunity_status`, `opportunity_app_status`, `event_type`, `event_rsvp_status`.
* Tables: `public.opportunities`, `public.saved_opportunities`, `public.opportunity_applications`, `public.events`, `public.event_rsvps`.
* Admin helper function: `public.is_admin()`.
* Strict Row Level Security policies:
  * Public read for published opportunities and events.
  * Admin / Super Admin write permissions for platform-wide listings.
  * Private, user-isolated read/write permissions for saved opportunities, personal application tracking, and event RSVPs.

### 5. Phase 6: Careers, Applications, Private Resumes & Admin Reviews
📁 `supabase/migrations/05_careers_and_applications.sql`
* Enums: `role_department`, `career_role_status`, `application_status`.
* Tables: `public.career_roles`, `public.career_applications`, `public.application_notes`, `public.application_status_history`.
* Storage bucket: `resumes` (Private bucket, 10MB limit, PDF/DOCX) with owner and admin access policies.
* Automatic Audit History trigger (`on_app_status_changed`).
* Strict Row Level Security policies:
  * Public read for published open roles.
  * Private read/write for applicant's own applications.
  * Admin-only access to internal evaluation notes.
  * Admin review and status update permissions.

---

## 5. Authentication & Onboarding Flow Overview

```
SIGN UP (/signup)
    ↓
EMAIL VERIFICATION (/verify-email)
    ↓
PKCE CALLBACK (/auth/callback)
    ↓
ONBOARDING WIZARD (/onboarding)
    ↓
PROFILE CREATED (public.profiles & profile_skills)
    ↓
DASHBOARD (/dashboard)
```

| Route | Function | Protection Level |
| :--- | :--- | :--- |
| `/signup` | Full name, email, password validation via Zod | Public |
| `/verify-email` | Check inbox screen with 60s cooldown resend | Public |
| `/auth/callback` | Exchanges PKCE code for SSR session cookie | Public |
| `/login` | Authenticates email & password | Public |
| `/forgot-password` | Requests password reset link | Public |
| `/reset-password` | Updates password for authenticated session | Authenticated |
| `/onboarding` | 3-step progressive builder onboarding wizard | Authenticated (Incomplete onboarding) |
| `/dashboard` | Authenticated builder workspace | Authenticated (Onboarded only) |
| `/profile/edit` | Profile credentials & skills editor | Authenticated |
| `/settings` | Account, Security, Password change & Sign Out | Authenticated |
| `/builders` | Public searchable directory of student builders | Public |
| `/builders/[username]` | Public builder portfolio view | Public |

---

## 6. Testing Authentication & Row Level Security

### Automated Route Verification
Run the route auditor:
```bash
node -e "const urls=['/login','/signup','/verify-email','/onboarding','/dashboard','/profile/edit','/settings','/builders','/builders/sanket']; Promise.all(urls.map(u=>fetch('http://localhost:3000'+u).then(r=>console.log(u.padEnd(25)+': '+r.status))))"
```

### Manual Verification Checklist
1. **Unauthenticated Dashboard Access:** Navigate to `/dashboard` $\longrightarrow$ redirected to `/login?next=/dashboard`.
2. **New User Registration:** Register at `/signup` $\longrightarrow$ redirected to `/verify-email`.
3. **Verify Email:** Click verification link $\longrightarrow$ `/auth/callback` establishes SSR cookies and redirects to `/onboarding`.
4. **Complete Onboarding:** Fill in 3 steps (Identity, Craft & Skills, Builds & Links) $\longrightarrow$ redirected to `/dashboard`.
5. **Public Profile Search:** Visit `/builders` $\longrightarrow$ search and view `/builders/[username]`.
6. **Profile Editing:** Update bio or skills at `/profile/edit` $\longrightarrow$ see `CHANGES SAVED`.
7. **Sign Out:** Click `SIGN OUT` $\longrightarrow$ session cleared, redirected to `/`.
