'use client'

import { useTheme } from '@/providers/Theme'
import { cn } from '@/utilities/ui'

interface AnimatedGradientBackgroundProps {
  children?: React.ReactNode
  className?: string
  variant?: 'aurora' | 'mesh' | 'waves' | 'particles'
}

export function AnimatedGradientBackground({
  children,
  className,
  variant = 'aurora',
}: AnimatedGradientBackgroundProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={cn('relative min-h-screen overflow-hidden', className)}>
      {/* Background layer */}
      <div className="fixed inset-0 -z-10">
        {variant === 'aurora' && <AuroraBackground isDark={isDark} />}
        {variant === 'mesh' && <MeshBackground isDark={isDark} />}
        {variant === 'waves' && <WavesBackground isDark={isDark} />}
        {variant === 'particles' && <ParticlesBackground isDark={isDark} />}
      </div>

      {/* Content */}
      {children}
    </div>
  )
}

function AuroraBackground({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={cn(
        'absolute inset-0 transition-colors duration-500',
        isDark
          ? 'bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100',
      )}
    >
      {/* Aurora blobs */}
      <div
        className={cn(
          'absolute top-0 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] animate-aurora-1',
          isDark ? 'bg-blue-600/30' : 'bg-blue-400/40',
        )}
      />
      <div
        className={cn(
          'absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full blur-[100px] animate-aurora-2',
          isDark ? 'bg-purple-600/25' : 'bg-purple-400/30',
        )}
      />
      <div
        className={cn(
          'absolute bottom-0 left-1/3 w-[700px] h-[400px] rounded-full blur-[120px] animate-aurora-3',
          isDark ? 'bg-indigo-600/20' : 'bg-indigo-300/35',
        )}
      />
      <div
        className={cn(
          'absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] animate-aurora-4',
          isDark ? 'bg-cyan-600/20' : 'bg-cyan-300/30',
        )}
      />

      {/* Noise overlay for texture */}
      <div
        className={cn(
          'absolute inset-0 opacity-50',
          isDark ? 'bg-noise-dark' : 'bg-noise-light',
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: isDark ? 0.05 : 0.03,
        }}
      />
    </div>
  )
}

function MeshBackground({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={cn(
        'absolute inset-0 transition-colors duration-500',
        isDark
          ? 'bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950'
          : 'bg-gradient-to-br from-white via-gray-50 to-slate-100',
      )}
    >
      {/* Mesh gradient blobs */}
      <div
        className={cn(
          'absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-[100px] animate-mesh-1',
          isDark
            ? 'bg-gradient-to-br from-blue-600/40 to-purple-600/40'
            : 'bg-gradient-to-br from-blue-300/50 to-purple-300/50',
        )}
      />
      <div
        className={cn(
          'absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-[100px] animate-mesh-2',
          isDark
            ? 'bg-gradient-to-tl from-cyan-600/30 to-emerald-600/30'
            : 'bg-gradient-to-tl from-cyan-300/40 to-emerald-300/40',
        )}
      />
      <div
        className={cn(
          'absolute top-1/4 right-1/4 w-1/2 h-1/2 rounded-full blur-[80px] animate-mesh-3',
          isDark
            ? 'bg-gradient-to-br from-rose-600/25 to-orange-600/25'
            : 'bg-gradient-to-br from-rose-300/35 to-orange-300/35',
        )}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px),
                           linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  )
}

function WavesBackground({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={cn(
        'absolute inset-0 transition-colors duration-500',
        isDark
          ? 'bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950'
          : 'bg-gradient-to-b from-blue-50 via-white to-indigo-50',
      )}
    >
      {/* Animated waves */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[60%] animate-wave"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill={isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.15)'}
          d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-full h-[50%] animate-wave-slow"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill={isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.12)'}
          d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,171,864,186.7C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-full h-[40%] animate-wave-slower"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill={isDark ? 'rgba(6, 182, 212, 0.06)' : 'rgba(6, 182, 212, 0.1)'}
          d="M0,256L48,261.3C96,267,192,277,288,261.3C384,245,480,203,576,197.3C672,192,768,224,864,213.3C960,203,1056,149,1152,138.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  )
}

function ParticlesBackground({ isDark }: { isDark: boolean }) {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div
      className={cn(
        'absolute inset-0 transition-colors duration-500',
        isDark
          ? 'bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950'
          : 'bg-gradient-to-br from-slate-50 via-white to-blue-50',
      )}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={cn(
            'absolute rounded-full',
            isDark ? 'bg-white/10' : 'bg-blue-500/20',
          )}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

export default AnimatedGradientBackground
