
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  allowedRoles = [] 
}: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const user = await response.json()
        setIsAuthenticated(true)
        setUserRole(user.role)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push('/auth/login')
        return
      }

      if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
        router.push('/')
        return
      }
    }
  }, [isLoading, isAuthenticated, userRole, requireAuth, allowedRoles, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return null
  }

  return <>{children}</>
}
