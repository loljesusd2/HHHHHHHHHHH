
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface StyleUploadProps {
  onAnalysisComplete: (result: any) => void
  onError: (error: string) => void
}

export function StyleUpload({ onAnalysisComplete, onError }: StyleUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const analyzeStyle = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch('/api/style/analyze', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      onAnalysisComplete(result)
    } catch (error) {
      onError('Failed to analyze image. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
    }
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <Card className="border-2 border-dashed border-gray-300 hover:border-amber-400 transition-colors">
          <div
            {...getRootProps()}
            className={cn(
              "p-8 text-center cursor-pointer",
              isDragActive && "bg-amber-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-amber-100 rounded-full">
                <Camera className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Upload Style Photo
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Drag & drop or click to select an image
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports: JPG, PNG, WEBP (max 5MB)
                </p>
              </div>
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="relative">
            <div className="aspect-[4/3] relative bg-gray-100">
              {preview && (
                <Image
                  src={preview}
                  alt="Style reference"
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-white/90 hover:bg-white"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  {selectedFile.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            
            <Button 
              onClick={analyzeStyle}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Style...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Analyze This Style
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
