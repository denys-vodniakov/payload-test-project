import { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

interface GlassCardProps {
  children: ReactNode
  className?: string
  blur?: 'sm' | 'md' | 'lg'
  style?: React.CSSProperties
}

export default function GlassCard({ children, className, blur = 'md', style }: GlassCardProps) {
  const blurClass = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  }[blur]

  return (
    <div
      className={cn(
        'bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl',
        blurClass,
        className,
      )}
      style={style}
    >
      {children}
    </div>
  )
}
