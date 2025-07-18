
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  DollarSign, 
  Calendar, 
  Settings, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigationItems = [
  {
    href: '/salon-portal',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    href: '/salon-portal/professionals',
    label: 'Professionals',
    icon: Users
  },
  {
    href: '/salon-portal/analytics',
    label: 'Analytics',
    icon: BarChart3
  },
  {
    href: '/salon-portal/commissions',
    label: 'Commissions',
    icon: DollarSign
  },
  {
    href: '/salon-portal/scheduling',
    label: 'Scheduling',
    icon: Calendar
  },
  {
    href: '/salon-portal/integrations',
    label: 'Integrations',
    icon: Settings
  },
  {
    href: '/salon-portal/verification',
    label: 'Verification',
    icon: ShieldCheck
  }
]

export function SalonNavigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/salon-portal" className="text-xl font-bold text-amber-600">
                Beauty GO Portal
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-amber-100 text-amber-800"
                          : "text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden">
          <div className="fixed top-16 left-0 right-0 bg-white shadow-lg border-b">
            <nav className="py-4">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-amber-100 text-amber-800"
                        : "text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
