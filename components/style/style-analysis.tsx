
'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Clock, Star, Palette, Scissors, Target } from 'lucide-react'
import Image from 'next/image'

interface StyleAnalysisProps {
  analysis: {
    imageUrl: string
    styleTags: string[]
    colorTags: string[]
    techniqueTags: string[]
    difficulty: string
    estimatedDuration: number
    description: string
    category: string
  }
}

const difficultyConfig = {
  EASY: { color: 'bg-green-100 text-green-800', icon: '⭐' },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-800', icon: '⭐⭐' },
  HARD: { color: 'bg-orange-100 text-orange-800', icon: '⭐⭐⭐' },
  EXPERT: { color: 'bg-red-100 text-red-800', icon: '⭐⭐⭐⭐' }
}

const categoryLabels = {
  HAIR_STYLING: 'Hair Styling',
  MAKEUP: 'Makeup',
  MANICURE: 'Manicure',
  PEDICURE: 'Pedicure',
  SKINCARE: 'Skincare',
  EYEBROWS: 'Eyebrows',
  MASSAGE: 'Massage'
}

export function StyleAnalysis({ analysis }: StyleAnalysisProps) {
  const difficulty = difficultyConfig[analysis.difficulty as keyof typeof difficultyConfig] || difficultyConfig.MEDIUM

  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Target className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Style Analysis Complete</h3>
            <p className="text-sm text-gray-600">{analysis.description}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Style Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">Category:</span>
            <Badge variant="secondary">
              {categoryLabels[analysis.category as keyof typeof categoryLabels] || analysis.category}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Duration:</span>
            <span className="text-sm text-gray-600">{analysis.estimatedDuration} min</span>
          </div>
        </div>

        {/* Difficulty Level */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Difficulty:</span>
          <Badge className={difficulty.color}>
            {difficulty.icon} {analysis.difficulty}
          </Badge>
        </div>

        {/* Style Tags */}
        {analysis.styleTags.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Scissors className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Style Elements:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.styleTags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-purple-700 border-purple-200">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Color Tags */}
        {analysis.colorTags.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Palette className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-medium">Colors:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.colorTags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-pink-700 border-pink-200">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Technique Tags */}
        {analysis.techniqueTags.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Techniques:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.techniqueTags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-green-700 border-green-200">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
