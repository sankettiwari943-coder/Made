import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { Logo } from '../brand/Logo';
import { Container } from './Container';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.topGrid}>
          {/* Brand Column: MADE + MAKE SOMETHING REAL. */}
          <div className={styles.brandCol}>
            <Logo variant="wordmark" height={26} />
            <p className={styles.tagline}>{siteConfig.tagline}</p>
            <p className={styles.description}>{siteConfig.description}</p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className={styles.colTitle}>Platform</h4>
            <ul className={styles.linkList}>
              {siteConfig.navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h4 className={styles.colTitle}>Disciplines</h4>
            <ul className={styles.linkList}>
              {siteConfig.departments.slice(0, 5).map((dept) => (
                <li key={dept.id}>
                  <Link href={`/careers#${dept.id}`} className={styles.footerLink}>
                    {dept.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social / Connect Links */}
          <div>
            <h4 className={styles.colTitle}>Connect</h4>
            <ul className={styles.linkList}>
              <li>
                <a
                  href={siteConfig.founder.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  GitHub ↗
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.founder.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  LinkedIn ↗
                </a>
              </li>
              <li>
                <Link href="/careers" className={styles.footerLink}>
                  Careers ↗
                </Link>
              </li>
              <li>
                <Link href="/built-by" className={styles.footerLink}>
                  Built By ↗
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Metadata: MADE — 2026 */}
        <div className={styles.bottomBar}>
          <span className={styles.metadataText}>MADE — 2026 // ALL RIGHTS RESERVED</span>
          <p className={styles.founderNote}>
            Initiated by{' '}
            <Link href="/built-by" className={styles.founderLink}>
              {siteConfig.founder.name}
            </Link>{' '}
            ({siteConfig.founder.title} — {siteConfig.founder.subtitle})
          </p>
        </div>
      </Container>
    </footer>
  );
};
