
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Download, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  FileText 
} from 'lucide-react'
import { BulkImportResult } from '@/lib/types'

export function ProfessionalBulkImport() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<BulkImportResult | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setProgress(0)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/salon-portal/professionals/bulk-import', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Import failed')
      }

      const data = await response.json()
      setResult(data)
      setProgress(100)
    } catch (error) {
      console.error('Import error:', error)
      setResult({
        total: 0,
        successful: 0,
        failed: 1,
        errors: [{ row: 1, email: 'unknown', error: 'Import failed' }]
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    // Create CSV template
    const csvContent = [
      'name,email,phone,businessName,address,city,state,zipCode,specialties,yearsExperience',
      'John Doe,john@example.com,555-0123,John\'s Hair Studio,123 Main St,Miami,FL,33101,Hair Styling,5',
      'Jane Smith,jane@example.com,555-0124,Jane\'s Makeup,456 Oak Ave,Orlando,FL,32801,Makeup,8'
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'professionals_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Bulk Import Professionals</span>
          </CardTitle>
          <CardDescription>
            Upload a CSV file to import multiple professionals at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Download Template</p>
                <p className="text-sm text-blue-700">Get the CSV template with required fields</p>
              </div>
            </div>
            <Button onClick={downloadTemplate} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Import Button */}
          <Button
            onClick={handleImport}
            disabled={!file || importing}
            className="w-full"
          >
            {importing ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Professionals
              </>
            )}
          </Button>

          {/* Progress */}
          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">{result.total}</p>
                  <p className="text-sm text-gray-600">Total Rows</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{result.successful}</p>
                  <p className="text-sm text-green-700">Successful</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                  <p className="text-sm text-red-700">Failed</p>
                </div>
              </div>

              {result.successful > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully imported {result.successful} professionals. 
                    Invitation emails will be sent shortly.
                  </AlertDescription>
                </Alert>
              )}

              {result.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {result.failed} rows failed to import. Check the errors below.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Details */}
              {result.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Import Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <div>
                            <p className="text-sm font-medium">Row {error.row}</p>
                            <p className="text-sm text-gray-600">{error.email}</p>
                          </div>
                          <Badge variant="destructive">{error.error}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
