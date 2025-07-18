

import { Metadata } from 'next'
import { AuthGuard } from '@/components/auth-guard'
import { BeautyProfilePage } from './_components/beauty-profile-page'

export const metadata: Metadata = {
  title: 'Beauty Profile - Beauty GO',
  description: 'Your personal beauty journey timeline. Track your transformations, share your progress, and celebrate your beauty evolution.',
  openGraph: {
    title: 'Beauty Profile - Beauty GO',
    description: 'Your personal beauty journey timeline. Track your transformations, share your progress, and celebrate your beauty evolution.',
    images: ['/beauty-profile-og.jpg'],
  },
}

export default function BeautyProfile() {
  return (
    <AuthGuard allowedRoles={['CLIENT', 'PROFESSIONAL', 'ADMIN']}>
      <BeautyProfilePage />
    </AuthGuard>
  )
}
