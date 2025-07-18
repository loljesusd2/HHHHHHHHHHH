

import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { MyCoursesDashboard } from './_components/my-courses-dashboard'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'

export const metadata = {
  title: 'My Courses - Beauty Academy',
  description: 'Track your learning progress and continue your beauty education journey.',
}

export default function MyCoursesPage() {
  return (
    <AuthGuard allowedRoles={['PROFESSIONAL', 'ADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <Suspense fallback={<EnhancedSkeleton className="h-screen" />}>
          <MyCoursesDashboard />
        </Suspense>
      </div>
    </AuthGuard>
  )
}
