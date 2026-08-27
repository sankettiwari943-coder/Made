# MADE — Student Innovation Platform

> **Make something real.**

MADE is a student-powered innovation platform designed for people who want to learn, collaborate, build projects, find opportunities, and turn ideas into something real.

---

## 1. Philosophy

The entire platform revolves around a singular cadence:

$$\textbf{PEOPLE} \longrightarrow \textbf{IDEAS} \longrightarrow \textbf{BUILD} \longrightarrow \textbf{SHIP}$$

* **Discover people**: Connect with designers, engineers, researchers, and creators.
* **Find collaborators**: Assemble interdisciplinary teams with designated role slots.
* **Create & showcase projects**: Document the build journey from idea to prototype and live product.
* **Seize opportunities**: Curated directory of hackathons, open source bounties, and fellowships.
* **Participate in events**: Build sprints, demo days, and technical workshops.
* **Build with MADE**: Apply to contribute directly to the platform's engineering and design disciplines.
* **Human-centered identity**: A dedicated celebration of craft and student agency.

---

## 2. Design Ethos

**EDITORIAL $\times$ TECHNOLOGY $\times$ STUDENT CULTURE**

MADE departs from typical college club portals and AI-generated SaaS templates:
* **No generic AI tropes:** Zero neon halos, floating 3D spheres, random glassmorphism, or robotic stock imagery.
* **Editorial Discipline:** Strong typographic hierarchy (*Instrument Serif* paired with *Inter / Manrope*), deliberate whitespace, tactile borders, and asymmetrical editorial layouts.
* **Authenticity:** Real authentication, server-enforced security, verified email flows, and genuine project histories.

---

## 3. Technology Stack

* **Frontend:** Next.js 14+ (App Router), TypeScript, Bespoke Vanilla CSS Token System.
* **Database & Auth:** Supabase PostgreSQL with strict Row Level Security (RLS) and `@supabase/ssr` HttpOnly session cookies.
* **Security:** Server-enforced Role-Based Access Control (`USER`, `BUILDER`, `MENTOR`, `MODERATOR`, `ADMIN`, `SUPER_ADMIN`), with a secure one-time founder bootstrap protocol.
* **Email Infrastructure:** Resend API for transactional, branded emails.
* **Media Storage:** Supabase Storage with strict MIME-type and payload size guardrails.

---

## 4. Getting Started

Follow the step-by-step infrastructure and local development guide in [SETUP.md](SETUP.md).

```bash
# 1. Clone & Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Start local development server
npm run dev
```

---

## 5. Repository Structure

```
MADE/
├── public/                 # Static brand assets, favicons, portrait imagery
├── src/
│   ├── app/                # Next.js App Router (Public, Auth, Dashboard, Admin)
│   ├── components/         # Modular UI, Layout, Cards, Forms, and Editorial blocks
│   ├── config/             # Centralized site & founder metadata (site.ts)
│   ├── lib/                # Supabase SSR clients, Resend email templates, Zod schemas
│   └── styles/             # Design tokens, typography, reset, and layout systems
├── supabase/               # SQL migrations, RLS policies, and admin bootstrap script
├── .env.example            # Environment variables template
├── README.md               # Project overview & philosophy
└── SETUP.md                # Infrastructure & setup guide
```

---

## 6. License & Ownership

Built for the **MADE** community. Founded by **Sanket Tiwari**.
