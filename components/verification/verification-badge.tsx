
'use client'

import { Shield, ShieldCheck, ShieldX, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface VerificationBadgeProps {
  status: 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function VerificationBadge({ 
  status, 
  size = 'md', 
  showText = true 
}: VerificationBadgeProps) {
  const getConfig = () => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: ShieldCheck,
          color: 'bg-green-100 text-green-800 border-green-200',
          text: 'Verified',
          iconColor: 'text-green-600'
        }
      case 'PENDING':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: 'Pending',
          iconColor: 'text-yellow-600'
        }
      case 'REJECTED':
        return {
          icon: ShieldX,
          color: 'bg-red-100 text-red-800 border-red-200',
          text: 'Rejected',
          iconColor: 'text-red-600'
        }
      default:
        return {
          icon: Shield,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          text: 'Unverified',
          iconColor: 'text-gray-600'
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 16 : 20
  const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'

  if (!showText) {
    return (
      <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${config.color}`}>
        <Icon size={iconSize} className={config.iconColor} />
      </div>
    )
  }

  return (
    <Badge variant="outline" className={`${config.color} ${textSize} gap-1`}>
      <Icon size={iconSize} className={config.iconColor} />
      {config.text}
    </Badge>
  )
}
