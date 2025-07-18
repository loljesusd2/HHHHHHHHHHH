
'use client'

import { useResponsive } from '@/hooks/use-responsive'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  tabletClassName?: string
  desktopClassName?: string
  landscapeClassName?: string
  portraitClassName?: string
  animate?: boolean
}

export function ResponsiveContainer({
  children,
  className,
  mobileClassName,
  tabletClassName,
  desktopClassName,
  landscapeClassName,
  portraitClassName,
  animate = true
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop, isLandscape, isPortrait } = useResponsive()

  const containerClasses = cn(
    className,
    isMobile && mobileClassName,
    isTablet && tabletClassName,
    isDesktop && desktopClassName,
    isLandscape && landscapeClassName,
    isPortrait && portraitClassName
  )

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  if (animate) {
    return (
      <motion.div
        className={containerClasses}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={containerClasses}>
      {children}
    </div>
  )
}
