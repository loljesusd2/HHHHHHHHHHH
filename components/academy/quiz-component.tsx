
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Trophy,
  RotateCcw,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { Quiz, QuizResult } from '@/lib/types'

interface QuizComponentProps {
  quiz: Quiz
  onSubmit: (answers: any[]) => Promise<any>
  onRetry?: () => void
  result?: QuizResult
  canRetake?: boolean
  className?: string
}

export function QuizComponent({ 
  quiz, 
  onSubmit, 
  onRetry,
  result,
  canRetake = false,
  className 
}: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  const questions = quiz.questions as any[]
  const totalQuestions = questions.length

  useEffect(() => {
    if (result) {
      setShowResults(true)
      setAnswers(result.answers as any[])
    } else {
      setStartTime(new Date())
      setAnswers(new Array(totalQuestions).fill(null))
      
      // Set timer if quiz has time limit
      if (quiz.timeLimit) {
        setTimeLeft(quiz.timeLimit * 60) // Convert minutes to seconds
      }
    }
  }, [quiz, result, totalQuestions])

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (timeLeft !== null && timeLeft > 0 && !showResults) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev !== null && prev <= 1) {
            handleSubmit() // Auto-submit when time runs out
            return 0
          }
          return prev !== null ? prev - 1 : null
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [timeLeft, showResults])

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await onSubmit(answers)
      setShowResults(true)
    } catch (error) {
      console.error('Quiz submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAnsweredCount = () => {
    return answers.filter(answer => answer !== null).length
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getQuestionResult = (questionIndex: number) => {
    if (!result || !showResults) return null
    
    const question = questions[questionIndex]
    const userAnswer = answers[questionIndex]
    const isCorrect = userAnswer === question.correctAnswer
    
    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      userAnswer,
      explanation: question.explanation
    }
  }

  if (showResults && result) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {result.isPassed ? (
              <Trophy className="w-6 h-6 text-yellow-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            Quiz Results
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Results Summary */}
          <div className="text-center space-y-4">
            <div className={`text-6xl font-bold ${result.isPassed ? 'text-green-600' : 'text-red-600'}`}>
              {result.score}%
            </div>
            
            <div className="space-y-2">
              <Badge 
                variant={result.isPassed ? 'default' : 'destructive'}
                className="text-lg px-4 py-2"
              >
                {result.isPassed ? 'Passed' : 'Failed'}
              </Badge>
              
              <p className="text-gray-600">
                Score: {result.score}% correct
              </p>
              
              <p className="text-sm text-gray-500">
                Passing score: {quiz.passingScore}%
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={result.score} 
              className="h-3"
            />
            <p className="text-sm text-gray-600 text-center">
              Score: {result.score}% (Need {quiz.passingScore}% to pass)
            </p>
          </div>

          {/* Review Answers */}
          {quiz.showResults && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Review Answers</h4>
              <div className="space-y-3">
                {questions.map((question, index) => {
                  const questionResult = getQuestionResult(index)
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 ${
                        questionResult?.isCorrect 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {questionResult?.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.question}</p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Your answer:</span> {question.options[questionResult?.userAnswer]}
                          </p>
                          {!questionResult?.isCorrect && (
                            <p className="text-sm text-green-600 mb-1">
                              <span className="font-medium">Correct answer:</span> {question.options[questionResult?.correctAnswer]}
                            </p>
                          )}
                          {questionResult?.explanation && (
                            <p className="text-sm text-gray-500 mt-2">
                              <span className="font-medium">Explanation:</span> {questionResult.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {canRetake && !result.isPassed && (
              <Button 
                onClick={onRetry} 
                className="flex-1"
                variant="outline"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
            )}
            <Button 
              onClick={() => window.location.reload()} 
              className="flex-1"
            >
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-blue-600" />
            {quiz.title}
          </CardTitle>
          {timeLeft !== null && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className={`font-mono text-sm ${timeLeft < 300 ? 'text-red-600' : 'text-gray-600'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>
        
        {quiz.description && (
          <p className="text-gray-600">{quiz.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Question {currentQuestion + 1} of {totalQuestions}</span>
            <span>{getAnsweredCount()} answered</span>
          </div>
          <Progress value={((currentQuestion + 1) / totalQuestions) * 100} className="h-2" />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {questions[currentQuestion].question}
              </h3>
              
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option: string, index: number) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={answers[currentQuestion] === index ? 'default' : 'outline'}
                      onClick={() => handleAnswerChange(currentQuestion, index)}
                      className="w-full text-left justify-start h-auto p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          answers[currentQuestion] === index 
                            ? 'bg-primary border-primary' 
                            : 'border-gray-300'
                        }`}>
                          {answers[currentQuestion] === index && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestion === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || getAnsweredCount() === 0}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentQuestion === totalQuestions - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Quiz Info */}
        <div className="text-sm text-gray-500 text-center space-y-1">
          <p>Passing score: {quiz.passingScore}%</p>
          <p>Maximum attempts: {quiz.maxAttempts}</p>
          {quiz.timeLimit && (
            <p>Time limit: {quiz.timeLimit} minutes</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
