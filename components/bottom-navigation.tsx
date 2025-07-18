
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, Search, Calendar, User, BarChart3, Heart, Settings, Sparkles, Brain, Trophy, GraduationCap, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/i18n-client'

interface UserData {
  role: string
}

const getClientNavigationItems = (t: (key: string) => string) => [
  { icon: Home, label: t('navigation.home'), href: '/' },
  { icon: Search, label: t('navigation.explore'), href: '/explore' },
  { icon: Brain, label: 'AI Match', href: '/style-match', special: true },
  { icon: Trophy, label: 'Rewards', href: '/gamification', special: true },
  { icon: User, label: t('navigation.profile'), href: '/profile' },
]

const getProfessionalNavigationItems = (t: (key: string) => string) => [
  { icon: Home, label: t('navigation.dashboard'), href: '/' },
  { icon: Calendar, label: t('navigation.calendar'), href: '/calendar' },
  { icon: Building2, label: 'Salon Portal', href: '/salon-portal', special: true },
  { icon: GraduationCap, label: 'Academy', href: '/academy', special: true },
  { icon: User, label: t('navigation.profile'), href: '/profile' },
] as Array<{ icon: any; label: string; href: string; special?: boolean }>

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const t = useTranslations()

  useEffect(() => {
    fetchUserRole()
  }, [])

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData: UserData = await response.json()
        setUserRole(userData.role)
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  // Don't show bottom nav on auth pages and full-screen Academy pages
  if (pathname.startsWith('/auth') || pathname.startsWith('/admin') || pathname.startsWith('/academy/learn/')) {
    return null
  }

  // Don't show navigation until we know the user role
  if (!userRole) {
    return null
  }

  const navigationItems = userRole === 'PROFESSIONAL' ? getProfessionalNavigationItems(t) : getClientNavigationItems(t)

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex items-center justify-around py-2 px-2 max-w-6xl mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href === '/academy' && pathname.startsWith('/academy'))
          const isSpecial = (item as any).special
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 min-w-[60px] sm:min-w-[70px] relative",
                isActive 
                  ? isSpecial 
                    ? "text-blue-700 bg-gradient-to-r from-blue-50 to-purple-50" 
                    : "text-amber-700 bg-amber-50"
                  : isSpecial
                    ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <div className="relative">
                <Icon 
                  size={20} 
                  className={cn(
                    "mb-1 sm:mb-1",
                    isActive && "fill-current"
                  )}
                />
                {isSpecial && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                )}
              </div>
              <span className={cn(
                "text-xs sm:text-xs font-medium leading-tight",
                isSpecial && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
