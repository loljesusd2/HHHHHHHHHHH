
'use client'

import { useState, useEffect, useRef } from 'react'

interface VideoPlayerOptions {
  autoPlay?: boolean
  muted?: boolean
  controls?: boolean
  playbackRate?: number
  volume?: number
}

export function useVideoPlayer(
  videoRef: React.RefObject<HTMLVideoElement>,
  options: VideoPlayerOptions = {}
) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(options.volume || 1)
  const [playbackRate, setPlaybackRate] = useState(options.playbackRate || 1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(options.muted || false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const progressInterval = useRef<NodeJS.Timeout>()

  const play = async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.play()
        setIsPlaying(true)
        setError(null)
      }
    } catch (err) {
      setError('Failed to play video')
      console.error('Video play error:', err)
    }
  }

  const pause = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const changeVolume = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
    }
  }

  const toggleFullscreen = async () => {
    if (!videoRef.current) return

    try {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          await videoRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  const skipForward = (seconds: number = 10) => {
    if (videoRef.current) {
      const newTime = Math.min(currentTime + seconds, duration)
      seekTo(newTime)
    }
  }

  const skipBackward = (seconds: number = 10) => {
    if (videoRef.current) {
      const newTime = Math.max(currentTime - seconds, 0)
      seekTo(newTime)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    if (duration === 0) return 0
    return (currentTime / duration) * 100
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handleCanPlay = () => {
      setIsBuffering(false)
    }

    const handleError = () => {
      setError('Video playback error')
      setIsPlaying(false)
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    // Set initial options
    if (options.autoPlay) video.autoplay = true
    if (options.muted) video.muted = true
    if (options.controls !== undefined) video.controls = options.controls
    if (options.volume !== undefined) video.volume = options.volume
    if (options.playbackRate !== undefined) video.playbackRate = options.playbackRate

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)

      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [videoRef, options])

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isFullscreen,
    isMuted,
    isBuffering,
    error,

    // Actions
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

    // Utilities
    formatTime,
    getProgress
  }
}
