
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ArrowLeft, Camera, Users, Star, Target } from 'lucide-react'
import { StyleUpload } from '@/components/style/style-upload'
import { StyleAnalysis } from '@/components/style/style-analysis'
import { ProfessionalMatch } from '@/components/style/professional-match'
import { StyleGallery } from '@/components/style/style-gallery'
import { StyleBooking } from '@/components/style/style-booking'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Step = 'upload' | 'analysis' | 'matching' | 'portfolio' | 'booking' | 'complete'

interface AnalysisResult {
  analysisId: string
  imageUrl: string
  styleTags: string[]
  colorTags: string[]
  techniqueTags: string[]
  difficulty: string
  estimatedDuration: number
  description: string
  category: string
}

interface MatchResult {
  matches: any[]
  analysisId: string
  totalFound: number
}

export default function StyleMatchPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('upload')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [matches, setMatches] = useState<MatchResult | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [portfolioData, setPortfolioData] = useState<{professionalId: string, isOpen: boolean}>({
    professionalId: '',
    isOpen: false
  })
  const [isMatching, setIsMatching] = useState(false)

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysis(result)
    setStep('analysis')
  }

  const handleAnalysisError = (error: string) => {
    toast.error(error)
  }

  const handleFindMatches = async () => {
    if (!analysis) return

    setIsMatching(true)
    try {
      const response = await fetch('/api/style/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysisId: analysis.analysisId,
          location: '' // Could add location input later
        })
      })

      if (!response.ok) {
        throw new Error('Matching failed')
      }

      const result = await response.json()
      setMatches(result)
      setStep('matching')
    } catch (error) {
      toast.error('Failed to find matches. Please try again.')
    } finally {
      setIsMatching(false)
    }
  }

  const handleBookService = (serviceId: string, professionalId: string) => {
    const match = matches?.matches.find(m => m.professional.userId === professionalId)
    if (match && analysis) {
      setSelectedMatch({
        serviceId,
        professionalId,
        analysisId: analysis.analysisId,
        matchScore: match.matchScore,
        service: match.relevantServices.find((s: any) => s.id === serviceId),
        professional: match.professional
      })
      setStep('booking')
    }
  }

  const handleViewPortfolio = (professionalId: string) => {
    setPortfolioData({ professionalId, isOpen: true })
  }

  const handleBookingComplete = (booking: any) => {
    setStep('complete')
    toast.success('Your style appointment has been booked!')
  }

  const renderHeader = () => (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-50 to-orange-50 border-b p-4">
      <div className="flex items-center space-x-3">
        {step !== 'upload' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (step === 'analysis') setStep('upload')
              else if (step === 'matching') setStep('analysis')
              else if (step === 'booking') setStep('matching')
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-amber-600" />
          <h1 className="text-xl font-bold text-gray-900">AI Style Matching</h1>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center space-x-2 mt-3">
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          step === 'upload' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          <Camera className="h-3 w-3" />
          <span>Upload</span>
        </div>
        
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          step === 'analysis' ? 'bg-amber-500 text-white' : 
          ['matching', 'portfolio', 'booking', 'complete'].includes(step) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          <Target className="h-3 w-3" />
          <span>Analyze</span>
        </div>
        
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          ['matching', 'portfolio', 'booking', 'complete'].includes(step) ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          <Users className="h-3 w-3" />
          <span>Match</span>
        </div>
        
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          step === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          <Star className="h-3 w-3" />
          <span>Book</span>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="space-y-6">
            {/* Hero Section */}
            <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <Sparkles className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Find Your Perfect Style Match
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Upload a photo of your desired style and let our AI find the best professionals who can recreate it perfectly
                </p>
              </div>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <Camera className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium">AI Analysis</h3>
                <p className="text-sm text-gray-600">Advanced image recognition identifies style elements</p>
              </Card>
              
              <Card className="p-4 text-center">
                <Users className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium">Smart Matching</h3>
                <p className="text-sm text-gray-600">Find professionals with proven expertise in your style</p>
              </Card>
              
              <Card className="p-4 text-center">
                <Star className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <h3 className="font-medium">Style Guarantee</h3>
                <p className="text-sm text-gray-600">Satisfaction guaranteed or get your money back</p>
              </Card>
            </div>

            {/* Upload Component */}
            <StyleUpload
              onAnalysisComplete={handleAnalysisComplete}
              onError={handleAnalysisError}
            />
          </div>
        )

      case 'analysis':
        return analysis ? (
          <div className="space-y-6">
            <StyleAnalysis analysis={analysis} />
            
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Great! We've analyzed your style. Now let's find professionals who can recreate this look perfectly.
              </p>
              
              <Button
                onClick={handleFindMatches}
                disabled={isMatching}
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {isMatching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Finding Matches...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Find My Style Matches
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : null

      case 'matching':
        return matches ? (
          <div className="space-y-6">
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="text-center">
                <h3 className="font-semibold text-green-800">
                  🎉 Found {matches.totalFound} Perfect Matches!
                </h3>
                <p className="text-sm text-green-600 mt-1">
                  These professionals have the expertise to recreate your desired style
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.matches.map((match, index) => (
                <ProfessionalMatch
                  key={index}
                  match={match}
                  onBook={handleBookService}
                  onViewPortfolio={handleViewPortfolio}
                />
              ))}
            </div>

            {matches.totalFound === 0 && (
              <Card className="p-8 text-center">
                <p className="text-gray-500 mb-4">No matches found for your style.</p>
                <Button
                  variant="outline"
                  onClick={() => setStep('upload')}
                >
                  Try Different Style
                </Button>
              </Card>
            )}
          </div>
        ) : null

      case 'booking':
        return selectedMatch ? (
          <StyleBooking
            {...selectedMatch}
            onBookingComplete={handleBookingComplete}
            onCancel={() => setStep('matching')}
          />
        ) : null

      case 'complete':
        return (
          <Card className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-green-100 rounded-full">
                <Star className="h-12 w-12 text-green-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900">
              Booking Confirmed! 🎉
            </h2>
            
            <p className="text-gray-600 max-w-md mx-auto">
              Your style appointment has been booked. You'll receive a confirmation email with all the details.
            </p>
            
            <div className="flex space-x-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push('/bookings')}
              >
                View My Bookings
              </Button>
              
              <Button
                onClick={() => {
                  setStep('upload')
                  setAnalysis(null)
                  setMatches(null)
                  setSelectedMatch(null)
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Try Another Style
              </Button>
            </div>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      {renderHeader()}
      
      <div className="max-w-4xl mx-auto p-4 pb-24">
        {renderContent()}
      </div>

      {/* Portfolio Gallery Modal */}
      <StyleGallery
        professionalId={portfolioData.professionalId}
        isOpen={portfolioData.isOpen}
        onClose={() => setPortfolioData({ professionalId: '', isOpen: false })}
      />
    </div>
  )
}
