
'use client'

import { useEffect, useState } from 'react'
import { 
  Star, Trophy, Gift, Users, TrendingUp, Plus, Edit,
  Trash2, Settings, Award, Coins, Target, Medal,
  MoreHorizontal, ToggleLeft, DollarSign, Zap
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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'

interface RewardConfig {
  id: string
  name: string
  description: string
  pointsRequired: number
  rewardType: 'discount' | 'service' | 'product' | 'cash'
  rewardValue: string
  isActive: boolean
  maxRedeems?: number
  currentRedeems: number
  createdAt: string
  updatedAt: string
}

interface GamificationStats {
  totalPointsAwarded: number
  totalRewardsRedeemed: number
  totalBadgesEarned: number
  totalReferrals: number
  activeUsers: number
  topUsers: Array<{
    id: string
    name: string
    totalPoints: number
    level: string
    badges: number
  }>
  pointsDistribution: Array<{
    action: string
    totalPoints: number
    count: number
  }>
  rewardStats: Array<{
    rewardName: string
    redemptions: number
    pointsSpent: number
  }>
}

interface RewardForm {
  name: string
  description: string
  pointsRequired: number
  rewardType: 'discount' | 'service' | 'product' | 'cash'
  rewardValue: {
    type: 'percentage' | 'fixed_amount'
    value: number
    maxAmount?: number
    validFor?: string
  }
  isActive: boolean
  maxRedeems?: number
}

interface PointsConfig {
  bookingCompleted: number
  reviewWritten: number
  referralSuccessful: number
  firstTimeUser: number
  profileComplete: number
  photoUpload: number
  socialShare: number
}

const REWARD_TYPES = [
  { value: 'discount', label: 'Descuento' },
  { value: 'service', label: 'Servicio' },
  { value: 'product', label: 'Producto' },
  { value: 'cash', label: 'Efectivo' }
]

const POINT_ACTIONS = [
  { key: 'bookingCompleted', label: 'Cita Completada', icon: '📅' },
  { key: 'reviewWritten', label: 'Review Escrita', icon: '⭐' },
  { key: 'referralSuccessful', label: 'Referido Exitoso', icon: '👥' },
  { key: 'firstTimeUser', label: 'Primer Usuario', icon: '🎉' },
  { key: 'profileComplete', label: 'Perfil Completo', icon: '✅' },
  { key: 'photoUpload', label: 'Foto Subida', icon: '📸' },
  { key: 'socialShare', label: 'Compartir Social', icon: '🔗' }
]

export default function AdminGamificationPage() {
  const [rewards, setRewards] = useState<RewardConfig[]>([])
  const [stats, setStats] = useState<GamificationStats | null>(null)
  const [pointsConfig, setPointsConfig] = useState<PointsConfig>({
    bookingCompleted: 50,
    reviewWritten: 25,
    referralSuccessful: 100,
    firstTimeUser: 20,
    profileComplete: 30,
    photoUpload: 15,
    socialShare: 10
  })
  const [isLoading, setIsLoading] = useState(true)
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false)
  const [pointsDialogOpen, setPointsDialogOpen] = useState(false)
  const [selectedReward, setSelectedReward] = useState<RewardConfig | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [rewardForm, setRewardForm] = useState<RewardForm>({
    name: '',
    description: '',
    pointsRequired: 0,
    rewardType: 'discount',
    rewardValue: {
      type: 'percentage',
      value: 0
    },
    isActive: true
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchRewards()
    fetchStats()
    fetchPointsConfig()
  }, [])

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/admin/gamification/rewards')
      if (response.ok) {
        const data = await response.json()
        setRewards(data.rewards || [])
      } else {
        toast({
          title: "Error",
          description: "Error al cargar rewards",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching rewards:', error)
      toast({
        title: "Error",
        description: "Error al cargar rewards",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/gamification/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchPointsConfig = async () => {
    try {
      const response = await fetch('/api/admin/gamification/points-config')
      if (response.ok) {
        const data = await response.json()
        setPointsConfig(data.config || pointsConfig)
      }
    } catch (error) {
      console.error('Error fetching points config:', error)
    }
  }

  const handleCreateReward = async () => {
    try {
      const response = await fetch('/api/admin/gamification/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...rewardForm,
          rewardValue: JSON.stringify(rewardForm.rewardValue)
        })
      })

      if (response.ok) {
        toast({
          title: "Reward Creado",
          description: "El reward ha sido creado exitosamente"
        })
        setRewardDialogOpen(false)
        resetRewardForm()
        fetchRewards()
        fetchStats()
      } else {
        toast({
          title: "Error",
          description: "Error al crear reward",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating reward:', error)
      toast({
        title: "Error",
        description: "Error al crear reward",
        variant: "destructive"
      })
    }
  }

  const handleUpdateReward = async () => {
    if (!selectedReward) return

    try {
      const response = await fetch(`/api/admin/gamification/rewards/${selectedReward.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...rewardForm,
          rewardValue: JSON.stringify(rewardForm.rewardValue)
        })
      })

      if (response.ok) {
        toast({
          title: "Reward Actualizado",
          description: "El reward ha sido actualizado exitosamente"
        })
        setRewardDialogOpen(false)
        resetRewardForm()
        fetchRewards()
        fetchStats()
      } else {
        toast({
          title: "Error",
          description: "Error al actualizar reward",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating reward:', error)
      toast({
        title: "Error",
        description: "Error al actualizar reward",
        variant: "destructive"
      })
    }
  }

  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este reward?')) return

    try {
      const response = await fetch(`/api/admin/gamification/rewards/${rewardId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Reward Eliminado",
          description: "El reward ha sido eliminado exitosamente"
        })
        fetchRewards()
        fetchStats()
      } else {
        toast({
          title: "Error",
          description: "Error al eliminar reward",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting reward:', error)
      toast({
        title: "Error",
        description: "Error al eliminar reward",
        variant: "destructive"
      })
    }
  }

  const handleToggleReward = async (rewardId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/gamification/rewards/${rewardId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        toast({
          title: isActive ? "Reward Activado" : "Reward Desactivado",
          description: `El reward ha sido ${isActive ? 'activado' : 'desactivado'} exitosamente`
        })
        fetchRewards()
      } else {
        toast({
          title: "Error",
          description: "Error al cambiar estado del reward",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error toggling reward:', error)
      toast({
        title: "Error",
        description: "Error al cambiar estado del reward",
        variant: "destructive"
      })
    }
  }

  const handleUpdatePointsConfig = async () => {
    try {
      const response = await fetch('/api/admin/gamification/points-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: pointsConfig })
      })

      if (response.ok) {
        toast({
          title: "Configuración Actualizada",
          description: "La configuración de puntos ha sido actualizada exitosamente"
        })
        setPointsDialogOpen(false)
        fetchStats()
      } else {
        toast({
          title: "Error",
          description: "Error al actualizar configuración",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating points config:', error)
      toast({
        title: "Error",
        description: "Error al actualizar configuración",
        variant: "destructive"
      })
    }
  }

  const resetRewardForm = () => {
    setRewardForm({
      name: '',
      description: '',
      pointsRequired: 0,
      rewardType: 'discount',
      rewardValue: {
        type: 'percentage',
        value: 0
      },
      isActive: true
    })
    setSelectedReward(null)
    setIsEditing(false)
  }

  const openCreateDialog = () => {
    resetRewardForm()
    setRewardDialogOpen(true)
  }

  const openEditDialog = (reward: RewardConfig) => {
    setSelectedReward(reward)
    let parsedValue
    try {
      parsedValue = JSON.parse(reward.rewardValue)
    } catch {
      parsedValue = { type: 'percentage', value: 0 }
    }
    
    setRewardForm({
      name: reward.name,
      description: reward.description,
      pointsRequired: reward.pointsRequired,
      rewardType: reward.rewardType,
      rewardValue: parsedValue,
      isActive: reward.isActive,
      maxRedeems: reward.maxRedeems
    })
    setIsEditing(true)
    setRewardDialogOpen(true)
  }

  const getRewardTypeColor = (type: string) => {
    const colors = {
      'discount': 'bg-blue-100 text-blue-800',
      'service': 'bg-green-100 text-green-800',
      'product': 'bg-purple-100 text-purple-800',
      'cash': 'bg-yellow-100 text-yellow-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getRewardIcon = (type: string) => {
    const icons = {
      'discount': '💰',
      'service': '🛍️',
      'product': '🎁',
      'cash': '💵'
    }
    return icons[type as keyof typeof icons] || '🎯'
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Gamificación</h1>
          <p className="text-gray-600">Administra rewards, badges y sistema de puntos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPointsDialogOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Configurar Puntos
          </Button>
          <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Reward
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Puntos Totales</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalPointsAwarded.toLocaleString()}</p>
                </div>
                <Coins className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rewards Canjeados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalRewardsRedeemed}</p>
                </div>
                <Gift className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Badges Ganados</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalBadgesEarned}</p>
                </div>
                <Medal className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Referidos Totales</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalReferrals}</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-red-600">{stats.activeUsers}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rewards List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Rewards Configurados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getRewardIcon(reward.rewardType)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{reward.name}</h4>
                        <Badge className={getRewardTypeColor(reward.rewardType)}>
                          {reward.rewardType}
                        </Badge>
                        {!reward.isActive && (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">{reward.description}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm font-medium text-blue-600">
                          {reward.pointsRequired} puntos
                        </span>
                        <span className="text-sm text-gray-500">
                          {reward.currentRedeems} canjeados
                        </span>
                        {reward.maxRedeems && (
                          <span className="text-sm text-gray-500">
                            / {reward.maxRedeems} máx
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(reward)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleReward(reward.id, !reward.isActive)}>
                        <ToggleLeft className="mr-2 h-4 w-4" />
                        {reward.isActive ? 'Desactivar' : 'Activar'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteReward(reward.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.topUsers?.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-gray-600">Nivel {user.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{user.totalPoints.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{user.badges} badges</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Distribución de Puntos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.pointsDistribution?.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.action}</span>
                    <span className="text-sm text-gray-600">{item.totalPoints.toLocaleString()} pts</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{item.count} acciones</span>
                    <span>{Math.round((item.totalPoints / (stats?.totalPointsAwarded || 1)) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(item.totalPoints / (stats?.totalPointsAwarded || 1)) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reward Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Estadísticas de Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.rewardStats?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.rewardName}</h4>
                    <p className="text-sm text-gray-600">{item.redemptions} canjeados</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{item.pointsSpent.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">puntos gastados</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Reward Dialog */}
      <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Reward' : 'Crear Nuevo Reward'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre del Reward</Label>
                <Input
                  id="name"
                  value={rewardForm.name}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="pointsRequired">Puntos Requeridos</Label>
                <Input
                  id="pointsRequired"
                  type="number"
                  value={rewardForm.pointsRequired}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, pointsRequired: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={rewardForm.description}
                onChange={(e) => setRewardForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rewardType">Tipo de Reward</Label>
                <Select value={rewardForm.rewardType} onValueChange={(value: any) => setRewardForm(prev => ({ ...prev, rewardType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REWARD_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="maxRedeems">Máximo Canjes (opcional)</Label>
                <Input
                  id="maxRedeems"
                  type="number"
                  value={rewardForm.maxRedeems || ''}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, maxRedeems: parseInt(e.target.value) || undefined }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="valueType">Tipo de Valor</Label>
                <Select 
                  value={rewardForm.rewardValue.type} 
                  onValueChange={(value: any) => setRewardForm(prev => ({ 
                    ...prev, 
                    rewardValue: { ...prev.rewardValue, type: value } 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje</SelectItem>
                    <SelectItem value="fixed_amount">Cantidad Fija</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="value">Valor</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={rewardForm.rewardValue.value}
                  onChange={(e) => setRewardForm(prev => ({ 
                    ...prev, 
                    rewardValue: { ...prev.rewardValue, value: parseFloat(e.target.value) || 0 } 
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="maxAmount">Monto Máximo (opcional)</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  step="0.01"
                  value={rewardForm.rewardValue.maxAmount || ''}
                  onChange={(e) => setRewardForm(prev => ({ 
                    ...prev, 
                    rewardValue: { ...prev.rewardValue, maxAmount: parseFloat(e.target.value) || undefined } 
                  }))}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Reward Activo</Label>
              <Switch
                id="isActive"
                checked={rewardForm.isActive}
                onCheckedChange={(checked) => setRewardForm(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setRewardDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={isEditing ? handleUpdateReward : handleCreateReward}
              disabled={!rewardForm.name || !rewardForm.description || rewardForm.pointsRequired <= 0}
            >
              {isEditing ? 'Actualizar' : 'Crear'} Reward
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Points Configuration Dialog */}
      <Dialog open={pointsDialogOpen} onOpenChange={setPointsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configuración de Puntos</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Configura cuántos puntos se otorgan por cada acción de los usuarios
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {POINT_ACTIONS.map((action) => (
                <div key={action.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{action.icon}</span>
                    <div>
                      <Label className="text-sm font-medium">{action.label}</Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={pointsConfig[action.key as keyof PointsConfig]}
                      onChange={(e) => setPointsConfig(prev => ({ 
                        ...prev, 
                        [action.key]: parseInt(e.target.value) || 0 
                      }))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-500">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setPointsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePointsConfig}>
              Guardar Configuración
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
