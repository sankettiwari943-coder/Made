import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import styles from './Logo.module.css';

export interface LogoProps {
  variant?: 'full' | 'wordmark' | 'mark';
  height?: number;
  width?: number;
  className?: string;
  priority?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  height = 28,
  width,
  className,
  priority = false,
}) => {
  // Official Standalone 'A' Mark directly extracted from the approved MADE logo
  if (variant === 'mark') {
    const markSize = height;
    return (
      <div
        className={clsx(styles.logoWrapper, className)}
        style={{ width: markSize, height: markSize }}
      >
        <Image
          src="/brand/a-mark.png"
          alt="MADE Mark"
          width={markSize}
          height={markSize}
          priority={priority}
          className={styles.imageLogo}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  }

  // Full official MADE Wordmark
  const calculatedWidth = width || (variant === 'full' ? Math.round(height * 4) : Math.round(height * 2.8));

  return (
    <div className={clsx(styles.logoWrapper, className)}>
      <Image
        src="/brand/logo.png"
        alt="MADE — Make something real"
        width={calculatedWidth}
        height={height}
        priority={priority}
        className={styles.imageLogo}
        style={{ height: `${height}px`, width: 'auto' }}
      />
    </div>
  );
};
