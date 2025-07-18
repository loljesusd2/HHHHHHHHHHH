
'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi, AlertCircle } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { motion, AnimatePresence } from 'framer-motion'

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus()
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true)
      const timer = setTimeout(() => {
        setShowReconnected(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-3 shadow-lg"
        >
          <div className="flex items-center justify-center gap-2 max-w-6xl mx-auto">
            <WifiOff className="w-5 h-5" />
            <span className="text-sm font-medium">
              You're offline. Some features may not work.
            </span>
          </div>
        </motion.div>
      )}
      
      {showReconnected && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white p-3 shadow-lg"
        >
          <div className="flex items-center justify-center gap-2 max-w-6xl mx-auto">
            <Wifi className="w-5 h-5" />
            <span className="text-sm font-medium">
              Back online! All features restored.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
