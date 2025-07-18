
'use client'

import { useRef, useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward,
  Settings,
  Loader2
} from 'lucide-react'
import { useVideoPlayer } from '@/hooks/use-video-player'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface VideoPlayerProps {
  src: string
  thumbnail?: string
  title?: string
  onProgress?: (currentTime: number, duration: number) => void
  onEnded?: () => void
  className?: string
  autoPlay?: boolean
  muted?: boolean
}

export function VideoPlayer({ 
  src, 
  thumbnail, 
  title, 
  onProgress,
  onEnded,
  className,
  autoPlay = false,
  muted = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showControls, setShowControls] = useState(true)
  const [mouseMoving, setMouseMoving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isFullscreen,
    isMuted,
    isBuffering,
    error,
    play,
    pause,
    togglePlay,
    seekTo,
    changeVolume,
    toggleMute,
    changePlaybackRate,
    toggleFullscreen,
    skipForward,
    skipBackward,
    formatTime,
    getProgress
  } = useVideoPlayer(videoRef, { autoPlay, muted })

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

  useEffect(() => {
    if (onProgress && duration > 0) {
      onProgress(currentTime, duration)
    }
  }, [currentTime, duration, onProgress])

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current
      const handleEnded = () => {
        if (onEnded) {
          onEnded()
        }
      }
      video.addEventListener('ended', handleEnded)
      return () => video.removeEventListener('ended', handleEnded)
    }
  }, [onEnded])

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const handleMouseMove = () => {
      setMouseMoving(true)
      setShowControls(true)
      clearTimeout(timeout)
      
      timeout = setTimeout(() => {
        setMouseMoving(false)
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    const handleMouseLeave = () => {
      setMouseMoving(false)
      if (isPlaying) {
        setShowControls(false)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
      clearTimeout(timeout)
    }
  }, [isPlaying])

  const handleProgressChange = (value: number[]) => {
    const time = (value[0] / 100) * duration
    seekTo(time)
  }

  const handleVolumeChange = (value: number[]) => {
    changeVolume(value[0] / 100)
  }

  const handleInitialize = () => {
    setInitialized(true)
    if (autoPlay) {
      play()
    }
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64 bg-gray-100">
          <p className="text-red-500">Error loading video</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div
          ref={containerRef}
          className="relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={src}
            poster={thumbnail}
            className="w-full h-full object-cover"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Loading Overlay */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          {/* Initialize Overlay */}
          {!initialized && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleInitialize}
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 backdrop-blur-sm"
                >
                  <Play className="w-6 h-6 mr-2" />
                  Play Video
                </Button>
              </motion.div>
            </div>
          )}

          {/* Controls */}
          <AnimatePresence>
            {(showControls || !isPlaying) && initialized && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(showControls || !isPlaying) && initialized && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 left-0 right-0 p-4 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Progress Bar */}
                <div className="mb-4">
                  <Slider
                    value={[getProgress()]}
                    onValueChange={handleProgressChange}
                    max={100}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skipBackward()}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skipForward()}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>
                      <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Playback Rate */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {playbackRates.map((rate) => (
                          <DropdownMenuItem
                            key={rate}
                            onClick={() => changePlaybackRate(rate)}
                            className={playbackRate === rate ? 'bg-accent' : ''}
                          >
                            {rate}x
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Fullscreen */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      {isFullscreen ? (
                        <Minimize className="w-4 h-4" />
                      ) : (
                        <Maximize className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Title */}
        {title && (
          <div className="p-4">
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
