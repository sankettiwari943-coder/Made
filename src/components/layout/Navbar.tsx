'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { Logo } from '../brand/Logo';
import { Container } from './Container';
import { Button } from '../ui/Button';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen(!mobileOpen);
  const closeMobile = () => setMobileOpen(false);

  return (
    <header className={styles.navbarWrapper}>
      <Container>
        <div className={styles.inner}>
          {/* Left: Brand Wordmark */}
          <div className={styles.leftGroup}>
            <Link href="/" className={styles.logoLink} onClick={closeMobile} aria-label="MADE Homepage">
              <Logo variant="wordmark" height={26} priority />
            </Link>

            {/* Public Navigation */}
            <nav className={styles.navLinks} aria-label="Main Navigation">
              {siteConfig.navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(styles.navLink, isActive && styles.active)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Sign in / Join MADE */}
          <div className={styles.rightActions}>
            <Button
              href={siteConfig.authNavItems.signIn.href}
              variant="ghost"
              size="sm"
            >
              {siteConfig.authNavItems.signIn.label}
            </Button>
            <Button
              href={siteConfig.authNavItems.joinMade.href}
              variant="primary"
              size="sm"
              showArrow
            >
              {siteConfig.authNavItems.joinMade.label}
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileMenuBtn}
            onClick={toggleMobile}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className={styles.mobileDrawer}>
          <div className={styles.mobileNavLinks}>
            {siteConfig.navItems.map((item, idx) => {
              const isActive = pathname === item.href;
              const indexStr = `0${idx + 1}`;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(styles.mobileNavLink, isActive && styles.active)}
                  onClick={closeMobile}
                >
                  <span>{item.label}</span>
                  <span className={styles.mobileNavIndex}>{indexStr} //</span>
                </Link>
              );
            })}
          </div>

          <div className={styles.mobileAuthActions}>
            <Button
              href={siteConfig.authNavItems.signIn.href}
              variant="secondary"
              size="md"
              onClick={closeMobile}
            >
              {siteConfig.authNavItems.signIn.label}
            </Button>
            <Button
              href={siteConfig.authNavItems.joinMade.href}
              variant="primary"
              size="md"
              showArrow
              onClick={closeMobile}
            >
              {siteConfig.authNavItems.joinMade.label}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
