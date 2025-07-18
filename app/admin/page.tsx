
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, Users, Calendar, DollarSign, Settings, 
  TrendingUp, Clock, CheckCircle, AlertTriangle,
  UserCheck, Star, Briefcase, Activity 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AuthGuard } from '@/components/auth-guard'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface AdminStats {
  overview: {
    totalUsers: number
    totalProfessionals: number
    totalClients: number
    totalBookings: number
    totalRevenue: number
    pendingBookings: number
    completedBookings: number
    totalServices: number
    pendingVerifications: number
  }
  monthlyStats: Array<{
    month: string
    bookings: number
    revenue: number
    newUsers: number
  }>
  topProfessionals: Array<{
    id: string
    name: string
    businessName?: string
    totalEarnings: number
    totalBookings: number
    averageRating: number
    isVerified: boolean
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else if (response.status === 403) {
        toast({
          title: "Acceso Denegado",
          description: "No tienes permisos de administrador",
          variant: "destructive",
        })
        router.push('/profile')
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      toast({
        title: "Error",
        description: "Error al cargar estadísticas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar datos</h2>
          <Button onClick={() => router.push('/profile')}>Volver al Perfil</Button>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/profile')}
              className="text-white hover:bg-white/20"
            >
              Volver al Perfil
            </Button>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
              <div className="text-sm opacity-90">Usuarios Totales</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{stats.overview.totalBookings}</div>
              <div className="text-sm opacity-90">Citas Totales</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">${stats.overview.totalRevenue.toFixed(0)}</div>
              <div className="text-sm opacity-90">Comisiones</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{stats.overview.pendingVerifications}</div>
              <div className="text-sm opacity-90">Verificaciones Pendientes</div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6 -mt-4">
          {/* Quick Actions */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full h-16 flex-col gap-2">
                    <Users size={20} />
                    <span className="text-sm">Gestionar Usuarios</span>
                  </Button>
                </Link>
                <Link href="/admin/bookings">
                  <Button variant="outline" className="w-full h-16 flex-col gap-2">
                    <Calendar size={20} />
                    <span className="text-sm">Gestionar Citas</span>
                  </Button>
                </Link>
                <Link href="/admin/services">
                  <Button variant="outline" className="w-full h-16 flex-col gap-2">
                    <Briefcase size={20} />
                    <span className="text-sm">Gestionar Servicios</span>
                  </Button>
                </Link>
                <Link href="/admin/verifications">
                  <Button variant="outline" className="w-full h-16 flex-col gap-2">
                    <Shield size={20} />
                    <span className="text-sm">Verificaciones</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Platform Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Estado de la Plataforma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profesionales Activos</span>
                  <Badge variant="default">{stats.overview.totalProfessionals}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Clientes Registrados</span>
                  <Badge variant="secondary">{stats.overview.totalClients}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Servicios Disponibles</span>
                  <Badge variant="outline">{stats.overview.totalServices}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Citas Pendientes</span>
                  <Badge variant="warning">{stats.overview.pendingBookings}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Citas Completadas</span>
                  <Badge variant="success">{stats.overview.completedBookings}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Verificaciones Pendientes</span>
                  <Badge variant="destructive">{stats.overview.pendingVerifications}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${stats.overview.totalRevenue.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Comisiones Totales</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    ${(stats.overview.totalRevenue / Math.max(stats.overview.completedBookings, 1)).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Promedio por Cita</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Professionals */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Top Profesionales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topProfessionals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay datos de profesionales disponibles
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.topProfessionals.slice(0, 5).map((professional, index) => (
                    <div key={professional.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{professional.name}</h4>
                          {professional.businessName && (
                            <p className="text-sm text-gray-600">{professional.businessName}</p>
                          )}
                        </div>
                        {professional.isVerified && (
                          <Badge variant="success" className="text-xs">
                            <UserCheck size={12} className="mr-1" />
                            Verificado
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          ${professional.totalEarnings.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {professional.totalBookings} citas • ⭐ {professional.averageRating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Tendencias Mensuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {stats.monthlyStats.map((month, index) => (
                  <div key={index} className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-2">
                      {month.month}
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-blue-600">
                        {month.bookings}
                      </div>
                      <div className="text-xs text-gray-600">citas</div>
                      <div className="text-sm font-semibold text-green-600">
                        ${month.revenue.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-600">{month.newUsers} nuevos</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.overview.completedBookings}</div>
                <div className="text-sm opacity-90">Citas Completadas</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.overview.pendingBookings}</div>
                <div className="text-sm opacity-90">Citas Pendientes</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.overview.totalProfessionals}</div>
                <div className="text-sm opacity-90">Profesionales</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.overview.pendingVerifications}</div>
                <div className="text-sm opacity-90">Verificaciones</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
