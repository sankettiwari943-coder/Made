'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      className,
      id,
      type,
      showPasswordToggle = true,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const resolvedType = isPasswordField && showPasswordToggle
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={styles.inputContainer}>
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={clsx(
              styles.input,
              error && styles.error,
              isPasswordField && showPasswordToggle && styles.passwordInput,
              className
            )}
            aria-invalid={!!error}
            {...props}
          />
          {isPasswordField && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={clsx(
                styles.passwordToggle,
                'absolute right-3 top-1/2 -translate-y-1/2 z-20 text-zinc-700 hover:text-black dark:text-zinc-400 dark:hover:text-white p-1 transition-colors flex items-center justify-center'
              )}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 stroke-[2]" size={16} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4 stroke-[2]" size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          )}
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
        {!error && helperText && <span className={styles.helperText}>{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
