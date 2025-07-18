

import { Metadata } from 'next'
import { AuthGuard } from '@/components/auth-guard'
import { FlashDealsPage } from './_components/flash-deals-page'

export const metadata: Metadata = {
  title: 'Flash Deals - Beauty GO',
  description: 'Limited time offers on beauty services! Discover amazing deals from verified professionals in your area.',
  openGraph: {
    title: 'Flash Deals - Beauty GO',
    description: 'Limited time offers on beauty services! Discover amazing deals from verified professionals in your area.',
    images: ['/flash-deals-og.jpg'],
  },
}

export default function FlashDeals() {
  return (
    <AuthGuard allowedRoles={['CLIENT', 'PROFESSIONAL', 'ADMIN']}>
      <FlashDealsPage />
    </AuthGuard>
  )
}
