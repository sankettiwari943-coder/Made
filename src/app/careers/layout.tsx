import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers // What Will You Make With Us? | MADE',
  description: 'Open roles, engineering fellowships, and leadership positions for students who want to build and ship real systems.',
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
