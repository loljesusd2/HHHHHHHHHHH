
import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { SalonDashboard } from './_components/salon-dashboard'
import { Skeleton } from '@/components/ui/skeleton'

export default function SalonPortalPage() {
  return (
    <AuthGuard allowedRoles={['PROFESSIONAL', 'ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Salon Portal</h1>
          <p className="text-gray-600 mt-2">Manage your salon operations and analytics</p>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <SalonDashboard />
        </Suspense>
      </div>
    </AuthGuard>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </div>
  )
}
