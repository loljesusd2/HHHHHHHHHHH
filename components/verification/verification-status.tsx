
'use client'

import { useEffect, useState } from 'react'
import { Shield, Clock, CheckCircle, XCircle, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import VerificationBadge from './verification-badge'

interface VerificationData {
  verificationStatus: string
  verificationNotes?: string
  verifiedAt?: string
  verificationRequests: Array<{
    id: string
    documentType: string
    documentName: string
    status: string
    adminNotes?: string
    createdAt: string
    reviewedAt?: string
  }>
}

export default function VerificationStatus() {
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVerificationStatus()
  }, [])

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('/api/verification/status')
      if (response.ok) {
        const data = await response.json()
        setVerificationData(data)
      }
    } catch (error) {
      console.error('Error fetching verification status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!verificationData) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          Unable to load verification status
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <Upload className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusMessage = () => {
    switch (verificationData.verificationStatus) {
      case 'APPROVED':
        return {
          title: 'Verification Complete',
          message: 'Your account has been verified! You now have a verified badge.',
          color: 'text-green-600'
        }
      case 'REJECTED':
        return {
          title: 'Verification Rejected',
          message: verificationData.verificationNotes || 'Your verification was rejected. Please contact support.',
          color: 'text-red-600'
        }
      case 'PENDING':
        return {
          title: 'Verification Pending',
          message: 'Your documents are being reviewed. This usually takes 1-2 business days.',
          color: 'text-yellow-600'
        }
      default:
        return {
          title: 'Not Verified',
          message: 'Upload your documents to get verified and build trust with clients.',
          color: 'text-gray-600'
        }
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <VerificationBadge status={verificationData.verificationStatus as any} />
            {verificationData.verifiedAt && (
              <span className="text-sm text-gray-500">
                Verified on {new Date(verificationData.verifiedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className={`p-4 rounded-lg bg-gray-50 ${statusInfo.color}`}>
            <h4 className="font-medium mb-1">{statusInfo.title}</h4>
            <p className="text-sm">{statusInfo.message}</p>
          </div>
        </CardContent>
      </Card>

      {verificationData.verificationRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Document History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {verificationData.verificationRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-medium text-sm capitalize">
                        {request.documentType.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500">{request.documentName}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    request.status === 'APPROVED' ? 'default' :
                    request.status === 'REJECTED' ? 'destructive' :
                    request.status === 'PENDING' ? 'secondary' : 'outline'
                  }>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
