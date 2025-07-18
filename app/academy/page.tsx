
import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { AcademyHomepage } from './_components/academy-homepage'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'

export const metadata = {
  title: 'Beauty Academy - Premium Beauty Education',
  description: 'Master beauty skills with expert-led courses, certifications, and hands-on learning from industry professionals.',
}

export default function AcademyPage() {
  return (
    <AuthGuard allowedRoles={['PROFESSIONAL', 'ADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <Suspense fallback={<EnhancedSkeleton className="h-screen" />}>
          <AcademyHomepage />
        </Suspense>
      </div>
    </AuthGuard>
  )
}
