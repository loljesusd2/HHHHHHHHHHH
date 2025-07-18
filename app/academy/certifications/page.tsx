

import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { CertificationsDashboard } from './_components/certifications-dashboard'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'

export const metadata = {
  title: 'Certifications - Beauty Academy',
  description: 'Earn industry-recognized certifications and showcase your beauty expertise to advance your career.',
}

export default function CertificationsPage() {
  return (
    <AuthGuard allowedRoles={['PROFESSIONAL', 'ADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <Suspense fallback={<EnhancedSkeleton className="h-screen" />}>
          <CertificationsDashboard />
        </Suspense>
      </div>
    </AuthGuard>
  )
}
