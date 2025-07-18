

import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { ProfessionalBulkImport } from '../_components/professional-bulk-import'
import { ProfessionalManagement } from '../_components/professional-management'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfessionalsPage() {
  return (
    <AuthGuard allowedRoles={['PROFESSIONAL', 'ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Professional Management</h1>
          <p className="text-gray-600 mt-2">Manage salon professionals and bulk imports</p>
        </div>

        <div className="space-y-8">
          <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
            <ProfessionalBulkImport />
          </Suspense>
          
          <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
            <ProfessionalManagement />
          </Suspense>
        </div>
      </div>
    </AuthGuard>
  )
}
