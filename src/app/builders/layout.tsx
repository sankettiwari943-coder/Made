import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Builders // Directory | MADE',
  description: 'Discover student engineers, researchers, designers, and operators learning by building real systems.',
};

export default function BuildersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
