
'use client'

import { useEffect, useState } from 'react'
import { 
  Settings, Save, RefreshCw, AlertTriangle, 
  Shield, DollarSign, Bell, Users, Database,
  Mail, Smartphone, Globe, Lock, Key, 
  FileText, Download, Upload, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'

interface AppSettings {
  general: {
    appName: string
    appDescription: string
    appVersion: string
    maintenanceMode: boolean
    registrationEnabled: boolean
    verificationRequired: boolean
    defaultLanguage: string
    supportEmail: string
    supportPhone: string
  }
  payment: {
    platformCommission: number
    minimumBookingAmount: number
    maximumBookingAmount: number
    processingFee: number
    refundPolicy: string
    paymentMethods: string[]
    autoPayoutEnabled: boolean
    payoutSchedule: string
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    adminNotifications: boolean
    userWelcomeEmail: boolean
    bookingConfirmations: boolean
    reviewReminders: boolean
    maintenanceNotifications: boolean
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
    requireStrongPassword: boolean
    twoFactorEnabled: boolean
    ipWhitelist: string[]
    auditLogging: boolean
    dataEncryption: boolean
  }
  integrations: {
    analyticsEnabled: boolean
    analyticsProvider: string
    analyticsKey: string
    socialLoginEnabled: boolean
    socialProviders: string[]
    webhookUrl: string
    webhookSecret: string
    apiRateLimit: number
  }
  backup: {
    autoBackupEnabled: boolean
    backupFrequency: string
    backupRetention: number
    backupLocation: string
    lastBackupDate: string
    backupSize: string
  }
}

interface SystemStatus {
  status: 'healthy' | 'warning' | 'error'
  uptime: string
  version: string
  database: {
    status: 'connected' | 'disconnected'
    size: string
    lastBackup: string
  }
  services: {
    name: string
    status: 'online' | 'offline'
    lastCheck: string
  }[]
  performance: {
    cpu: number
    memory: number
    disk: number
    responseTime: number
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
    fetchSystemStatus()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      } else {
        toast({
          title: "Error",
          description: "Error al cargar configuraciones",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: "Error",
        description: "Error al cargar configuraciones",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/admin/system/status')
      if (response.ok) {
        const data = await response.json()
        setSystemStatus(data)
      }
    } catch (error) {
      console.error('Error fetching system status:', error)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast({
          title: "Configuraciones Guardadas",
          description: "Las configuraciones han sido actualizadas exitosamente"
        })
        setHasChanges(false)
      } else {
        toast({
          title: "Error",
          description: "Error al guardar configuraciones",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Error al guardar configuraciones",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: "Backup Iniciado",
          description: "El backup de la base de datos ha sido iniciado"
        })
        fetchSystemStatus()
      } else {
        toast({
          title: "Error",
          description: "Error al iniciar backup",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error starting backup:', error)
      toast({
        title: "Error",
        description: "Error al iniciar backup",
        variant: "destructive"
      })
    }
  }

  const handleClearCache = async () => {
    try {
      const response = await fetch('/api/admin/cache/clear', {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: "Cache Limpiado",
          description: "El cache del sistema ha sido limpiado exitosamente"
        })
      } else {
        toast({
          title: "Error",
          description: "Error al limpiar cache",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error clearing cache:', error)
      toast({
        title: "Error",
        description: "Error al limpiar cache",
        variant: "destructive"
      })
    }
  }

  const updateSettings = (section: keyof AppSettings, field: string, value: any) => {
    if (!settings) return
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'connected':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
      case 'offline':
      case 'disconnected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'connected':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
      case 'offline':
      case 'disconnected':
        return '❌'
      default:
        return '⚫'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No se pudieron cargar las configuraciones</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-600">Administra las configuraciones globales de la aplicación</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600">
              Cambios sin guardar
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSystemStatus}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar Estado
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* System Status */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">{getStatusIcon(systemStatus.status)}</div>
                <div className="font-medium">Estado General</div>
                <Badge className={getStatusColor(systemStatus.status)}>
                  {systemStatus.status.toUpperCase()}
                </Badge>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">⏱️</div>
                <div className="font-medium">Tiempo Activo</div>
                <div className="text-sm text-gray-600">{systemStatus.uptime}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">💾</div>
                <div className="font-medium">Base de Datos</div>
                <Badge className={getStatusColor(systemStatus.database.status)}>
                  {systemStatus.database.status.toUpperCase()}
                </Badge>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium">Rendimiento</div>
                <div className="text-sm text-gray-600">
                  CPU: {systemStatus.performance.cpu}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payment">Pagos</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appName">Nombre de la Aplicación</Label>
                  <Input
                    id="appName"
                    value={settings.general.appName}
                    onChange={(e) => updateSettings('general', 'appName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="appVersion">Versión</Label>
                  <Input
                    id="appVersion"
                    value={settings.general.appVersion}
                    onChange={(e) => updateSettings('general', 'appVersion', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="appDescription">Descripción</Label>
                <Textarea
                  id="appDescription"
                  value={settings.general.appDescription}
                  onChange={(e) => updateSettings('general', 'appDescription', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supportEmail">Email de Soporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSettings('general', 'supportEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="supportPhone">Teléfono de Soporte</Label>
                  <Input
                    id="supportPhone"
                    value={settings.general.supportPhone}
                    onChange={(e) => updateSettings('general', 'supportPhone', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="defaultLanguage">Idioma Predeterminado</Label>
                <Select 
                  value={settings.general.defaultLanguage} 
                  onValueChange={(value) => updateSettings('general', 'defaultLanguage', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Configuraciones del Sistema</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo Mantenimiento</Label>
                    <p className="text-sm text-gray-600">Deshabilita el acceso a la aplicación</p>
                  </div>
                  <Switch
                    checked={settings.general.maintenanceMode}
                    onCheckedChange={(checked) => updateSettings('general', 'maintenanceMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Registro Habilitado</Label>
                    <p className="text-sm text-gray-600">Permitir nuevos registros</p>
                  </div>
                  <Switch
                    checked={settings.general.registrationEnabled}
                    onCheckedChange={(checked) => updateSettings('general', 'registrationEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verificación Requerida</Label>
                    <p className="text-sm text-gray-600">Requerir verificación para profesionales</p>
                  </div>
                  <Switch
                    checked={settings.general.verificationRequired}
                    onCheckedChange={(checked) => updateSettings('general', 'verificationRequired', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Configuración de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platformCommission">Comisión de Plataforma (%)</Label>
                  <Input
                    id="platformCommission"
                    type="number"
                    step="0.01"
                    value={settings.payment.platformCommission}
                    onChange={(e) => updateSettings('payment', 'platformCommission', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="processingFee">Tarifa de Procesamiento (%)</Label>
                  <Input
                    id="processingFee"
                    type="number"
                    step="0.01"
                    value={settings.payment.processingFee}
                    onChange={(e) => updateSettings('payment', 'processingFee', parseFloat(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minimumBookingAmount">Monto Mínimo de Cita ($)</Label>
                  <Input
                    id="minimumBookingAmount"
                    type="number"
                    step="0.01"
                    value={settings.payment.minimumBookingAmount}
                    onChange={(e) => updateSettings('payment', 'minimumBookingAmount', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maximumBookingAmount">Monto Máximo de Cita ($)</Label>
                  <Input
                    id="maximumBookingAmount"
                    type="number"
                    step="0.01"
                    value={settings.payment.maximumBookingAmount}
                    onChange={(e) => updateSettings('payment', 'maximumBookingAmount', parseFloat(e.target.value))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="refundPolicy">Política de Reembolsos</Label>
                <Textarea
                  id="refundPolicy"
                  value={settings.payment.refundPolicy}
                  onChange={(e) => updateSettings('payment', 'refundPolicy', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="payoutSchedule">Programación de Pagos</Label>
                <Select 
                  value={settings.payment.payoutSchedule} 
                  onValueChange={(value) => updateSettings('payment', 'payoutSchedule', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Pagos Automáticos</Label>
                  <p className="text-sm text-gray-600">Procesar pagos automáticamente</p>
                </div>
                <Switch
                  checked={settings.payment.autoPayoutEnabled}
                  onCheckedChange={(checked) => updateSettings('payment', 'autoPayoutEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuración de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-gray-600">Enviar notificaciones por correo electrónico</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones SMS</Label>
                    <p className="text-sm text-gray-600">Enviar notificaciones por SMS</p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'smsNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones Push</Label>
                    <p className="text-sm text-gray-600">Enviar notificaciones push</p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'pushNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones de Admin</Label>
                    <p className="text-sm text-gray-600">Recibir notificaciones de sistema</p>
                  </div>
                  <Switch
                    checked={settings.notifications.adminNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'adminNotifications', checked)}
                  />
                </div>
                
                <Separator />
                
                <h4 className="font-medium">Tipos de Notificaciones</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email de Bienvenida</Label>
                    <p className="text-sm text-gray-600">Enviar email de bienvenida a nuevos usuarios</p>
                  </div>
                  <Switch
                    checked={settings.notifications.userWelcomeEmail}
                    onCheckedChange={(checked) => updateSettings('notifications', 'userWelcomeEmail', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Confirmaciones de Cita</Label>
                    <p className="text-sm text-gray-600">Enviar confirmaciones de citas</p>
                  </div>
                  <Switch
                    checked={settings.notifications.bookingConfirmations}
                    onCheckedChange={(checked) => updateSettings('notifications', 'bookingConfirmations', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Recordatorios de Review</Label>
                    <p className="text-sm text-gray-600">Recordar a usuarios que dejen reviews</p>
                  </div>
                  <Switch
                    checked={settings.notifications.reviewReminders}
                    onCheckedChange={(checked) => updateSettings('notifications', 'reviewReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones de Mantenimiento</Label>
                    <p className="text-sm text-gray-600">Notificar sobre mantenimiento programado</p>
                  </div>
                  <Switch
                    checked={settings.notifications.maintenanceNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'maintenanceNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Intentos Máximos de Login</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="passwordMinLength">Longitud Mínima de Contraseña</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Contraseña Fuerte Requerida</Label>
                    <p className="text-sm text-gray-600">Requerir mayúsculas, números y símbolos</p>
                  </div>
                  <Switch
                    checked={settings.security.requireStrongPassword}
                    onCheckedChange={(checked) => updateSettings('security', 'requireStrongPassword', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Configuraciones Avanzadas</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-gray-600">Habilitar 2FA para administradores</p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorEnabled}
                    onCheckedChange={(checked) => updateSettings('security', 'twoFactorEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Logging de Auditoría</Label>
                    <p className="text-sm text-gray-600">Registrar todas las acciones admin</p>
                  </div>
                  <Switch
                    checked={settings.security.auditLogging}
                    onCheckedChange={(checked) => updateSettings('security', 'auditLogging', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Encriptación de Datos</Label>
                    <p className="text-sm text-gray-600">Encriptar datos sensibles</p>
                  </div>
                  <Switch
                    checked={settings.security.dataEncryption}
                    onCheckedChange={(checked) => updateSettings('security', 'dataEncryption', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configuración de Integraciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Analytics</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics Habilitado</Label>
                    <p className="text-sm text-gray-600">Habilitar seguimiento de analytics</p>
                  </div>
                  <Switch
                    checked={settings.integrations.analyticsEnabled}
                    onCheckedChange={(checked) => updateSettings('integrations', 'analyticsEnabled', checked)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="analyticsProvider">Proveedor de Analytics</Label>
                    <Select 
                      value={settings.integrations.analyticsProvider} 
                      onValueChange={(value) => updateSettings('integrations', 'analyticsProvider', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google Analytics</SelectItem>
                        <SelectItem value="mixpanel">Mixpanel</SelectItem>
                        <SelectItem value="amplitude">Amplitude</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="analyticsKey">Clave de Analytics</Label>
                    <Input
                      id="analyticsKey"
                      type="password"
                      value={settings.integrations.analyticsKey}
                      onChange={(e) => updateSettings('integrations', 'analyticsKey', e.target.value)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <h4 className="font-medium">Webhooks</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="webhookUrl">URL del Webhook</Label>
                    <Input
                      id="webhookUrl"
                      value={settings.integrations.webhookUrl}
                      onChange={(e) => updateSettings('integrations', 'webhookUrl', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhookSecret">Secreto del Webhook</Label>
                    <Input
                      id="webhookSecret"
                      type="password"
                      value={settings.integrations.webhookSecret}
                      onChange={(e) => updateSettings('integrations', 'webhookSecret', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="apiRateLimit">Límite de Rate API (por minuto)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={settings.integrations.apiRateLimit}
                    onChange={(e) => updateSettings('integrations', 'apiRateLimit', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configuración de Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Backup Automático</Label>
                  <p className="text-sm text-gray-600">Realizar backups automáticos</p>
                </div>
                <Switch
                  checked={settings.backup.autoBackupEnabled}
                  onCheckedChange={(checked) => updateSettings('backup', 'autoBackupEnabled', checked)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backupFrequency">Frecuencia de Backup</Label>
                  <Select 
                    value={settings.backup.backupFrequency} 
                    onValueChange={(value) => updateSettings('backup', 'backupFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="backupRetention">Retención (días)</Label>
                  <Input
                    id="backupRetention"
                    type="number"
                    value={settings.backup.backupRetention}
                    onChange={(e) => updateSettings('backup', 'backupRetention', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="backupLocation">Ubicación del Backup</Label>
                <Input
                  id="backupLocation"
                  value={settings.backup.backupLocation}
                  onChange={(e) => updateSettings('backup', 'backupLocation', e.target.value)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Estado del Backup</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Label>Último Backup</Label>
                    <p className="text-sm text-gray-600">{settings.backup.lastBackupDate || 'Nunca'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Label>Tamaño del Backup</Label>
                    <p className="text-sm text-gray-600">{settings.backup.backupSize || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleBackup} className="bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Crear Backup Ahora
                  </Button>
                  <Button variant="outline" onClick={handleClearCache}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpiar Cache
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
