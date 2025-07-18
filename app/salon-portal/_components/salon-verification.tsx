
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Star,
  Award,
  Image,
  Building
} from 'lucide-react'

export function SalonVerification() {
  const [verificationStatus, setVerificationStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    fetchVerificationStatus()
  }, [])

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('/api/salon-portal/verification/status')
      if (response.ok) {
        const data = await response.json()
        setVerificationStatus(data)
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error fetching verification status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentUpload = async (file: File, documentType: string) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', documentType)

      const response = await fetch('/api/salon-portal/verification/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const newDocument = await response.json()
        setDocuments([...documents, newDocument])
        fetchVerificationStatus() // Refresh status
      }
    } catch (error) {
      console.error('Error uploading document:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmitVerification = async () => {
    try {
      const response = await fetch('/api/salon-portal/verification/submit', {
        method: 'POST',
      })

      if (response.ok) {
        fetchVerificationStatus()
      }
    } catch (error) {
      console.error('Error submitting verification:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-50'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50'
      case 'REJECTED':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const calculateProgress = () => {
    if (!verificationStatus) return 0
    
    const requiredDocuments = ['business_license', 'insurance', 'tax_id', 'professional_license']
    const uploadedDocuments = documents.filter(d => requiredDocuments.includes(d.type))
    
    return Math.round((uploadedDocuments.length / requiredDocuments.length) * 100)
  }

  if (loading) {
    return <div>Loading verification status...</div>
  }

  return (
    <div className="space-y-6">
      {/* Verification Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5" />
            <span>Verification Status</span>
          </CardTitle>
          <CardDescription>
            Complete your salon verification to earn trust badges and unlock premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Status</span>
                <Badge className={getStatusColor(verificationStatus?.status || 'UNVERIFIED')}>
                  {getStatusIcon(verificationStatus?.status || 'UNVERIFIED')}
                  <span className="ml-1">{verificationStatus?.status || 'UNVERIFIED'}</span>
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Verification Progress</span>
                  <span>{calculateProgress()}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>

              {verificationStatus?.isVerified && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Congratulations! Your salon is verified and eligible for premium features.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Verification Benefits</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Verified badge on salon profile</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Higher search ranking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Trust indicators for clients</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Access to premium features</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="business-info">Business Info</TabsTrigger>
          <TabsTrigger value="verification-history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>
                Upload the following documents to complete your verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    type: 'business_license',
                    title: 'Business License',
                    description: 'Valid business license or registration',
                    required: true
                  },
                  {
                    type: 'insurance',
                    title: 'Insurance Certificate',
                    description: 'Proof of business insurance coverage',
                    required: true
                  },
                  {
                    type: 'tax_id',
                    title: 'Tax ID',
                    description: 'Federal Tax ID or EIN documentation',
                    required: true
                  },
                  {
                    type: 'professional_license',
                    title: 'Professional License',
                    description: 'State cosmetology or professional license',
                    required: true
                  },
                  {
                    type: 'lease_agreement',
                    title: 'Lease Agreement',
                    description: 'Proof of business address',
                    required: false
                  }
                ].map((docType) => {
                  const uploadedDoc = documents.find(d => d.type === docType.type)
                  
                  return (
                    <div key={docType.type} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium flex items-center space-x-2">
                            <span>{docType.title}</span>
                            {docType.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                          </h4>
                          <p className="text-sm text-gray-600">{docType.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {uploadedDoc ? (
                            <Badge variant="default" className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>Uploaded</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {uploadedDoc ? (
                        <div className="flex items-center space-x-2 mt-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{uploadedDoc.fileName}</span>
                          <Badge variant="secondary" className="text-xs">
                            {uploadedDoc.status}
                          </Badge>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleDocumentUpload(file, docType.type)
                              }
                            }}
                            disabled={uploading}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business-info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Provide detailed information about your salon business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input id="business-name" placeholder="Enter business name" />
                  </div>
                  <div>
                    <Label htmlFor="business-type">Business Type</Label>
                    <Input id="business-type" placeholder="e.g., Salon, Spa, Barbershop" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="business-address">Business Address</Label>
                  <Textarea id="business-address" placeholder="Enter complete business address" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business-phone">Business Phone</Label>
                    <Input id="business-phone" placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <Label htmlFor="business-email">Business Email</Label>
                    <Input id="business-email" type="email" placeholder="business@example.com" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="business-description">Business Description</Label>
                  <Textarea 
                    id="business-description" 
                    placeholder="Describe your salon, services, and specialties"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="years-operation">Years in Operation</Label>
                    <Input id="years-operation" type="number" placeholder="e.g., 5" />
                  </div>
                  <div>
                    <Label htmlFor="staff-count">Number of Staff</Label>
                    <Input id="staff-count" type="number" placeholder="e.g., 8" />
                  </div>
                </div>

                <Button className="w-full">
                  Save Business Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification History</CardTitle>
              <CardDescription>
                Track your verification progress and any feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    date: new Date(),
                    action: 'Verification submitted',
                    status: 'pending',
                    notes: 'All required documents uploaded and under review'
                  },
                  {
                    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    action: 'Documents uploaded',
                    status: 'completed',
                    notes: 'Business license and insurance certificate uploaded'
                  },
                  {
                    date: new Date(Date.now() - 48 * 60 * 60 * 1000),
                    action: 'Verification started',
                    status: 'completed',
                    notes: 'Verification process initiated'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {item.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-gray-600">{item.notes}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.date.toLocaleDateString()} at {item.date.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit Verification */}
      {calculateProgress() === 100 && !verificationStatus?.isVerified && (
        <Card>
          <CardHeader>
            <CardTitle>Submit for Verification</CardTitle>
            <CardDescription>
              All required documents have been uploaded. Submit your application for review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSubmitVerification} className="w-full">
              Submit for Verification
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
