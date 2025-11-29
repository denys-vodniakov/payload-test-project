/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'
import { logger } from '@/utilities/logger'
import './custom.scss'

// Log admin panel access
if (typeof window === 'undefined') {
  logger.info('Admin panel layout loaded', {
    nodeEnv: process.env.NODE_ENV,
    hasPayloadSecret: Boolean(process.env.PAYLOAD_SECRET),
    hasPostgresUrl: Boolean(process.env.POSTGRES_URL),
    hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  })
}

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  try {
    logger.info('Admin server function called', {
      path: (args as any)?.path || 'unknown',
    })

    return await handleServerFunctions({
      ...args,
      config,
      importMap,
    })
  } catch (error) {
    logger.error('Error in admin server function', error, {
      path: (args as any)?.path || 'unknown',
    })
    throw error
  }
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
