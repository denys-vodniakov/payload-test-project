import { getMeUser } from '@/utilities/getMeUser'
import { ProfileClient } from './ProfileClient'
import type { DashboardUser } from '../types'

export default async function ProfilePage() {
  const { user } = await getMeUser({ nullUserRedirect: '/login' })
  return <ProfileClient initialUser={user as DashboardUser} />
}
