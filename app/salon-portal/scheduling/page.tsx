

import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { BulkScheduler } from '../_components/bulk-scheduler'
import { Skeleton } from '@/components/ui/skeleton'

export default function SchedulingPage() {
  return (
    <AuthGuard allowedRoles={['PROFESSIONAL', 'ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Scheduling</h1>
          <p className="text-gray-600 mt-2">Manage schedules and availability for all professionals</p>
        </div>

        <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
          <BulkScheduler />
        </Suspense>
      </div>
    </AuthGuard>
  )
}
