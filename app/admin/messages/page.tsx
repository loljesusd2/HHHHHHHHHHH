
'use client'

import { useEffect, useState } from 'react'
import { 
  MessageSquare, Mail, AlertTriangle, UserCheck, 
  Clock, CheckCircle, X, Reply, Archive, Search,
  Filter, MoreHorizontal, Flag, User, Calendar
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

interface AdminMessage {
  id: string
  fromId: string
  subject: string
  message: string
  type: 'support' | 'verification' | 'report' | 'contact'
  status: 'unread' | 'read' | 'responded' | 'resolved'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  createdAt: string
  updatedAt: string
  from: {
    id: string
    name: string
    email: string
    avatar?: string
    role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN'
  }
  responses?: MessageResponse[]
}

interface MessageResponse {
  id: string
  messageId: string
  adminId: string
  response: string
  createdAt: string
  admin: {
    name: string
    email: string
  }
}

interface MessageStats {
  total: number
  unread: number
  pending: number
  resolved: number
  byType: {
    support: number
    verification: number
    report: number
    contact: number
  }
  byPriority: {
    low: number
    normal: number
    high: number
    urgent: number
  }
}

const MESSAGE_TYPES = [
  { value: 'support', label: 'Soporte', icon: '🛠️', color: 'bg-blue-100 text-blue-800' },
  { value: 'verification', label: 'Verificación', icon: '✅', color: 'bg-green-100 text-green-800' },
  { value: 'report', label: 'Reporte', icon: '⚠️', color: 'bg-red-100 text-red-800' },
  { value: 'contact', label: 'Contacto', icon: '📧', color: 'bg-purple-100 text-purple-800' }
]

const MESSAGE_STATUSES = [
  { value: 'unread', label: 'Sin leer', color: 'bg-gray-100 text-gray-800' },
  { value: 'read', label: 'Leído', color: 'bg-blue-100 text-blue-800' },
  { value: 'responded', label: 'Respondido', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'resolved', label: 'Resuelto', color: 'bg-green-100 text-green-800' }
]

const MESSAGE_PRIORITIES = [
  { value: 'low', label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' }
]

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [stats, setStats] = useState<MessageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [isResponding, setIsResponding] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchMessages()
    fetchStats()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        toast({
          title: "Error",
          description: "Error al cargar mensajes",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast({
        title: "Error",
        description: "Error al cargar mensajes",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/messages/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}/read`, {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: "Mensaje Marcado",
          description: "El mensaje ha sido marcado como leído"
        })
        fetchMessages()
        fetchStats()
      } else {
        toast({
          title: "Error",
          description: "Error al marcar mensaje como leído",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
      toast({
        title: "Error",
        description: "Error al marcar mensaje como leído",
        variant: "destructive"
      })
    }
  }

  const handleUpdateStatus = async (messageId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast({
          title: "Estado Actualizado",
          description: "El estado del mensaje ha sido actualizado"
        })
        fetchMessages()
        fetchStats()
      } else {
        toast({
          title: "Error",
          description: "Error al actualizar estado del mensaje",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating message status:', error)
      toast({
        title: "Error",
        description: "Error al actualizar estado del mensaje",
        variant: "destructive"
      })
    }
  }

  const handleUpdatePriority = async (messageId: string, priority: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}/priority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      })

      if (response.ok) {
        toast({
          title: "Prioridad Actualizada",
          description: "La prioridad del mensaje ha sido actualizada"
        })
        fetchMessages()
        fetchStats()
      } else {
        toast({
          title: "Error",
          description: "Error al actualizar prioridad del mensaje",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating message priority:', error)
      toast({
        title: "Error",
        description: "Error al actualizar prioridad del mensaje",
        variant: "destructive"
      })
    }
  }

  const handleSendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) return

    setIsResponding(true)
    try {
      const response = await fetch(`/api/admin/messages/${selectedMessage.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText })
      })

      if (response.ok) {
        toast({
          title: "Respuesta Enviada",
          description: "La respuesta ha sido enviada exitosamente"
        })
        setResponseText('')
        fetchMessages()
        fetchStats()
        // Reload the selected message to show the new response
        const updatedMessage = await fetch(`/api/admin/messages/${selectedMessage.id}`).then(res => res.json())
        setSelectedMessage(updatedMessage.message)
      } else {
        toast({
          title: "Error",
          description: "Error al enviar respuesta",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error sending response:', error)
      toast({
        title: "Error",
        description: "Error al enviar respuesta",
        variant: "destructive"
      })
    } finally {
      setIsResponding(false)
    }
  }

  const openMessageDialog = (message: AdminMessage) => {
    setSelectedMessage(message)
    setMessageDialogOpen(true)
    if (message.status === 'unread') {
      handleMarkAsRead(message.id)
    }
  }

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.from.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'ALL' || message.type === typeFilter
    const matchesStatus = statusFilter === 'ALL' || message.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || message.priority === priorityFilter
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority
  })

  const getTypeData = (type: string) => {
    return MESSAGE_TYPES.find(t => t.value === type) || MESSAGE_TYPES[0]
  }

  const getStatusData = (status: string) => {
    return MESSAGE_STATUSES.find(s => s.value === status) || MESSAGE_STATUSES[0]
  }

  const getPriorityData = (priority: string) => {
    return MESSAGE_PRIORITIES.find(p => p.value === priority) || MESSAGE_PRIORITIES[0]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Hace menos de 1 hora'
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`
    } else if (diffInHours < 48) {
      return 'Ayer'
    } else {
      return date.toLocaleDateString()
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Centro de Mensajes</h1>
          <p className="text-gray-600">Gestiona mensajes de usuarios y tickets de soporte</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {filteredMessages.length} mensajes
          </Badge>
          {stats && stats.unread > 0 && (
            <Badge variant="destructive">
              {stats.unread} sin leer
            </Badge>
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
                  <p className="text-sm font-medium text-gray-600">Total Mensajes</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sin Leer</p>
                  <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
                </div>
                <Mail className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resueltos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar mensajes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {MESSAGE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {MESSAGE_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas</SelectItem>
                  {MESSAGE_PRIORITIES.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Mensajes ({filteredMessages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMessages.map((message) => {
              const typeData = getTypeData(message.type)
              const statusData = getStatusData(message.status)
              const priorityData = getPriorityData(message.priority)
              
              return (
                <div 
                  key={message.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    message.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => openMessageDialog(message)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={message.from.avatar || ''} />
                        <AvatarFallback>
                          {message.from.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{message.from.name}</span>
                          <Badge className={typeData.color}>
                            {typeData.icon} {typeData.label}
                          </Badge>
                          <Badge className={statusData.color}>
                            {statusData.label}
                          </Badge>
                          <Badge className={priorityData.color}>
                            {priorityData.label}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{message.from.email}</span>
                          <span>{formatDate(message.createdAt)}</span>
                          {message.responses && message.responses.length > 0 && (
                            <span className="text-blue-600">
                              {message.responses.length} respuesta(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateStatus(message.id, 'read')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como leído
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(message.id, 'resolved')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como resuelto
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdatePriority(message.id, 'urgent')}>
                            <Flag className="mr-2 h-4 w-4" />
                            Marcar como urgente
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdatePriority(message.id, 'low')}>
                            <Flag className="mr-2 h-4 w-4" />
                            Marcar como baja prioridad
                          </DropdownMenuItem>
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

      {/* Message Detail Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Mensaje</DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              {/* Message Header */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedMessage.from.avatar || ''} />
                    <AvatarFallback>
                      {selectedMessage.from.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedMessage.from.name}</h3>
                    <p className="text-sm text-gray-600">{selectedMessage.from.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(selectedMessage.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getTypeData(selectedMessage.type).color}>
                    {getTypeData(selectedMessage.type).icon} {getTypeData(selectedMessage.type).label}
                  </Badge>
                  <Badge className={getStatusData(selectedMessage.status).color}>
                    {getStatusData(selectedMessage.status).label}
                  </Badge>
                  <Badge className={getPriorityData(selectedMessage.priority).color}>
                    {getPriorityData(selectedMessage.priority).label}
                  </Badge>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Asunto</h4>
                  <p className="text-gray-700">{selectedMessage.subject}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mensaje</h4>
                  <div className="bg-white p-4 border rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>

              {/* Responses */}
              {selectedMessage.responses && selectedMessage.responses.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Respuestas</h4>
                  <div className="space-y-3">
                    {selectedMessage.responses.map((response, index) => (
                      <div key={response.id} className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {response.admin.name?.charAt(0)?.toUpperCase() || 'A'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium text-sm">{response.admin.name}</span>
                              <p className="text-xs text-gray-500">{response.admin.email}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(response.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{response.response}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Response Form */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Responder</h4>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Escribe tu respuesta aquí..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Select 
                        value={selectedMessage.status} 
                        onValueChange={(value) => handleUpdateStatus(selectedMessage.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MESSAGE_STATUSES.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={selectedMessage.priority} 
                        onValueChange={(value) => handleUpdatePriority(selectedMessage.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MESSAGE_PRIORITIES.map(priority => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleSendResponse}
                      disabled={!responseText.trim() || isResponding}
                    >
                      {isResponding ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Reply className="h-4 w-4 mr-2" />
                      )}
                      Enviar Respuesta
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
