'use client'
import { useTheme } from '@/providers/Theme'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import type { Footer } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { SocialIcon, type SocialPlatform } from '@/components/SocialIcon/SocialIcon'

interface FooterClientProps {
  data: Footer
}

export const FooterClient: React.FC<FooterClientProps> = ({ data }) => {
  const { theme: globalTheme } = useTheme()

  // Initialize theme from data-theme attribute (set by InitTheme script before hydration)
  // This ensures server and client render the same initial value
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    // InitTheme script runs beforeInteractive, so data-theme should be set by the time component mounts
    if (typeof window !== 'undefined') {
      const dataTheme = document.documentElement.getAttribute('data-theme')
      if (dataTheme === 'dark' || dataTheme === 'light') {
        return dataTheme as 'light' | 'dark'
      }
      // Fallback to system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    // Server-side: use default theme
    return 'light'
  })

  // Sync with globalTheme from provider
  useEffect(() => {
    if (globalTheme && globalTheme !== currentTheme) {
      setCurrentTheme(globalTheme)
    }
  }, [globalTheme, currentTheme])

  // Listen for data-theme attribute changes (when theme changes externally)
  useEffect(() => {
    const checkTheme = () => {
      const dataTheme = document.documentElement.getAttribute('data-theme')
      if (dataTheme === 'dark' || dataTheme === 'light') {
        setCurrentTheme(dataTheme as 'light' | 'dark')
      }
    }

    // Check immediately
    checkTheme()

    // Listen for changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Get logo theme - use globalTheme or current theme
  const logoTheme: 'dark' | 'light' | null =
    globalTheme ||
    (currentTheme === 'dark' || currentTheme === 'light' ? currentTheme : null) ||
    null

  // Get logo data
  const logoData = data.logo || null

  const navBlocks = (data?.navBlocks || []) as Array<{
    title: string
    links?: Array<{
      link: {
        type?: 'reference' | 'custom' | null
        newTab?: boolean | null
        reference?: any
        url?: string | null
        label: string
      }
      id?: string | null
    }> | null
    id?: string | null
  }>
  const copyright = data?.copyright || '© 2025'
  const description = data?.description || ''
  const socialLinks = data?.socialLinks || []

  const isDark = currentTheme === 'dark'

  return (
    <footer
      suppressHydrationWarning
      className={`mt-auto border-t transition-all duration-500 ${
        isDark
          ? 'bg-gradient-to-b from-card via-card/95 to-card/90 border-border/50 backdrop-blur-xl'
          : 'bg-gradient-to-b from-background via-background/95 to-background/90 border-border backdrop-blur-xl'
      }`}
    >
      {/* Main footer content */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Logo and description section */}
          <div className="md:col-span-4 animate-in fade-in slide-in-left">
            <Link
              href="/"
              className="inline-block mb-6 transition-transform duration-300 hover:scale-105 hover-lift"
            >
              <Logo
                loading="eager"
                priority="high"
                className="max-w-[9.375rem] w-full"
                logo={logoData}
                theme={logoTheme}
              />
            </Link>
            {description && (
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? 'text-muted-foreground' : 'text-muted-foreground'
                }`}
              >
                {description}
              </p>
            )}
          </div>

          {/* Navigation blocks */}
          {navBlocks.length > 0 && (
            <div className="md:col-span-8 md:col-start-5 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              {navBlocks.map((block, blockIndex: number) => (
                <div
                  key={block.id || blockIndex}
                  className="animate-in fade-in slide-in-up"
                  style={{ animationDelay: `${100 + blockIndex * 50}ms` }}
                >
                  <h3
                    className={`text-sm font-semibold mb-4 uppercase tracking-wider ${
                      isDark ? 'text-foreground' : 'text-foreground'
                    }`}
                  >
                    {block.title || 'Navigation'}
                  </h3>
                  <nav className="flex flex-col gap-3">
                    {block.links && block.links.length > 0 ? (
                      block.links.map((navItem, i: number) => {
                        const { link } = navItem
                        return (
                          <div
                            key={navItem.id || i}
                            className="animate-in fade-in slide-in-left"
                            style={{ animationDelay: `${blockIndex * 100 + i * 50}ms` }}
                          >
                            <CMSLink
                              className={`group text-sm transition-all duration-300 hover:text-primary hover:translate-x-1 inline-flex items-center gap-2 relative ${
                                isDark
                                  ? 'text-muted-foreground hover:text-foreground'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              {...link}
                            >
                              <span className="absolute left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                              <span className="relative z-10">{link.label || link.url}</span>
                            </CMSLink>
                          </div>
                        )
                      })
                    ) : (
                      <span
                        className={`text-sm ${isDark ? 'text-muted-foreground' : 'text-muted-foreground'}`}
                      >
                        No links
                      </span>
                    )}
                  </nav>
                </div>
              ))}
            </div>
          )}

          {/* Social links and settings - Second row under first navigation block */}
          <div
            className="md:col-span-8 md:col-start-1 md:row-start-2 animate-in fade-in slide-in-right flex flex-col md:flex-row md:items-start gap-8 md:gap-12"
            style={{ animationDelay: '200ms' }}
          >
            {/* Settings */}
            <div className="flex-shrink-0">
              <h3
                className={`text-sm font-semibold mb-4 uppercase tracking-wider ${
                  isDark ? 'text-foreground' : 'text-foreground'
                }`}
              >
                Settings
              </h3>
              <div
                className={`inline-flex items-center gap-3 rounded-lg transition-all duration-300`}
              >
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isDark ? 'text-muted-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Theme:
                </span>
                <ThemeSelector />
              </div>
            </div>
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex-1 w-full">
                <h3
                  className={`text-sm font-semibold mb-4 uppercase tracking-wider ${
                    isDark ? 'text-foreground' : 'text-foreground'
                  }`}
                >
                  Follow Us
                </h3>
                <div className="flex flex-row flex-wrap gap-2">
                  {socialLinks.map((social, i) => (
                    <a
                      key={i}
                      href={social.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                        isDark
                          ? 'bg-card/50 border border-border/50 hover:bg-card/70 hover:border-primary/50'
                          : 'bg-muted/30 border border-border/30 hover:bg-muted/50 hover:border-primary/50'
                      }`}
                      aria-label={social.label || social.platform}
                    >
                      <span className="text-primary group-hover:scale-110 transition-transform">
                        <SocialIcon platform={social.platform as SocialPlatform} />
                      </span>
                      {social.label && (
                        <span
                          className={`text-xs font-medium ${
                            isDark
                              ? 'text-muted-foreground group-hover:text-foreground'
                              : 'text-muted-foreground group-hover:text-foreground'
                          }`}
                        >
                          {social.label}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar with copyright */}
      <div
        suppressHydrationWarning
        className={`border-t transition-all duration-500 ${
          isDark
            ? 'border-border/50 bg-card/30 backdrop-blur-xl'
            : 'border-border/30 bg-background/50 backdrop-blur-xl'
        }`}
      >
        <div className="container py-6">
          <div
            className="flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <div
              className={`text-sm flex items-center gap-2 ${
                isDark ? 'text-muted-foreground' : 'text-muted-foreground'
              }`}
            >
              <span>{copyright}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">All rights reserved</span>
            </div>
            <div
              className={`flex items-center gap-4 text-xs ${
                isDark ? 'text-muted-foreground' : 'text-muted-foreground'
              }`}
            >
              <span>
                Made with ❤️ by{' '}
                <Link
                  href="https://www.linkedin.com/in/denys-vodniakov/"
                  target="_blank"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Denys Vodniakov
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
