
'use client'

import { useState, useRef } from 'react'
import { Upload, File, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface DocumentUploadProps {
  onUploadSuccess?: () => void
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const documentTypes = [
    { value: 'id', label: 'Government ID (Driver\'s License, Passport)' },
    { value: 'license', label: 'Professional License' },
    { value: 'certification', label: 'Certification/Diploma' },
    { value: 'business', label: 'Business License' }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPEG, PNG, or PDF file.",
          variant: "destructive",
        })
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      setUploadSuccess(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast({
        title: "Missing Information",
        description: "Please select a document type and file.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('documentType', documentType)

      const response = await fetch('/api/verification/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Document Uploaded",
          description: "Your document has been submitted for verification.",
        })
        setUploadSuccess(true)
        setSelectedFile(null)
        setDocumentType('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        onUploadSuccess?.()
      } else {
        toast({
          title: "Upload Failed",
          description: data.error || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload size={20} />
          Upload Verification Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Document Type
          </label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Document File
          </label>
          
          {!selectedFile ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-amber-600 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                JPEG, PNG, or PDF (max 5MB)
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {uploadSuccess ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
          <p className="font-medium mb-1">Requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Document must be clear and readable</li>
            <li>All information must be visible</li>
            <li>File size must be under 5MB</li>
            <li>Accepted formats: JPEG, PNG, PDF</li>
          </ul>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !documentType || isUploading || uploadSuccess}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : uploadSuccess ? 'Uploaded Successfully' : 'Upload Document'}
        </Button>
      </CardContent>
    </Card>
  )
}
