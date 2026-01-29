'use client'

import { useEffect, useRef, useState } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      return // Don't run animation if user prefers reduced motion
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let isRunning = true
    let particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }> = []

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      particles = []
      const isMobile = window.innerWidth < 768
      // Significantly reduce particles on mobile for better performance
      const baseCount = isMobile ? 15 : Math.floor((canvas.width * canvas.height) / 15000)
      const particleCount = Math.min(baseCount, isMobile ? 20 : 80) // Cap particles

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3, // Slower movement
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.4 + 0.1,
        })
      }
    }

    const animate = () => {
      if (!isRunning || !isVisible) {
        animationId = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const isMobile = window.innerWidth < 768
      const connectionDistance = isMobile ? 60 : 100 // Shorter connections on mobile

      particles.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`
        ctx.fill()

        // Draw connections (skip on mobile for better performance)
        if (!isMobile) {
          // Only check a subset of particles for connections to reduce O(n²)
          const checkLimit = Math.min(index + 20, particles.length)
          for (let j = index + 1; j < checkLimit; j++) {
            const otherParticle = particles[j]
            const dx = particle.x - otherParticle.x
            const dy = particle.y - otherParticle.y
            const distSq = dx * dx + dy * dy // Avoid sqrt for performance

            if (distSq < connectionDistance * connectionDistance) {
              const distance = Math.sqrt(distSq)
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(otherParticle.x, otherParticle.y)
              ctx.strokeStyle = `rgba(59, 130, 246, ${0.08 * (1 - distance / connectionDistance)})`
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          }
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    // Intersection Observer to pause animation when not visible
    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0].isIntersecting)
      },
      { threshold: 0 }
    )
    observer.observe(canvas)

    resizeCanvas()
    createParticles()
    animate()

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        resizeCanvas()
        createParticles()
      }, 250)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      isRunning = false
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
      cancelAnimationFrame(animationId)
      observer.disconnect()
    }
  }, [isVisible])

  // Check for reduced motion preference - don't render canvas at all
  const [shouldRender, setShouldRender] = useState(true)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setShouldRender(!prefersReducedMotion)
  }, [])

  if (!shouldRender) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  )
}
