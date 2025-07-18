

import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { CourseDetails } from './_components/course-details'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'

interface CoursePageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: CoursePageProps) {
  return {
    title: `Course Details - Beauty Academy`,
    description: 'Learn more about this premium beauty course and start your learning journey.',
  }
}

export default function CoursePage({ params }: CoursePageProps) {
  return (
    <AuthGuard allowedRoles={['PROFESSIONAL', 'ADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <Suspense fallback={<EnhancedSkeleton className="h-screen" />}>
          <CourseDetails courseId={params.id} />
        </Suspense>
      </div>
    </AuthGuard>
  )
}
