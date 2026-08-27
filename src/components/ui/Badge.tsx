import React from 'react';
import clsx from 'clsx';
import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'idea' | 'building' | 'prototype' | 'live' | 'opensource' | 'accent';
  showDot?: boolean;
  useBrackets?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  showDot = false,
  useBrackets = true,
  children,
  className,
  ...props
}) => {
  return (
    <span className={clsx(styles.badge, styles[variant], className)} {...props}>
      {showDot && <span className={styles.dot} />}
      {useBrackets && <span className={styles.bracket}>[</span>}
      <span>{children}</span>
      {useBrackets && <span className={styles.bracket}>]</span>}
    </span>
  );
};
