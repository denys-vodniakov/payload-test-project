import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import type { User } from '../payload-types'
import { getServerSideURL } from './getURL'

export const getMeUser = async (args?: {
  nullUserRedirect?: string
  validUserRedirect?: string
}): Promise<{
  token: string
  user: User
}> => {
  const { nullUserRedirect, validUserRedirect } = args || {}
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  // If no token and we have a redirect URL, redirect immediately
  if (!token && nullUserRedirect) {
    redirect(nullUserRedirect)
  }

  let user: User | null = null

  if (token) {
    try {
      const baseUrl = getServerSideURL() || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      const meUserReq = await fetch(`${baseUrl}/api/users/me`, {
        headers: {
          Authorization: `JWT ${token}`,
        },
        cache: 'no-store',
      })

      if (meUserReq.ok) {
        const contentType = meUserReq.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const data = await meUserReq.json()
          user = data.user || null
        }
      }
    } catch (error) {
      console.error('[getMeUser] Error fetching user:', error)
      // Continue - user will be null
    }
  }

  if (validUserRedirect && user) {
    redirect(validUserRedirect)
  }

  if (nullUserRedirect && !user) {
    redirect(nullUserRedirect)
  }

  // At this point we have a valid user (or would have redirected)
  return {
    token: token!,
    user: user!,
  }
}
