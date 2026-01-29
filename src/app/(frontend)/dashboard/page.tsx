import { getMeUser } from '@/utilities/getMeUser'
import { getServerSideURL } from '@/utilities/getURL'
import { DashboardClient } from './DashboardClient'
import type { Stats, DashboardUser } from './types'

export default async function DashboardPage() {
  const { token, user } = await getMeUser({ nullUserRedirect: '/login' })

  const base = getServerSideURL() || 'http://localhost:3000'
  const res = await fetch(`${base}/api/user/stats`, {
    headers: { Cookie: `payload-token=${token}` },
    cache: 'no-store',
  })

  const fallback: Stats = {
    totalTests: 0,
    passedTests: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    categoryStats: [],
    recentResults: [],
  }
  const stats: Stats = res.ok ? await res.json() : fallback
  return <DashboardClient initialStats={stats} initialUser={user as DashboardUser} />
}
