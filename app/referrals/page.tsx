

import { Metadata } from 'next'
import { AuthGuard } from '@/components/auth-guard'
import { ReferralsPage } from './_components/referrals-page'

export const metadata: Metadata = {
  title: 'Referrals - Beauty GO',
  description: 'Refer friends to Beauty GO and earn rewards! Share your unique referral code and get points for every successful referral.',
  openGraph: {
    title: 'Referrals - Beauty GO',
    description: 'Refer friends to Beauty GO and earn rewards! Share your unique referral code and get points for every successful referral.',
    images: ['/referrals-og.jpg'],
  },
}

export default function Referrals() {
  return (
    <AuthGuard allowedRoles={['CLIENT', 'PROFESSIONAL', 'ADMIN']}>
      <ReferralsPage />
    </AuthGuard>
  )
}
