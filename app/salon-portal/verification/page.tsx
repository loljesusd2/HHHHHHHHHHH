

import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { SalonVerification } from '../_components/salon-verification'
import { Skeleton } from '@/components/ui/skeleton'

export default function VerificationPage() {
  return (
    <AuthGuard allowedRoles={['PROFESSIONAL', 'ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Salon Verification</h1>
          <p className="text-gray-600 mt-2">Verify your salon and earn trust badges</p>
        </div>

        <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
          <SalonVerification />
        </Suspense>
      </div>
    </AuthGuard>
  )
}
