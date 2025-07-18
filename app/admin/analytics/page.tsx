
'use client'

import { useEffect, useState } from 'react'
import { 
  BarChart3, TrendingUp, Users, DollarSign, 
  Calendar, Clock, Star, Target, Activity,
  Download, Filter, RefreshCw, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalBookings: number
    totalRevenue: number
    totalProfessionals: number
    growth: {
      users: number
      bookings: number
      revenue: number
      professionals: number
    }
  }
  userGrowth: Array<{
    date: string
    clients: number
    professionals: number
    total: number
  }>
  revenueData: Array<{
    month: string
    revenue: number
    bookings: number
    averageBookingValue: number
  }>
  serviceCategories: Array<{
    category: string
    count: number
    revenue: number
    percentage: number
  }>
  geographicData: Array<{
    city: string
    state: string
    users: number
    bookings: number
    revenue: number
  }>
  topProfessionals: Array<{
    id: string
    name: string
    businessName: string
    totalBookings: number
    totalRevenue: number
    averageRating: number
  }>
  conversionFunnel: Array<{
    stage: string
    count: number
    percentage: number
  }>
  activeUsers: {
    daily: number
    weekly: number
    monthly: number
  }
  bookingTrends: Array<{
    date: string
    bookings: number
    completionRate: number
    cancelationRate: number
  }>
}

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3', '#A19AD3', '#72BF78']

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        toast({
          title: "Error",
          description: "Error al cargar analytics",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast({
        title: "Error",
        description: "Error al cargar analytics",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchAnalytics()
  }

  const handleExport = async (type: 'pdf' | 'csv') => {
    try {
      const response = await fetch(`/api/admin/analytics/export?type=${type}&timeRange=${timeRange}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${timeRange}.${type}`
        a.click()
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Exportación Exitosa",
          description: `El reporte ha sido exportado en formato ${type.toUpperCase()}`
        })
      } else {
        toast({
          title: "Error",
          description: "Error al exportar el reporte",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error exporting analytics:', error)
      toast({
        title: "Error",
        description: "Error al exportar el reporte",
        variant: "destructive"
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{growth.toFixed(1)}%
        <TrendingUp className={`ml-1 h-3 w-3 ${isPositive ? '' : 'transform rotate-180'}`} />
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No se pudieron cargar los datos de analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Avanzados</h1>
          <p className="text-gray-600">Dashboard completo de métricas y análisis</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-blue-600">{analyticsData.overview.totalUsers.toLocaleString()}</p>
                <div className="mt-1">{formatGrowth(analyticsData.overview.growth.users)}</div>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Citas</p>
                <p className="text-2xl font-bold text-green-600">{analyticsData.overview.totalBookings.toLocaleString()}</p>
                <div className="mt-1">{formatGrowth(analyticsData.overview.growth.bookings)}</div>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
                <div className="mt-1">{formatGrowth(analyticsData.overview.growth.revenue)}</div>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profesionales</p>
                <p className="text-2xl font-bold text-orange-600">{analyticsData.overview.totalProfessionals.toLocaleString()}</p>
                <div className="mt-1">{formatGrowth(analyticsData.overview.growth.professionals)}</div>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Usuarios Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analyticsData.activeUsers.daily.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Diarios</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analyticsData.activeUsers.weekly.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Semanales</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analyticsData.activeUsers.monthly.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Mensuales</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="growth">Crecimiento</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="geographic">Geográfico</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="growth" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Crecimiento de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analyticsData.userGrowth.reduce((sum, day) => sum + day.clients, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Clientes</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {analyticsData.userGrowth.reduce((sum, day) => sum + day.professionals, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Profesionales</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analyticsData.userGrowth.reduce((sum, day) => sum + day.total, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Datos de los últimos 30 días
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Embudo de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.conversionFunnel.map((stage, index) => (
                    <div key={stage.stage} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-600" />
                        <span className="text-sm font-medium">{stage.stage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${stage.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stage.count.toLocaleString()}</span>
                        <span className="text-xs text-gray-500">({stage.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Ingresos Mensuales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.revenueData.slice(0, 6).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{item.month}</span>
                        <p className="text-sm text-gray-600">{item.bookings} citas</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{formatCurrency(item.revenue)}</div>
                        <div className="text-sm text-gray-500">
                          Promedio: {formatCurrency(item.averageBookingValue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Booking Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Citas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analyticsData.bookingTrends.reduce((sum, day) => sum + day.bookings, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Citas</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(analyticsData.bookingTrends.reduce((sum, day) => sum + day.completionRate, 0) / analyticsData.bookingTrends.length)}%
                      </div>
                      <div className="text-sm text-gray-600">Completadas</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {Math.round(analyticsData.bookingTrends.reduce((sum, day) => sum + day.cancelationRate, 0) / analyticsData.bookingTrends.length)}%
                      </div>
                      <div className="text-sm text-gray-600">Canceladas</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Promedios de los últimos 30 días
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Categories Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Categorías de Servicios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.serviceCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{category.category.replace('_', ' ')}</span>
                        <span className="text-sm text-gray-600">{category.count} servicios</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={category.percentage} className="flex-1" />
                        <span className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        {formatCurrency(category.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Professionals */}
            <Card>
              <CardHeader>
                <CardTitle>Top Profesionales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topProfessionals.map((professional, index) => (
                    <div key={professional.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{professional.name}</h4>
                          <p className="text-sm text-gray-600">{professional.businessName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(professional.totalRevenue)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {professional.totalBookings} citas • ⭐ {professional.averageRating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución Geográfica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Ciudad</th>
                      <th className="text-left py-2">Estado</th>
                      <th className="text-left py-2">Usuarios</th>
                      <th className="text-left py-2">Citas</th>
                      <th className="text-left py-2">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.geographicData.map((location, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 font-medium">{location.city}</td>
                        <td className="py-2 text-gray-600">{location.state}</td>
                        <td className="py-2">{location.users.toLocaleString()}</td>
                        <td className="py-2">{location.bookings.toLocaleString()}</td>
                        <td className="py-2 text-green-600 font-medium">
                          {formatCurrency(location.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Performance KPIs */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(analyticsData.overview.totalBookings / analyticsData.overview.totalUsers * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Tasa de Conversión</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(analyticsData.overview.totalRevenue / analyticsData.overview.totalBookings)}
                  </div>
                  <div className="text-sm text-gray-600">Valor Promedio por Cita</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {(analyticsData.overview.totalBookings / analyticsData.overview.totalProfessionals).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Citas por Profesional</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(analyticsData.overview.totalRevenue / analyticsData.overview.totalProfessionals)}
                  </div>
                  <div className="text-sm text-gray-600">Ingresos por Profesional</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
