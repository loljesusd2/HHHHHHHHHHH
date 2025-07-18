
import { Metadata } from 'next'
import { AuthGuard } from '@/components/auth-guard'
import { GamificationDashboard } from './_components/gamification-dashboard'

export const metadata: Metadata = {
  title: 'Gamification Dashboard - Beauty GO',
  description: 'Track your beauty journey, earn points, collect badges, and climb the leaderboard in Beauty GO.',
  openGraph: {
    title: 'Gamification Dashboard - Beauty GO',
    description: 'Track your beauty journey, earn points, collect badges, and climb the leaderboard in Beauty GO.',
    images: ['/gamification-og.jpg'],
  },
}

export default function GamificationPage() {
  return (
    <AuthGuard>
      <GamificationDashboard />
    </AuthGuard>
  )
}
