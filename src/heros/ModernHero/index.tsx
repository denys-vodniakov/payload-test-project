'use client'

import React, { useEffect, useState } from 'react'
import type { Page } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import dynamic from 'next/dynamic'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import GlassCard from '@/components/GlassCard'
import GradientText from '@/components/GradientText'
import { Trophy, Zap, Clock, Users, BookOpen, Star } from 'lucide-react'

const AnimatedBackground = dynamic(
  () => import('@/components/AnimatedBackground'),
  { ssr: false }
)

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  zap: Zap,
  clock: Clock,
  users: Users,
  book: BookOpen,
  star: Star,
}

export const ModernHero: React.FC<Page['hero']> = ({
  richText,
  links,
  subtitle,
  showStats,
  stats,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [canShowBackground, setCanShowBackground] = useState(false)
  useEffect(() => {
    setCanShowBackground(window.innerWidth >= 768)
  }, [])
  return (
    <div className="bg-gradient-to-br from-background via-background/95 to-background/90 relative transition-colors duration-300">
      {/* AnimatedBackground only on desktop - chunk not loaded on mobile */}
      {canShowBackground && <AnimatedBackground />}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5" />
        <div className="relative max-w-7xl mx-auto text-center">
          {/* No animation delay on main content for better LCP */}
          <div className="mb-8">
            {richText && (
              <div className="mb-6">
                <div className="text-5xl md:text-7xl font-bold [&_.payload-richtext]:text-inherit [&_.payload-richtext]:font-inherit [&_.payload-richtext]:mb-0 [&_.payload-richtext_*]:text-inherit [&_.payload-richtext_*]:font-inherit">
                  <GradientText
                    className="block [&_*]:bg-clip-text [&_*]:text-transparent"
                    gradient="blue-purple"
                    animate={!isMobile}
                  >
                    <RichText data={richText} enableGutter={false} enableProse={false} />
                  </GradientText>
                </div>
              </div>
            )}
            {subtitle && (
              <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-muted-foreground dark:text-muted-foreground/90 transition-colors duration-300 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {Array.isArray(links) && links.length > 0 && (
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-in fade-in slide-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              {links.map(({ link }, i) => {
                return <CMSLink key={i} {...link} className="text-lg px-8 py-4" />
              })}
            </div>
          )}

          {/* Stats - content-visibility on mobile to improve LCP */}
          {showStats && stats && stats.length > 0 && (
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-in fade-in slide-in-up content-visibility-auto-mobile"
              style={{ animationDelay: '0.4s' }}
            >
              {stats.map((stat, index) => {
                const IconComponent = iconMap[stat.icon || 'trophy'] || Trophy
                const iconColors = [
                  'text-yellow-500',
                  'text-blue-500',
                  'text-green-500',
                  'text-purple-500',
                  'text-pink-500',
                  'text-orange-500',
                ]

                return (
                  <GlassCard
                    key={stat.id || index}
                    className="p-6 shadow-lg md:animate-float"
                    style={!isMobile ? { animationDelay: `${index * 0.5}s` } : undefined}
                  >
                    <IconComponent
                      className={`h-12 w-12 ${iconColors[index % iconColors.length]} mx-auto mb-4`}
                    />
                    <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </GlassCard>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
