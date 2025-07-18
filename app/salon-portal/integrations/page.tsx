

import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth-guard'
import { WebhookManager } from '../_components/webhook-manager'
import { Skeleton } from '@/components/ui/skeleton'

export default function IntegrationsPage() {
  return (
    <AuthGuard allowedRoles={['PROFESSIONAL', 'ADMIN']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Integrations & Webhooks</h1>
          <p className="text-gray-600 mt-2">Connect with external systems and manage webhooks</p>
        </div>

        <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
          <WebhookManager />
        </Suspense>
      </div>
    </AuthGuard>
  )
}
