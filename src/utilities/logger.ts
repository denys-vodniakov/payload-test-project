/**
 * Enhanced logger for Vercel production environment
 * Logs are automatically collected by Vercel and visible in Dashboard → Logs
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production'
  private isVercel = Boolean(process.env.VERCEL)

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  info(message: string, context?: LogContext) {
    const formatted = this.formatMessage('info', message, context)
    console.log(formatted)
    
    // In production/Vercel, also log structured data
    if (this.isProduction || this.isVercel) {
      console.log(JSON.stringify({
        level: 'info',
        message,
        timestamp: new Date().toISOString(),
        ...context,
      }))
    }
  }

  warn(message: string, context?: LogContext) {
    const formatted = this.formatMessage('warn', message, context)
    console.warn(formatted)
    
    if (this.isProduction || this.isVercel) {
      console.warn(JSON.stringify({
        level: 'warn',
        message,
        timestamp: new Date().toISOString(),
        ...context,
      }))
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorDetails = error instanceof Error 
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : { error: String(error) }

    const formatted = this.formatMessage('error', message, { ...errorDetails, ...context })
    console.error(formatted)
    
    if (this.isProduction || this.isVercel) {
      console.error(JSON.stringify({
        level: 'error',
        message,
        timestamp: new Date().toISOString(),
        ...errorDetails,
        ...context,
      }))
    }
  }

  debug(message: string, context?: LogContext) {
    if (!this.isProduction) {
      const formatted = this.formatMessage('debug', message, context)
      console.log(formatted)
    }
  }
}

export const logger = new Logger()

