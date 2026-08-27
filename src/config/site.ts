/**
 * MADE — Centralized Platform & Founder Configuration
 * Single source of truth for platform copy, brand statements, founder profile, and navigation hierarchy.
 * Direction B (The Blueprint Laboratory)
 */

export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface FounderConfig {
  name: string;
  title: string;
  subtitle: string;
  role: string;
  tagline: string;
  intro: string;
  biography: string[];
  vision: string;
  image: string;
  technicalFocus: string[];
  socials: {
    github: string;
    linkedin: string;
    portfolio: string;
  };
  selectedWorks: {
    title: string;
    role: string;
    description: string;
    year: string;
  }[];
}

export interface LinguisticSystem {
  heroTagline: string;
  projectsHeading: string;
  buildersHeading: string;
  opportunitiesHeading: string;
  careersHeading: string;
  builtByHeading: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  heroSupportingLine: string;
  linguisticSystem: LinguisticSystem;
  metadataTags: string[];
  description: string;
  url: string;
  ogImage: string;
  socials: {
    linkedin: string;
  };
  founder: FounderConfig;
  navItems: NavItem[];
  authNavItems: {
    signIn: NavItem;
    joinMade: NavItem;
  };
  departments: {
    id: string;
    name: string;
    description: string;
  }[];
  projectStatuses: {
    id: string;
    code: string;
    label: string;
    description: string;
  }[];
  opportunityCategories: string[];
}

export const siteConfig: SiteConfig = {
  name: "MADE",
  tagline: "MAKE SOMETHING REAL.",
  heroSupportingLine: "A platform for students who build, collaborate and ship real things.",
  
  linguisticSystem: {
    heroTagline: "MAKE SOMETHING REAL.",
    projectsHeading: "WHAT'S BEING MADE?",
    buildersHeading: "WHO'S MAKING IT?",
    opportunitiesHeading: "FIND YOUR NEXT MOVE",
    careersHeading: "WHAT WILL YOU MAKE WITH US?",
    builtByHeading: "WHO BUILT MADE?",
  },

  metadataTags: [
    "MADE / 2026",
    "STUDENT BUILDERS",
    "PROJECTS / PEOPLE / OPPORTUNITIES",
  ],

  description:
    "MADE is a student-powered innovation platform for people who want to learn, collaborate, build projects, find opportunities, and turn ideas into something real.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/brand/og-image.png",
  socials: {
    linkedin: "https://www.linkedin.com/company/made-community",
  },

  founder: {
    name: "Sanket Tiwari",
    title: "FOUNDER & PRESIDENT",
    subtitle: "MADE",
    role: "Founder & President — MADE",
    tagline: "Talented students shouldn't need to wait for permission to start building.",
    intro: "I started MADE around a simple idea: talented students shouldn't need to wait for permission to start building.",
    technicalFocus: [
      "AI & Deep Learning",
      "Distributed Systems",
      "Full-Stack Web Architecture",
    ],
    biography: [
      "I started MADE around a simple idea: talented students shouldn't need to wait for permission to start building.",
      "Traditional university structures are exceptional for foundational theory, but modern technology moves at the speed of individual initiative and collective craft. MADE exists to bridge the chasm between classroom theory and shipping production-grade systems.",
      "Our mission is to cultivate an environment where ambitious builders find each other, collaborate on high-stakes ideas, and launch things that matter into the real world.",
    ],
    vision:
      "A self-sustaining ecosystem of student engineers, designers, researchers, and creators who learn by shipping real systems.",
    image: "/images/founder/sanket-tiwari.jpg",
    socials: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      portfolio: "https://portfolio.example.com",
    },
    selectedWorks: [
      {
        title: "MADE Innovation Platform",
        role: "Founder & President",
        description: "Student collaboration network and technical project incubator.",
        year: "2026",
      },
    ],
  },

  navItems: [
    { label: "Projects", href: "/projects" },
    { label: "Builders", href: "/builders" },
    { label: "Opportunities", href: "/opportunities" },
    { label: "Events", href: "/events" },
    { label: "Careers", href: "/careers" },
    { label: "Built By", href: "/built-by" },
  ],

  authNavItems: {
    signIn: { label: "Sign In", href: "/login" },
    joinMade: { label: "Join MADE", href: "/signup" },
  },

  departments: [
    { id: "ai_ml", name: "AI / ML", description: "Machine learning systems, computer vision, and LLM integrations." },
    { id: "software_engineering", name: "Software Engineering", description: "Full-stack systems, distributed backends, and performance web apps." },
    { id: "product", name: "Product", description: "Product strategy, user research, roadmap execution, and feature architecture." },
    { id: "design", name: "Design", description: "Editorial visual systems, UI/UX architecture, typography, and interaction craft." },
    { id: "community", name: "Community", description: "Builder engagement, hackathon orchestration, and partner outreach." },
    { id: "content_media", name: "Content & Media", description: "Technical editorial writing, project spotlights, and visual media." },
    { id: "research", name: "Research", description: "Applied computer science, systems benchmarking, and academic whitepapers." },
    { id: "operations", name: "Operations", description: "Platform governance, resource allocation, and program logistics." },
  ],

  projectStatuses: [
    { id: "IDEA", code: "[IDEA]", label: "Idea", description: "Concept definition and initial architectural brainstorming." },
    { id: "BUILDING", code: "[BUILDING]", label: "Building", description: "Active engineering and iterative prototyping." },
    { id: "PROTOTYPE", code: "[PROTOTYPE]", label: "Prototype", description: "Functional alpha ready for user testing and feedback." },
    { id: "LIVE", code: "[LIVE]", label: "Live", description: "Deployed in production and accessible to the public." },
    { id: "OPEN_SOURCE", code: "[OPEN SOURCE]", label: "Open Source", description: "Publicly accessible repository accepting community contributions." },
  ],

  opportunityCategories: [
    "Hackathons",
    "Collaborations",
    "Open roles",
    "Events",
  ],
};
