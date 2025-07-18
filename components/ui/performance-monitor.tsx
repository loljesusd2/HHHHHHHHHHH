
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Zap, Clock, Globe, Smartphone } from 'lucide-react'
import { useAnalytics } from '@/hooks/use-analytics'

interface PerformanceMetrics {
  loadTime: number
  connectionType: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  memoryUsage?: number
  batteryLevel?: number
  networkSpeed?: 'slow' | 'medium' | 'fast' | 'unknown'
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const { track } = useAnalytics()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const gatherMetrics = async () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      
      // Device type detection
      const deviceType = window.innerWidth < 768 ? 'mobile' : 
                        window.innerWidth < 1024 ? 'tablet' : 'desktop'
      
      // Connection type
      const connection = (navigator as any).connection
      const connectionType = connection?.effectiveType || 'unknown'
      
      // Memory usage (if available)
      const memoryUsage = (performance as any).memory?.usedJSHeapSize
      
      // Network speed estimation
      const networkSpeed = connection?.downlink > 10 ? 'fast' : 
                          connection?.downlink > 1.5 ? 'medium' : 'slow'
      
      // Battery level (if available)
      const battery = await (navigator as any).getBattery?.()
      const batteryLevel = battery?.level ? Math.round(battery.level * 100) : undefined

      const performanceMetrics: PerformanceMetrics = {
        loadTime,
        connectionType,
        deviceType,
        memoryUsage,
        batteryLevel,
        networkSpeed
      }

      setMetrics(performanceMetrics)
      
      // Track performance metrics
      track({
        action: 'performance_metrics',
        category: 'performance',
        customProperties: performanceMetrics
      })
    }

    gatherMetrics()
  }, [track])

  if (!metrics) return null

  const getLoadTimeColor = (loadTime: number) => {
    if (loadTime < 1000) return 'text-green-600'
    if (loadTime < 3000) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getLoadTimeProgress = (loadTime: number) => {
    return Math.min((loadTime / 5000) * 100, 100)
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap size={20} className="text-amber-600" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Load Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <span className="text-sm font-medium">Load Time</span>
            </div>
            <span className={`text-sm font-bold ${getLoadTimeColor(metrics.loadTime)}`}>
              {metrics.loadTime}ms
            </span>
          </div>
          <Progress value={getLoadTimeProgress(metrics.loadTime)} className="h-2" />
        </div>

        {/* Connection & Device */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-gray-500" />
              <span className="text-sm font-medium">Connection</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {metrics.connectionType}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-gray-500" />
              <span className="text-sm font-medium">Device</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {metrics.deviceType}
            </Badge>
          </div>
        </div>

        {/* Memory Usage */}
        {metrics.memoryUsage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Memory Usage</span>
              <span className="text-sm font-bold">
                {(metrics.memoryUsage / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          </div>
        )}

        {/* Battery Level */}
        {metrics.batteryLevel && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Battery Level</span>
              <span className="text-sm font-bold">
                {metrics.batteryLevel}%
              </span>
            </div>
            <Progress value={metrics.batteryLevel} className="h-2" />
          </div>
        )}

        {/* Network Speed */}
        {metrics.networkSpeed && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Network Speed</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                metrics.networkSpeed === 'fast' ? 'text-green-600 border-green-200' :
                metrics.networkSpeed === 'medium' ? 'text-yellow-600 border-yellow-200' :
                'text-red-600 border-red-200'
              }`}
            >
              {metrics.networkSpeed}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
