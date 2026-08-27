import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  isExternal?: boolean;
  target?: string;
  rel?: string;
  showArrow?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  href,
  isExternal = false,
  target,
  rel,
  showArrow = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const content = (
    <>
      <span>{children}</span>
      {showArrow && <span className={styles.arrow}>→</span>}
    </>
  );

  const buttonClasses = clsx(
    styles.button,
    styles[variant],
    styles[size],
    className
  );

  if (href) {
    const isTargetBlank = target === '_blank' || isExternal;
    return (
      <Link
        href={href}
        className={buttonClasses}
        target={target || (isExternal ? '_blank' : undefined)}
        rel={rel || (isTargetBlank ? 'noopener noreferrer' : undefined)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button className={buttonClasses} disabled={disabled} {...props}>
      {content}
    </button>
  );
};
