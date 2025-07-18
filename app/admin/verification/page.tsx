
'use client'

import { useEffect, useState } from 'react'
import { 
  CheckCircle, X, Eye, Download, FileText, 
  User, Calendar, Clock, Shield, AlertTriangle,
  MoreHorizontal, Search, Filter, MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'

interface VerificationRequest {
  id: string
  userId: string
  documentType: string
  documentUrl: string
  documentName: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN'
    phone?: string
    verificationStatus: 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED'
    professionalProfile?: {
      businessName: string
      bio?: string
      address: string
      city: string
      state: string
      zipCode: string
      yearsExperience?: number
      certifications: string[]
      isVerified: boolean
    }
  }
  reviewedByAdmin?: {
    name: string
    email: string
  }
}

interface VerificationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  byDocumentType: {
    [key: string]: number
  }
  recentActivity: Array<{
    id: string
    userName: string
    action: string
    timestamp: string
  }>
}

const DOCUMENT_TYPES = [
  { value: 'id', label: 'Identificación', icon: '🆔' },
  { value: 'license', label: 'Licencia Profesional', icon: '📜' },
  { value: 'certification', label: 'Certificación', icon: '🏆' },
  { value: 'business_license', label: 'Licencia de Negocio', icon: '🏢' },
  { value: 'insurance', label: 'Seguro', icon: '🛡️' },
  { value: 'other', label: 'Otro', icon: '📄' }
]

const VERIFICATION_STATUSES = [
  { value: 'PENDING', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'APPROVED', label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  { value: 'REJECTED', label: 'Rechazado', color: 'bg-red-100 text-red-800' }
]

export default function AdminVerificationPage() {
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [stats, setStats] = useState<VerificationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [documentTypeFilter, setDocumentTypeFilter] = useState('ALL')
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [adminNotes, setAdminNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchVerificationRequests()
    fetchStats()
  }, [])

  const fetchVerificationRequests = async () => {
    try {
      const response = await fetch('/api/admin/verification/requests')
      if (response.ok) {
        const data = await response.json()
        setVerificationRequests(data.requests || [])
      } else {
        toast({
          title: "Error",
          description: "Error al cargar solicitudes de verificación",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching verification requests:', error)
      toast({
        title: "Error",
        description: "Error al cargar solicitudes de verificación",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/verification/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleReviewRequest = async () => {
    if (!selectedRequest) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/verification/requests/${selectedRequest.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewAction === 'approve' ? 'APPROVED' : 'REJECTED',
          adminNotes
        })
      })

      if (response.ok) {
        toast({
          title: reviewAction === 'approve' ? "Verificación Aprobada" : "Verificación Rechazada",
          description: `La verificación ha sido ${reviewAction === 'approve' ? 'aprobada' : 'rechazada'} exitosamente`
        })
        setReviewDialogOpen(false)
        setVerificationDialogOpen(false)
        setAdminNotes('')
        setSelectedRequest(null)
        fetchVerificationRequests()
        fetchStats()
      } else {
        toast({
          title: "Error",
          description: "Error al procesar la verificación",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error reviewing request:', error)
      toast({
        title: "Error",
        description: "Error al procesar la verificación",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkApprove = async (requestIds: string[]) => {
    if (!confirm(`¿Estás seguro de que quieres aprobar ${requestIds.length} solicitudes?`)) return

    try {
      const response = await fetch('/api/admin/verification/requests/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestIds })
      })

      if (response.ok) {
        toast({
          title: "Verificaciones Aprobadas",
          description: `${requestIds.length} solicitudes han sido aprobadas exitosamente`
        })
        fetchVerificationRequests()
        fetchStats()
      } else {
        toast({
          title: "Error",
          description: "Error al aprobar solicitudes en lote",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error bulk approving requests:', error)
      toast({
        title: "Error",
        description: "Error al aprobar solicitudes en lote",
        variant: "destructive"
      })
    }
  }

  const openReviewDialog = (request: VerificationRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setReviewAction(action)
    setAdminNotes(request.adminNotes || '')
    setReviewDialogOpen(true)
  }

  const openVerificationDialog = (request: VerificationRequest) => {
    setSelectedRequest(request)
    setVerificationDialogOpen(true)
  }

  const filteredRequests = verificationRequests.filter(request => {
    const matchesSearch = request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.documentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter
    const matchesDocumentType = documentTypeFilter === 'ALL' || request.documentType === documentTypeFilter
    
    return matchesSearch && matchesStatus && matchesDocumentType
  })

  const getStatusColor = (status: string) => {
    return VERIFICATION_STATUSES.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800'
  }

  const getDocumentTypeData = (type: string) => {
    return DOCUMENT_TYPES.find(dt => dt.value === type) || { value: type, label: type, icon: '📄' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const pendingRequests = filteredRequests.filter(r => r.status === 'PENDING')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Verificaciones</h1>
          <p className="text-gray-600">Procesa solicitudes de verificación de profesionales</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {filteredRequests.length} solicitudes
          </Badge>
          {stats && stats.pending > 0 && (
            <Badge variant="destructive">
              {stats.pending} pendientes
            </Badge>
          )}
          {pendingRequests.length > 0 && (
            <Button
              onClick={() => handleBulkApprove(pendingRequests.map(r => r.id))}
              className="bg-green-600 hover:bg-green-700"
            >
              Aprobar Todas Pendientes
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Solicitudes</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rechazadas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <X className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, email o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {VERIFICATION_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Verificación ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const documentTypeData = getDocumentTypeData(request.documentType)
              
              return (
                <div 
                  key={request.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    request.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => openVerificationDialog(request)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={request.user.avatar || ''} />
                        <AvatarFallback>
                          {request.user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{request.user.name}</span>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status === 'PENDING' ? 'Pendiente' : 
                             request.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                          </Badge>
                          {request.user.professionalProfile && (
                            <Badge variant="outline" className="text-xs">
                              {request.user.role}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {documentTypeData.icon} {documentTypeData.label}
                        </h4>
                        <p className="text-sm text-gray-600">{request.documentName}</p>
                        {request.user.professionalProfile && (
                          <p className="text-sm text-blue-600 mt-1">
                            {request.user.professionalProfile.businessName}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{request.user.email}</span>
                          <span>{formatDate(request.createdAt)}</span>
                          {request.reviewedAt && (
                            <span className="text-blue-600">
                              Revisado: {formatDate(request.reviewedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {request.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              openReviewDialog(request, 'approve')
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              openReviewDialog(request, 'reject')
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openVerificationDialog(request)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(request.documentUrl, '_blank')}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar documento
                          </DropdownMenuItem>
                          {request.status !== 'PENDING' && (
                            <DropdownMenuItem onClick={() => openReviewDialog(request, 'approve')}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Revisar nuevamente
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Verification Detail Dialog */}
      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Verificación</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedRequest.user.avatar || ''} />
                  <AvatarFallback>
                    {selectedRequest.user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{selectedRequest.user.name}</h3>
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status === 'PENDING' ? 'Pendiente' : 
                       selectedRequest.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{selectedRequest.user.email}</p>
                  {selectedRequest.user.phone && (
                    <p className="text-sm text-gray-600 mb-1">{selectedRequest.user.phone}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Miembro desde: {formatDate(selectedRequest.createdAt)}
                  </p>
                </div>
              </div>

              {/* Professional Profile */}
              {selectedRequest.user.professionalProfile && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Perfil Profesional</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre del Negocio</Label>
                      <p className="text-sm text-gray-700">{selectedRequest.user.professionalProfile.businessName}</p>
                    </div>
                    <div>
                      <Label>Años de Experiencia</Label>
                      <p className="text-sm text-gray-700">{selectedRequest.user.professionalProfile.yearsExperience || 'No especificado'}</p>
                    </div>
                    <div className="col-span-2">
                      <Label>Dirección</Label>
                      <p className="text-sm text-gray-700">
                        {selectedRequest.user.professionalProfile.address}, {selectedRequest.user.professionalProfile.city}, {selectedRequest.user.professionalProfile.state} {selectedRequest.user.professionalProfile.zipCode}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Label>Certificaciones</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedRequest.user.professionalProfile.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Documento de Verificación</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Documento</Label>
                    <p className="text-sm text-gray-700">
                      {getDocumentTypeData(selectedRequest.documentType).icon} {getDocumentTypeData(selectedRequest.documentType).label}
                    </p>
                  </div>
                  <div>
                    <Label>Nombre del Archivo</Label>
                    <p className="text-sm text-gray-700">{selectedRequest.documentName}</p>
                  </div>
                  <div>
                    <Label>Fecha de Subida</Label>
                    <p className="text-sm text-gray-700">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                  {selectedRequest.reviewedAt && (
                    <div>
                      <Label>Fecha de Revisión</Label>
                      <p className="text-sm text-gray-700">{formatDate(selectedRequest.reviewedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Preview */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Vista Previa del Documento</h4>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Documento</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedRequest.documentUrl, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                  <div className="max-w-full overflow-hidden">
                    <img 
                      src={selectedRequest.documentUrl} 
                      alt="Document preview" 
                      className="max-w-full h-auto rounded border"
                      style={{ maxHeight: '400px' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling!.innerHTML = `
                          <div class="flex items-center justify-center h-32 bg-gray-100 rounded border">
                            <div class="text-center">
                              <FileText class="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p class="text-sm text-gray-500">Vista previa no disponible</p>
                              <p class="text-xs text-gray-400">Haz clic en "Descargar" para ver el documento</p>
                            </div>
                          </div>
                        `;
                      }}
                    />
                    <div style={{ display: 'none' }}></div>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedRequest.adminNotes && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Notas del Administrador</h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedRequest.adminNotes}</p>
                    {selectedRequest.reviewedByAdmin && (
                      <p className="text-xs text-gray-500 mt-2">
                        Por: {selectedRequest.reviewedByAdmin.name} ({selectedRequest.reviewedByAdmin.email})
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedRequest.status === 'PENDING' && (
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => openReviewDialog(selectedRequest, 'reject')}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => openReviewDialog(selectedRequest, 'approve')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprobar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Aprobar Verificación' : 'Rechazar Verificación'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {reviewAction === 'approve' ? 'Aprobar verificación de:' : 'Rechazar verificación de:'}
              </h4>
              <p className="text-sm text-gray-700">{selectedRequest?.user.name}</p>
              <p className="text-sm text-gray-600">{selectedRequest?.user.email}</p>
            </div>
            
            <div>
              <Label htmlFor="adminNotes">
                {reviewAction === 'approve' ? 'Notas adicionales (opcional)' : 'Motivo del rechazo (requerido)'}
              </Label>
              <Textarea
                id="adminNotes"
                placeholder={
                  reviewAction === 'approve' 
                    ? 'Agregar notas adicionales...'
                    : 'Especifica el motivo del rechazo...'
                }
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleReviewRequest}
                disabled={isProcessing || (reviewAction === 'reject' && !adminNotes.trim())}
                className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : reviewAction === 'approve' ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                {reviewAction === 'approve' ? 'Aprobar' : 'Rechazar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
