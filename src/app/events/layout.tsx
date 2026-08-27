import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events // Gatherings & Build Nights | MADE',
  description: 'Where builders meet. Code reviews, hackathons, demo days, and technical workshops across the MADE collective.',
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
