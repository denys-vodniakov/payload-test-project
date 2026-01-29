'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  User,
  ChevronDown,
  Settings,
} from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const { user, isAuthenticated, logout, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const getAvatarUrl = () => {
    if (user?.avatar && typeof user.avatar === 'object' && 'url' in user.avatar) {
      return user.avatar.url as string
    }
    return null
  }

  const getUserInitial = () => {
    return user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-4 items-center">
        {/* CMS Nav Items */}
        {navItems.map(({ link }, i) => (
          <CMSLink key={i} {...link} appearance="link" />
        ))}

        {/* Divider */}
        {navItems.length > 0 && <div className="w-px h-6 bg-border" />}

        {/* Auth Section */}
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        ) : isAuthenticated ? (
          <div className="relative" ref={userMenuRef}>
            {/* User Avatar Button */}
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                {getAvatarUrl() ? (
                  <Image
                    src={getAvatarUrl()!}
                    alt={user?.name || 'Avatar'}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-medium">{getUserInitial()}</span>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Profile Settings
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-border pt-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      logout()
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/register">
                <UserPlus className="h-4 w-4 mr-2" />
                Register
              </Link>
            </Button>
          </div>
        )}

        <ThemeSelector />
      </nav>

      {/* Mobile Menu Button */}
      <div className="flex md:hidden items-center gap-2">
        <ThemeSelector />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-[280px] bg-background border-l border-border shadow-xl animate-in slide-in-from-right duration-300">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-semibold text-foreground">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Section (if authenticated) */}
            {isAuthenticated && user && (
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 relative">
                    {getAvatarUrl() ? (
                      <Image
                        src={getAvatarUrl()!}
                        alt={user?.name || 'Avatar'}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-white text-lg font-medium">{getUserInitial()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{user?.name || 'User'}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="py-4">
              {/* CMS Nav Items */}
              {navItems.length > 0 && (
                <div className="px-4 mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Navigation
                  </p>
                  <div className="space-y-1">
                    {navItems.map(({ link }, i) => (
                      <div key={i} className="py-2">
                        <CMSLink {...link} appearance="link" className="text-foreground hover:text-primary" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auth/Dashboard Section */}
              <div className="px-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Account
                </p>

                {loading ? (
                  <div className="py-2">
                    <div className="h-10 bg-muted rounded animate-pulse" />
                  </div>
                ) : isAuthenticated ? (
                  <div className="space-y-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 py-3 px-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 py-3 px-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        logout()
                      }}
                      className="flex items-center gap-3 w-full py-3 px-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/login">
                        <LogIn className="h-4 w-4 mr-3" />
                        Login
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600">
                      <Link href="/register">
                        <UserPlus className="h-4 w-4 mr-3" />
                        Register
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
