import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Opportunities // 2026 | MADE',
  description: 'Curated hackathons, research fellowships, competition tracks, and grant programs for student engineers.',
};

export default function OpportunitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
