
'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Vibrate, Smartphone } from 'lucide-react'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'

export function HapticSettings() {
  const { isSupported, isEnabled, toggleEnabled } = useHapticFeedback()

  if (!isSupported) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone size={20} className="text-gray-400" />
            Haptic Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            Haptic feedback is not supported on this device.
          </p>
          <Badge variant="outline" className="text-gray-500 border-gray-300">
            Not Supported
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Vibrate size={20} className="text-amber-600" />
          Haptic Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="haptic-toggle" className="font-medium">
              Enable Haptic Feedback
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Get tactile feedback when interacting with the app
            </p>
          </div>
          <Switch
            id="haptic-toggle"
            checked={isEnabled}
            onCheckedChange={toggleEnabled}
          />
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            Supported
          </Badge>
          <Badge variant="outline" className={isEnabled ? "text-blue-600 border-blue-200" : "text-gray-500 border-gray-300"}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
