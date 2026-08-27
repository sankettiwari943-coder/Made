import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects // Engineering Directory | MADE',
  description: 'Explore public engineering builds, software prototypes, and open source systems shipped by student builders across the MADE network.',
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
