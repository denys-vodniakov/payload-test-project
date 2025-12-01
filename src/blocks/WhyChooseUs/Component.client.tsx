'use client'

import React from 'react'
import {
  Zap,
  Rocket,
  Target,
  Diamond,
  Star,
  Flame,
  BookOpen,
  Trophy,
  Settings,
  Lightbulb,
  Palette,
  Lock,
  Smartphone,
  Globe,
  Users,
} from 'lucide-react'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

interface Feature {
  title: string
  description: string
  icon: string
  gradientColor: string
  id?: string
}

interface WhyChooseUsClientProps {
  title: string
  subtitle?: string | null
  description?: any
  features: Feature[]
  layout: 'grid' | 'list' | 'carousel'
  columns: number
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  rocket: Rocket,
  target: Target,
  diamond: Diamond,
  star: Star,
  fire: Flame,
  book: BookOpen,
  trophy: Trophy,
  settings: Settings,
  lightbulb: Lightbulb,
  palette: Palette,
  lock: Lock,
  smartphone: Smartphone,
  globe: Globe,
  users: Users,
}

const gradientMap: Record<string, { from: string; to: string }> = {
  blue: { from: 'rgb(59, 130, 246)', to: 'rgb(147, 51, 234)' }, // blue-500 to purple-600
  green: { from: 'rgb(34, 197, 94)', to: 'rgb(37, 99, 235)' }, // green-500 to blue-600
  purple: { from: 'rgb(168, 85, 247)', to: 'rgb(219, 39, 119)' }, // purple-500 to pink-600
  orange: { from: 'rgb(249, 115, 22)', to: 'rgb(220, 38, 38)' }, // orange-500 to red-600
  pink: { from: 'rgb(236, 72, 153)', to: 'rgb(168, 85, 247)' }, // pink-500 to purple-600
  yellow: { from: 'rgb(234, 179, 8)', to: 'rgb(249, 115, 22)' }, // yellow-500 to orange-600
  cyan: { from: 'rgb(6, 182, 212)', to: 'rgb(37, 99, 235)' }, // cyan-500 to blue-600
  red: { from: 'rgb(239, 68, 68)', to: 'rgb(236, 72, 153)' }, // red-500 to pink-600
}


export const WhyChooseUsClient: React.FC<WhyChooseUsClientProps> = ({
  title,
  subtitle,
  description,
  features,
  layout,
  columns,
}) => {
  if (!features || features.length === 0) {
    return null
  }

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
    5: 'md:grid-cols-3 lg:grid-cols-5',
    6: 'md:grid-cols-3 lg:grid-cols-6',
  }

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">{subtitle}</p>
          )}
          {description && (
            <div className="max-w-3xl mx-auto text-muted-foreground">
              <RichText data={description} enableGutter={false} enableProse={true} />
            </div>
          )}
        </div>

        {/* Features */}
        {layout === 'grid' && (
          <div
            className={cn(
              'grid grid-cols-1 gap-6 md:gap-8',
              gridCols[columns as keyof typeof gridCols] || gridCols[4],
            )}
          >
            {features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || Zap

              return (
                <div
                  key={feature.id || index}
                  className="group relative animate-in fade-in slide-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Card */}
                  <div className="relative h-full bg-card/80 backdrop-blur-sm border-2 border-border/50 rounded-2xl p-6 md:p-8 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
                    {/* Gradient overlay on hover */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl"
                      style={{
                        background: `linear-gradient(to bottom right, ${gradientMap[feature.gradientColor]?.from}20, ${gradientMap[feature.gradientColor]?.to}20)`,
                      }}
                    />

                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none rounded-2xl" />

                    {/* Icon */}
                    <div
                      className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300"
                      style={{
                        background: `linear-gradient(to bottom right, ${gradientMap[feature.gradientColor]?.from}, ${gradientMap[feature.gradientColor]?.to})`,
                      }}
                    >
                      <IconComponent className="h-8 w-8 text-white" />
                      {/* Glow effect */}
                      <div
                        className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(to bottom right, ${gradientMap[feature.gradientColor]?.from}, ${gradientMap[feature.gradientColor]?.to})`,
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed line-clamp-3">
                        {feature.description}
                      </p>
                    </div>

                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {layout === 'list' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || Zap

              return (
                <div
                  key={feature.id || index}
                  className="group relative animate-in fade-in slide-in-left"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex gap-6 bg-card/80 backdrop-blur-sm border-2 border-border/50 rounded-2xl p-6 transition-all duration-500 hover:border-primary/50 hover:shadow-xl">
                    {/* Icon */}
                    <div
                      className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                      style={{
                        background: `linear-gradient(to bottom right, ${gradientMap[feature.gradientColor]?.from}, ${gradientMap[feature.gradientColor]?.to})`,
                      }}
                    >
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {layout === 'carousel' && (
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide pb-4">
              <div className="flex gap-6 min-w-max">
                {features.map((feature, index) => {
                  const IconComponent = iconMap[feature.icon] || Zap
                  const gradient = gradientMap[feature.gradientColor] || gradientMap.blue

                  return (
                    <div
                      key={feature.id || index}
                      className="group relative flex-shrink-0 w-80 animate-in fade-in slide-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative h-full bg-card/80 backdrop-blur-sm border-2 border-border/50 rounded-2xl p-6 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
                        {/* Gradient overlay */}
                        <div
                          className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl"
                          style={{
                            background: `linear-gradient(to bottom right, ${gradientMap[feature.gradientColor]?.from}20, ${gradientMap[feature.gradientColor]?.to}20)`,
                          }}
                        />

                        {/* Icon */}
                        <div
                          className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300"
                          style={{
                            background: `linear-gradient(to bottom right, ${gradientMap[feature.gradientColor]?.from}, ${gradientMap[feature.gradientColor]?.to})`,
                          }}
                        >
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                          <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                            {feature.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed line-clamp-4">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

