
import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { CoursesLibrary } from './_components/courses-library'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'

export const metadata = {
  title: 'Course Library - Beauty Academy',
  description: 'Explore our comprehensive library of beauty courses taught by industry experts. Learn hair styling, makeup, nails, and business skills.',
}

export default function CoursesPage() {
  return (
    <AuthGuard allowedRoles={['PROFESSIONAL', 'ADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <Suspense fallback={<EnhancedSkeleton className="h-screen" />}>
          <CoursesLibrary />
        </Suspense>
      </div>
    </AuthGuard>
  )
}
