import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

type isAdmin = (args: AccessArgs<User>) => boolean

export const isAdmin: isAdmin = ({ req: { user } }) => {
  if (!user) return false
  
  // Check if user has admin role
  // Users with role === 'admin' are admins
  const userObj = user as any
  return userObj.role === 'admin'
}
