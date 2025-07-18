
'use client'

import { useOnlineStatus } from '@/hooks/use-online-status'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ConnectionStatus() {
  const { isOnline, wasOffline } = useOnlineStatus()

  const handleRefresh = () => {
    window.location.reload()
  }

  if (isOnline && !wasOffline) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Wifi className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-800">Connected</p>
              <p className="text-sm text-green-600">All features are available</p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              Online
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isOnline && wasOffline) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Wifi className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-800">Back Online</p>
              <p className="text-sm text-blue-600">Connection restored</p>
            </div>
            <Button
              onClick={handleRefresh}
              size="sm"
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-red-50 border-red-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-red-800">Offline</p>
            <p className="text-sm text-red-600">Limited functionality available</p>
          </div>
          <Badge variant="outline" className="text-red-600 border-red-200">
            Offline
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
