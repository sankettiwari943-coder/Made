'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  User as UserIcon,
  Settings as SettingsIcon,
  Shield,
  LogOut,
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '../brand/Logo';
import { Container } from './Container';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, profile, role, isAdmin, isSuperAdmin, isLoading, signOut } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);
  const toggleUserDropdown = () => setUserDropdownOpen((prev) => !prev);
  const closeUserDropdown = () => setUserDropdownOpen(false);

  // Close menus on route change
  useEffect(() => {
    closeMobile();
    closeUserDropdown();
  }, [pathname]);

  // Click outside to dismiss user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeUserDropdown();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeUserDropdown();
        closeMobile();
      }
    };

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userDropdownOpen]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    closeUserDropdown();
    closeMobile();
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  // Get Initials for avatar fallback
  const getInitials = (): string => {
    const name = profile?.full_name || user?.user_metadata?.full_name;
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    const email = user?.email;
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'BD';
  };

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0] : 'Builder');

  const username =
    profile?.username ||
    (user?.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_') : 'builder');

  const userRole = role || 'MEMBER';

  return (
    <header className={styles.navbarWrapper}>
      <Container>
        <div className={styles.inner}>
          {/* Left: Brand Wordmark */}
          <div className={styles.leftGroup}>
            <Link
              href="/"
              className={styles.logoLink}
              onClick={closeMobile}
              aria-label="MADE Homepage"
            >
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

          {/* Right: Authentication Actions */}
          <div className={styles.rightActions}>
            {isLoading ? (
              // Neutral loading placeholder to prevent layout shifts or unauthenticated flash
              <div className={styles.authSkeleton} aria-hidden="true" />
            ) : user ? (
              // Authenticated View
              <div className={styles.authActiveGroup}>
                {/* Admin Quick Indicator */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={clsx(
                      styles.adminShortcut,
                      pathname.startsWith('/admin') && styles.adminShortcutActive
                    )}
                    title="Control Center (Admin Access)"
                  >
                    <span className={styles.adminPulseDot} />
                    <span className={styles.adminLabel}>ADMIN</span>
                  </Link>
                )}

                {/* Workspace / Dashboard CTA */}
                <Button
                  href="/workspace"
                  variant="primary"
                  size="sm"
                  showArrow
                >
                  WORKSPACE
                </Button>

                {/* User Dropdown Trigger */}
                <div className={styles.userMenuContainer} ref={dropdownRef}>
                  <button
                    type="button"
                    className={clsx(
                      styles.userProfileTrigger,
                      userDropdownOpen && styles.userProfileTriggerActive
                    )}
                    onClick={toggleUserDropdown}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                    aria-label="User account menu"
                  >
                    <div className={styles.avatarBox}>
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={displayName}
                          className={styles.avatarImg}
                        />
                      ) : (
                        <span className={styles.avatarInitials}>{getInitials()}</span>
                      )}
                    </div>
                    <span className={styles.userTriggerName}>{displayName}</span>
                    <ChevronDown
                      size={14}
                      className={clsx(
                        styles.dropdownChevron,
                        userDropdownOpen && styles.dropdownChevronOpen
                      )}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className={styles.userDropdown} role="menu">
                      {/* User Header Details */}
                      <div className={styles.dropdownHeader}>
                        <div className={styles.dropdownIdentity}>
                          <div className={styles.dropdownAvatarBox}>
                            {profile?.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt={displayName}
                                className={styles.avatarImg}
                              />
                            ) : (
                              <span className={styles.avatarInitials}>{getInitials()}</span>
                            )}
                          </div>
                          <div className={styles.dropdownUserMeta}>
                            <span className={styles.dropdownFullName}>{displayName}</span>
                            <span className={styles.dropdownUsername}>@{username}</span>
                          </div>
                        </div>
                        <div className={styles.dropdownRoleRow}>
                          <Badge
                            variant={userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' ? 'accent' : 'default'}
                            useBrackets
                          >
                            {userRole}
                          </Badge>
                        </div>
                      </div>

                      {/* Dropdown Links */}
                      <div className={styles.dropdownSection}>
                        <Link
                          href="/dashboard"
                          className={clsx(
                            styles.dropdownItem,
                            pathname === '/dashboard' && styles.dropdownItemActive
                          )}
                          onClick={closeUserDropdown}
                          role="menuitem"
                        >
                          <LayoutDashboard size={15} />
                          <span>Dashboard / Workspace</span>
                        </Link>

                        <Link
                          href="/profile/edit"
                          className={clsx(
                            styles.dropdownItem,
                            pathname === '/profile/edit' && styles.dropdownItemActive
                          )}
                          onClick={closeUserDropdown}
                          role="menuitem"
                        >
                          <UserIcon size={15} />
                          <span>Edit Builder Profile</span>
                        </Link>

                        <Link
                          href="/settings"
                          className={clsx(
                            styles.dropdownItem,
                            pathname === '/settings' && styles.dropdownItemActive
                          )}
                          onClick={closeUserDropdown}
                          role="menuitem"
                        >
                          <SettingsIcon size={15} />
                          <span>Account & Security</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            className={clsx(
                              styles.dropdownItem,
                              styles.adminDropdownItem,
                              pathname.startsWith('/admin') && styles.dropdownItemActive
                            )}
                            onClick={closeUserDropdown}
                            role="menuitem"
                          >
                            <Shield size={15} />
                            <span>Control Center [ADMIN]</span>
                          </Link>
                        )}
                      </div>

                      <div className={styles.dropdownDivider} />

                      {/* Sign Out Trigger */}
                      <div className={styles.dropdownSection}>
                        <button
                          type="button"
                          className={styles.dropdownSignOutBtn}
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          role="menuitem"
                        >
                          <LogOut size={15} />
                          <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Unauthenticated View
              <div className={styles.authGuestGroup}>
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
            )}
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

          {/* Mobile Authenticated / Unauthenticated Area */}
          <div className={styles.mobileAuthActions}>
            {isLoading ? (
              <div className={styles.authSkeleton} />
            ) : user ? (
              <div className={styles.mobileUserCard}>
                <div className={styles.mobileUserHeader}>
                  <div className={styles.avatarBox}>
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className={styles.avatarImg}
                      />
                    ) : (
                      <span className={styles.avatarInitials}>{getInitials()}</span>
                    )}
                  </div>
                  <div>
                    <div className={styles.mobileUserName}>{displayName}</div>
                    <div className={styles.mobileUserHandle}>@{username}</div>
                  </div>
                  <Badge variant={isAdmin ? 'accent' : 'default'} useBrackets>
                    {userRole}
                  </Badge>
                </div>

                <div className={styles.mobileUserLinks}>
                  <Link
                    href="/workspace"
                    className={clsx(
                      styles.mobileSubLink,
                      (pathname.startsWith('/dashboard') || pathname.startsWith('/workspace')) && styles.active
                    )}
                    onClick={closeMobile}
                  >
                    <LayoutDashboard size={16} />
                    <span>Workspace Dashboard</span>
                  </Link>

                  <Link
                    href="/profile/edit"
                    className={clsx(
                      styles.mobileSubLink,
                      pathname === '/profile/edit' && styles.active
                    )}
                    onClick={closeMobile}
                  >
                    <UserIcon size={16} />
                    <span>Edit Profile</span>
                  </Link>

                  <Link
                    href="/settings"
                    className={clsx(
                      styles.mobileSubLink,
                      pathname === '/settings' && styles.active
                    )}
                    onClick={closeMobile}
                  >
                    <SettingsIcon size={16} />
                    <span>Settings & Security</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={clsx(
                        styles.mobileSubLink,
                        styles.mobileAdminSubLink,
                        pathname.startsWith('/admin') && styles.active
                      )}
                      onClick={closeMobile}
                    >
                      <Shield size={16} />
                      <span>Admin Control Center</span>
                    </Link>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="md"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  style={{ width: '100%', marginTop: 'var(--space-3)' }}
                >
                  <LogOut size={16} style={{ marginRight: '6px' }} />
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                </Button>
              </div>
            ) : (
              <div className={styles.mobileGuestButtons}>
                <Button
                  href={siteConfig.authNavItems.signIn.href}
                  variant="secondary"
                  size="md"
                  onClick={closeMobile}
                  className={styles.mobileCtaBtn}
                >
                  {siteConfig.authNavItems.signIn.label}
                </Button>
                <Button
                  href={siteConfig.authNavItems.joinMade.href}
                  variant="primary"
                  size="md"
                  showArrow
                  onClick={closeMobile}
                  className={styles.mobileCtaBtn}
                >
                  {siteConfig.authNavItems.joinMade.label}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
