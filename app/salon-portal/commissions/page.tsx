

import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { CommissionManagement } from '../_components/commission-management'
import { Skeleton } from '@/components/ui/skeleton'

export default function CommissionsPage() {
  return (
    <AuthGuard allowedRoles={['PROFESSIONAL', 'ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Commission Management</h1>
          <p className="text-gray-600 mt-2">Manage commission structures and payouts</p>
        </div>

        <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
          <CommissionManagement />
        </Suspense>
      </div>
    </AuthGuard>
  )
}
