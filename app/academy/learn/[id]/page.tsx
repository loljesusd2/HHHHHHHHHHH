

import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { LearningInterface } from './_components/learning-interface'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'

interface LearnPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: LearnPageProps) {
  return {
    title: `Learning - Beauty Academy`,
    description: 'Continue your learning journey with interactive lessons and expert guidance.',
  }
}

export default function LearnPage({ params }: LearnPageProps) {
  return (
    <AuthGuard allowedRoles={['PROFESSIONAL', 'ADMIN']}>
      <div className="min-h-screen bg-black">
        <Suspense fallback={<EnhancedSkeleton className="h-screen" />}>
          <LearningInterface courseId={params.id} />
        </Suspense>
      </div>
    </AuthGuard>
  )
}
