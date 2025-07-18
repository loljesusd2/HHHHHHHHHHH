

import { Metadata } from 'next'
import { AuthGuard } from '@/components/auth-guard'
import { LeaderboardPage } from './_components/leaderboard-page'

export const metadata: Metadata = {
  title: 'Leaderboard - Beauty GO',
  description: 'See who are the top performers in Beauty GO. Compete with other users and professionals to climb the leaderboard.',
  openGraph: {
    title: 'Leaderboard - Beauty GO',
    description: 'See who are the top performers in Beauty GO. Compete with other users and professionals to climb the leaderboard.',
    images: ['/leaderboard-og.jpg'],
  },
}

export default function Leaderboard() {
  return (
    <AuthGuard allowedRoles={['CLIENT', 'PROFESSIONAL', 'ADMIN']}>
      <LeaderboardPage />
    </AuthGuard>
  )
}
