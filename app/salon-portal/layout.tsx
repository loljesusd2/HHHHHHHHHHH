
import { Suspense } from 'react'
import { SalonNavigation } from './_components/salon-navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default function SalonPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <SalonNavigation />
      </Suspense>
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}
