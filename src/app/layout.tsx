import React from 'react';
import type { Metadata, Viewport } from 'next';
import { siteConfig } from '@/config/site';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'MADE',
    'Student Innovation',
    'Student Projects',
    'Tech Builders',
    'Hackathons',
    'Collaborative Engineering',
    'Sanket Tiwari',
  ],
  authors: [{ name: siteConfig.founder.name, url: siteConfig.founder.socials.portfolio }],
  creator: siteConfig.founder.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/brand/a-mark.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0c0c0e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
