
'use client'

import { useEffect, useState } from 'react'
import { 
  Users, Ban, Eye, Edit, Trash2, Search, Filter, 
  UserCheck, UserX, Shield, Calendar, DollarSign,
  MoreHorizontal, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface User {
  id: string
  email: string
  name: string
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN'
  verificationStatus: 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED'
  phone?: string
  avatar?: string
  createdAt: string
  updatedAt: string
  isBanned?: boolean
  banReason?: string
  _count?: {
    bookingsAsClient: number
    bookingsAsProfessional: number
    reviewsGiven: number
    reviewsReceived: number
  }
  professionalProfile?: {
    businessName: string
    averageRating: number
    totalEarnings: number
    totalReviews: number
    isVerified: boolean
  }
}

interface UserBan {
  id: string
  reason: string
  bannedAt: string
  expiresAt?: string
  isActive: boolean
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [banDuration, setBanDuration] = useState('permanent')
  const [userStats, setUserStats] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
    fetchUserStats()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        toast({
          title: "Error",
          description: "Error al cargar usuarios",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Error al cargar usuarios",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/admin/users/stats')
      if (response.ok) {
        const data = await response.json()
        setUserStats(data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleBanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: banReason,
          duration: banDuration
        })
      })

      if (response.ok) {
        toast({
          title: "Usuario Baneado",
          description: "El usuario ha sido baneado exitosamente"
        })
        setBanDialogOpen(false)
        setBanReason('')
        setSelectedUser(null)
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: "Error al banear usuario",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error banning user:', error)
      toast({
        title: "Error",
        description: "Error al banear usuario",
        variant: "destructive"
      })
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: "Usuario Desbaneado",
          description: "El usuario ha sido desbaneado exitosamente"
        })
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: "Error al desbanear usuario",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error unbanning user:', error)
      toast({
        title: "Error",
        description: "Error al desbanear usuario",
        variant: "destructive"
      })
    }
  }

  const handleVerifyUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: "Usuario Verificado",
          description: "El usuario ha sido verificado exitosamente"
        })
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: "Error al verificar usuario",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error verifying user:', error)
      toast({
        title: "Error",
        description: "Error al verificar usuario",
        variant: "destructive"
      })
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || user.verificationStatus === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'PROFESSIONAL': return 'bg-blue-100 text-blue-800'
      case 'CLIENT': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'UNVERIFIED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra todos los usuarios de la plataforma</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {filteredUsers.length} usuarios
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-blue-600">{userStats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profesionales</p>
                  <p className="text-2xl font-bold text-green-600">{userStats.professionals}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clientes</p>
                  <p className="text-2xl font-bold text-purple-600">{userStats.clients}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Baneados</p>
                  <p className="text-2xl font-bold text-red-600">{userStats.bannedUsers}</p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
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
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="CLIENT">Cliente</SelectItem>
                  <SelectItem value="PROFESSIONAL">Profesional</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
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
                  <SelectItem value="APPROVED">Aprobado</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="REJECTED">Rechazado</SelectItem>
                  <SelectItem value="UNVERIFIED">Sin verificar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Usuario</th>
                  <th className="text-left py-3 px-4">Rol</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Actividad</th>
                  <th className="text-left py-3 px-4">Fecha Registro</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || ''} />
                          <AvatarFallback>
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.professionalProfile && (
                            <div className="text-sm text-blue-600">
                              {user.professionalProfile.businessName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col space-y-1">
                        <Badge className={getStatusColor(user.verificationStatus)}>
                          {user.verificationStatus}
                        </Badge>
                        {user.isBanned && (
                          <Badge variant="destructive" className="text-xs">
                            Baneado
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {user._count && (
                          <div className="space-y-1">
                            <div>Citas: {user._count.bookingsAsClient + user._count.bookingsAsProfessional}</div>
                            <div>Reviews: {user._count.reviewsGiven + user._count.reviewsReceived}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          {user.verificationStatus === 'PENDING' && (
                            <DropdownMenuItem onClick={() => handleVerifyUser(user.id)}>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Verificar
                            </DropdownMenuItem>
                          )}
                          {!user.isBanned ? (
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user)
                                setBanDialogOpen(true)
                              }}
                              className="text-red-600"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Banear
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleUnbanUser(user.id)}
                              className="text-green-600"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Desbanear
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Banear Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="banReason">Razón del baneo</Label>
              <Textarea
                id="banReason"
                placeholder="Especifica la razón del baneo..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="banDuration">Duración</Label>
              <Select value={banDuration} onValueChange={setBanDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1day">1 día</SelectItem>
                  <SelectItem value="1week">1 semana</SelectItem>
                  <SelectItem value="1month">1 mes</SelectItem>
                  <SelectItem value="3months">3 meses</SelectItem>
                  <SelectItem value="permanent">Permanente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => selectedUser && handleBanUser(selectedUser.id)}
                disabled={!banReason.trim()}
              >
                Banear Usuario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser && !banDialogOpen} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedUser.avatar || ''} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                    <Badge className={getStatusColor(selectedUser.verificationStatus)}>
                      {selectedUser.verificationStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Información</TabsTrigger>
                  <TabsTrigger value="activity">Actividad</TabsTrigger>
                  <TabsTrigger value="professional">Profesional</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Teléfono</Label>
                      <p className="text-sm text-gray-600">{selectedUser.phone || 'No especificado'}</p>
                    </div>
                    <div>
                      <Label>Fecha de registro</Label>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="activity" className="space-y-4">
                  {selectedUser._count && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Citas como cliente</Label>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedUser._count.bookingsAsClient}
                        </p>
                      </div>
                      <div>
                        <Label>Citas como profesional</Label>
                        <p className="text-2xl font-bold text-green-600">
                          {selectedUser._count.bookingsAsProfessional}
                        </p>
                      </div>
                      <div>
                        <Label>Reviews dadas</Label>
                        <p className="text-2xl font-bold text-purple-600">
                          {selectedUser._count.reviewsGiven}
                        </p>
                      </div>
                      <div>
                        <Label>Reviews recibidas</Label>
                        <p className="text-2xl font-bold text-orange-600">
                          {selectedUser._count.reviewsReceived}
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="professional" className="space-y-4">
                  {selectedUser.professionalProfile ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Nombre del negocio</Label>
                        <p className="text-sm text-gray-600">
                          {selectedUser.professionalProfile.businessName}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Rating promedio</Label>
                          <p className="text-2xl font-bold text-yellow-600">
                            ⭐ {selectedUser.professionalProfile.averageRating.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <Label>Ganancias totales</Label>
                          <p className="text-2xl font-bold text-green-600">
                            ${selectedUser.professionalProfile.totalEarnings.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No es un profesional</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
