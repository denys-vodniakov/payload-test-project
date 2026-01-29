'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Check } from 'lucide-react'
import { cn } from '@/utilities/ui'

interface StepperProps {
  steps: number
  currentStep: number
  onStepClick?: (step: number) => void
  completedSteps?: number[]
  className?: string
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  completedSteps = [],
  className,
}: StepperProps) {
  const getStepStatus = (step: number) => {
    if (completedSteps.includes(step)) return 'complete'
    if (step === currentStep) return 'active'
    return 'inactive'
  }

  return (
    <div className={cn('flex items-center justify-center w-full', className)}>
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {Array.from({ length: steps }, (_, i) => {
          const step = i + 1
          const status = getStepStatus(step)

          return (
            <div key={step} className="flex items-center">
              <motion.button
                onClick={() => onStepClick?.(step)}
                className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all duration-300 cursor-pointer',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  status === 'active' &&
                    'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110',
                  status === 'complete' && 'bg-green-500 text-white',
                  status === 'inactive' &&
                    'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600',
                )}
                whileHover={{ scale: status === 'active' ? 1.1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {status === 'complete' ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.3, type: 'spring' }}
                    >
                      <Check className="h-5 w-5" />
                    </motion.div>
                  ) : status === 'active' ? (
                    <motion.div
                      key="dot"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-3 h-3 rounded-full bg-white"
                    />
                  ) : (
                    <motion.span
                      key="number"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {step}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Pulse animation for active step */}
                {status === 'active' && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-blue-500/30"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>

              {/* Connector line */}
              {step < steps && (
                <div className="relative w-2 h-0.5 mx-0.5 bg-gray-300 dark:bg-gray-600 overflow-hidden rounded-full">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-purple-600"
                    initial={{ width: 0 }}
                    animate={{
                      width: completedSteps.includes(step) ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Compact version for many steps
export function StepperCompact({
  steps,
  currentStep,
  onStepClick,
  completedSteps = [],
  incorrectSteps = [],
  className,
}: StepperProps & { incorrectSteps?: number[] }) {
  const getStepStatus = (step: number) => {
    if (incorrectSteps.includes(step)) return 'incorrect'
    if (completedSteps.includes(step)) return 'complete'
    if (step === currentStep) return 'active'
    return 'inactive'
  }

  return (
    <div className={cn('flex flex-wrap justify-center gap-2', className)}>
      {Array.from({ length: steps }, (_, i) => {
        const step = i + 1
        const status = getStepStatus(step)

        return (
          <motion.button
            key={step}
            onClick={() => onStepClick?.(step)}
            className={cn(
              'relative flex items-center justify-center w-9 h-9 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              status === 'active' &&
                'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg ring-2 ring-blue-400/50',
              status === 'complete' &&
                'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md',
              status === 'incorrect' &&
                'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md',
              status === 'inactive' &&
                'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700',
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            {status === 'complete' ? (
              <Check className="h-4 w-4" />
            ) : status === 'incorrect' ? (
              <span className="text-xs">✗</span>
            ) : (
              step
            )}

            {/* Active indicator */}
            {status === 'active' && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-400"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

export default Stepper
