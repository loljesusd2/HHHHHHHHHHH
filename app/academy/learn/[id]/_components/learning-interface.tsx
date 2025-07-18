
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Menu,
  X,
  CheckCircle,
  Clock,
  BookOpen,
  Download,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  Star,
  Settings
} from 'lucide-react'
import { VideoPlayer } from '@/components/academy/video-player'
import { QuizComponent } from '@/components/academy/quiz-component'
import { ProgressTracker } from '@/components/academy/progress-tracker'
import { useAcademyCourse } from '@/hooks/use-academy-courses'
import { useAcademyProgress } from '@/hooks/use-academy-progress'
import { useLessonProgress } from '@/hooks/use-academy-progress'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface LearningInterfaceProps {
  courseId: string
}

export function LearningInterface({ courseId }: LearningInterfaceProps) {
  const router = useRouter()
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showQuiz, setShowQuiz] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const { course, loading, isEnrolled } = useAcademyCourse(courseId)
  const { progress, updateProgress } = useAcademyProgress(courseId)
  const { updateLessonProgress } = useLessonProgress(currentLessonId || '')

  // Get current lesson
  const currentLesson = course?.modules
    ?.flatMap(module => module.lessons || [])
    .find(lesson => lesson.id === currentLessonId)

  // Get all lessons for navigation
  const allLessons = course?.modules?.flatMap(module => 
    module.lessons?.map(lesson => ({
      ...lesson,
      moduleTitle: module.title,
      moduleId: module.id
    })) || []
  ) || []

  const currentLessonIndex = allLessons.findIndex(lesson => lesson.id === currentLessonId)

  useEffect(() => {
    // Set first lesson as current if none selected
    if (!currentLessonId && allLessons.length > 0) {
      setCurrentLessonId(allLessons[0].id)
    }
  }, [currentLessonId, allLessons])

  // Redirect if not enrolled
  useEffect(() => {
    if (!loading && !isEnrolled) {
      router.push(`/academy/course/${courseId}`)
    }
  }, [loading, isEnrolled, courseId, router])

  const handleVideoProgress = async (currentTime: number, duration: number) => {
    if (!currentLessonId) return
    
    const watchTime = Math.floor(currentTime)
    const isCompleted = currentTime >= duration * 0.9 // 90% completion
    
    await updateLessonProgress(watchTime, isCompleted)
  }

  const handleNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentLessonIndex + 1].id)
    }
  }

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonId(allLessons[currentLessonIndex - 1].id)
    }
  }

  const handleLessonComplete = async () => {
    if (!currentLessonId) return
    
    await updateLessonProgress(0, true)
    
    // Auto-advance to next lesson
    setTimeout(() => {
      handleNextLesson()
    }, 2000)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getProgressForLesson = (lessonId: string) => {
    const lessonProgress = progress.find((p: any) => p.lessonId === lessonId)
    return lessonProgress?.progressPercentage || 0
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading course...</div>
      </div>
    )
  }

  if (!course || !isEnrolled) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <p className="mb-4">Course not found or you're not enrolled</p>
          <Link href="/academy/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <Link href={`/academy/course/${courseId}`}>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Course
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(false)}
                  className="text-white hover:bg-gray-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <h1 className="text-lg font-bold text-white line-clamp-2">
                {course.title}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {course.instructor?.name}
              </p>
            </div>

            {/* Course Progress */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Course Progress</span>
                <span className="text-sm text-gray-400">
                  {Math.round(progress.reduce((acc: number, p: any) => acc + p.progressPercentage, 0) / progress.length || 0)}%
                </span>
              </div>
              <Progress 
                value={progress.reduce((acc: number, p: any) => acc + p.progressPercentage, 0) / progress.length || 0} 
                className="h-2"
              />
            </div>

            {/* Lesson List */}
            <div className="flex-1 overflow-y-auto">
              {course.modules?.map((module) => (
                <div key={module.id} className="border-b border-gray-800">
                  <div className="p-4 bg-gray-800/50">
                    <h3 className="font-medium text-white">{module.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {module.lessons?.length || 0} lessons • {formatDuration(module.duration)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {module.lessons?.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLessonId(lesson.id)}
                        className={`w-full p-3 text-left hover:bg-gray-800/50 transition-colors ${
                          currentLessonId === lesson.id ? 'bg-purple-600/20 border-r-2 border-purple-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {getProgressForLesson(lesson.id) >= 100 ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center">
                                <Play className="w-3 h-3 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white line-clamp-2">
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-400">
                                {formatDuration(lesson.duration)}
                              </span>
                              {getProgressForLesson(lesson.id) > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {Math.round(getProgressForLesson(lesson.id))}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousLesson}
                  disabled={currentLessonIndex <= 0}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextLesson}
                  disabled={currentLessonIndex >= allLessons.length - 1}
                  className="flex-1"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {!showSidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(true)}
                className="text-white hover:bg-gray-800"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h2 className="font-medium text-white line-clamp-1">
                {currentLesson?.title || 'Select a lesson'}
              </h2>
              <p className="text-sm text-gray-400">
                Lesson {currentLessonIndex + 1} of {allLessons.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-800"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white hover:bg-gray-800"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 flex items-center justify-center bg-black">
          {currentLesson ? (
            <div className="w-full max-w-6xl mx-auto">
              <VideoPlayer
                src={currentLesson.videoUrl || '/placeholder-video.mp4'}
                thumbnail={currentLesson.videoThumbnail}
                title={currentLesson.title}
                onProgress={handleVideoProgress}
                onEnded={handleLessonComplete}
                className="w-full"
                autoPlay={true}
              />
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <BookOpen className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">Select a lesson to start learning</p>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="h-16 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousLesson}
              disabled={currentLessonIndex <= 0}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextLesson}
              disabled={currentLessonIndex >= allLessons.length - 1}
              className="text-white hover:bg-gray-800"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {currentLesson?.pdfUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(currentLesson.pdfUrl, '_blank')}
                className="text-white hover:bg-gray-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Resources
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-800"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Q&A
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLessonComplete}
              className="text-white hover:bg-gray-800"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
