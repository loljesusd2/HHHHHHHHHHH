
'use client'

import { useEffect, useState } from 'react'
import { 
  FileText, Image, Settings, Edit, Save, X, Plus,
  Upload, Eye, Trash2, RefreshCw, Search, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'

interface ContentItem {
  id: string
  key: string
  type: 'text' | 'image' | 'config' | 'json'
  value: string
  category: 'app' | 'legal' | 'marketing' | 'help'
  updatedBy: string
  updatedAt: string
  createdAt: string
  admin: {
    name: string
    email: string
  }
}

interface ContentForm {
  key: string
  type: 'text' | 'image' | 'config' | 'json'
  value: string
  category: 'app' | 'legal' | 'marketing' | 'help'
}

const CONTENT_TYPES = [
  { value: 'text', label: 'Texto', icon: '📝' },
  { value: 'image', label: 'Imagen', icon: '🖼️' },
  { value: 'config', label: 'Configuración', icon: '⚙️' },
  { value: 'json', label: 'JSON', icon: '📄' }
]

const CONTENT_CATEGORIES = [
  { value: 'app', label: 'Aplicación', color: 'bg-blue-100 text-blue-800' },
  { value: 'legal', label: 'Legal', color: 'bg-purple-100 text-purple-800' },
  { value: 'marketing', label: 'Marketing', color: 'bg-green-100 text-green-800' },
  { value: 'help', label: 'Ayuda', color: 'bg-orange-100 text-orange-800' }
]

const PREDEFINED_CONTENT = {
  app: [
    { key: 'app_welcome_message', label: 'Mensaje de Bienvenida', type: 'text' },
    { key: 'app_description', label: 'Descripción de la App', type: 'text' },
    { key: 'app_tagline', label: 'Eslogan', type: 'text' },
    { key: 'contact_email', label: 'Email de Contacto', type: 'text' },
    { key: 'contact_phone', label: 'Teléfono de Contacto', type: 'text' },
    { key: 'platform_commission', label: 'Comisión de Plataforma', type: 'config' },
    { key: 'app_logo', label: 'Logo de la App', type: 'image' },
    { key: 'hero_image', label: 'Imagen Hero', type: 'image' }
  ],
  legal: [
    { key: 'terms_of_service', label: 'Términos de Servicio', type: 'text' },
    { key: 'privacy_policy', label: 'Política de Privacidad', type: 'text' },
    { key: 'cookie_policy', label: 'Política de Cookies', type: 'text' },
    { key: 'refund_policy', label: 'Política de Reembolsos', type: 'text' }
  ],
  marketing: [
    { key: 'home_hero_title', label: 'Título Hero Homepage', type: 'text' },
    { key: 'home_hero_subtitle', label: 'Subtítulo Hero Homepage', type: 'text' },
    { key: 'features_section_title', label: 'Título Sección Features', type: 'text' },
    { key: 'testimonials_section_title', label: 'Título Testimonios', type: 'text' },
    { key: 'cta_button_text', label: 'Texto Botón CTA', type: 'text' },
    { key: 'download_app_text', label: 'Texto Descargar App', type: 'text' }
  ],
  help: [
    { key: 'faq_title', label: 'Título FAQ', type: 'text' },
    { key: 'support_message', label: 'Mensaje de Soporte', type: 'text' },
    { key: 'help_email', label: 'Email de Ayuda', type: 'text' },
    { key: 'user_guide', label: 'Guía de Usuario', type: 'text' },
    { key: 'troubleshooting', label: 'Solución de Problemas', type: 'text' }
  ]
}

export default function AdminContentPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [contentForm, setContentForm] = useState<ContentForm>({
    key: '',
    type: 'text',
    value: '',
    category: 'app'
  })
  const [contentDialogOpen, setContentDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState<ContentItem | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/content')
      if (response.ok) {
        const data = await response.json()
        setContentItems(data.content || [])
      } else {
        toast({
          title: "Error",
          description: "Error al cargar contenido",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching content:', error)
      toast({
        title: "Error",
        description: "Error al cargar contenido",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveContent = async () => {
    try {
      const url = isEditing ? `/api/admin/content/${editingItem?.id}` : '/api/admin/content'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentForm)
      })

      if (response.ok) {
        toast({
          title: isEditing ? "Contenido Actualizado" : "Contenido Creado",
          description: `El contenido ha sido ${isEditing ? 'actualizado' : 'creado'} exitosamente`
        })
        setContentDialogOpen(false)
        resetForm()
        fetchContent()
      } else {
        toast({
          title: "Error",
          description: `Error al ${isEditing ? 'actualizar' : 'crear'} contenido`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving content:', error)
      toast({
        title: "Error",
        description: `Error al ${isEditing ? 'actualizar' : 'crear'} contenido`,
        variant: "destructive"
      })
    }
  }

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este contenido?')) return

    try {
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Contenido Eliminado",
          description: "El contenido ha sido eliminado exitosamente"
        })
        fetchContent()
      } else {
        toast({
          title: "Error",
          description: "Error al eliminar contenido",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting content:', error)
      toast({
        title: "Error",
        description: "Error al eliminar contenido",
        variant: "destructive"
      })
    }
  }

  const handleQuickEdit = (item: ContentItem) => {
    setEditingItem(item)
    setContentForm({
      key: item.key,
      type: item.type,
      value: item.value,
      category: item.category
    })
    setIsEditing(true)
    setContentDialogOpen(true)
  }

  const handleCreateFromTemplate = (template: any, category: string) => {
    setContentForm({
      key: template.key,
      type: template.type as any,
      value: '',
      category: category as any
    })
    setIsEditing(false)
    setContentDialogOpen(true)
  }

  const resetForm = () => {
    setContentForm({
      key: '',
      type: 'text',
      value: '',
      category: 'app'
    })
    setEditingItem(null)
    setIsEditing(false)
  }

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.value.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter
    
    return matchesSearch && matchesCategory && matchesType
  })

  const getCategoryColor = (category: string) => {
    return CONTENT_CATEGORIES.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = (type: string) => {
    return CONTENT_TYPES.find(t => t.value === type)?.icon || '📄'
  }

  const formatValue = (value: string, type: string) => {
    if (type === 'image') {
      return value.length > 50 ? value.substring(0, 50) + '...' : value
    }
    if (type === 'json') {
      try {
        const parsed = JSON.parse(value)
        return JSON.stringify(parsed, null, 2).substring(0, 100) + '...'
      } catch {
        return value.substring(0, 100) + '...'
      }
    }
    return value.length > 100 ? value.substring(0, 100) + '...' : value
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Contenido</h1>
          <p className="text-gray-600">Administra textos, imágenes y configuraciones de la aplicación</p>
        </div>
        <Button onClick={() => { resetForm(); setContentDialogOpen(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Contenido
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {CONTENT_CATEGORIES.map(category => (
          <Card key={category.value}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{category.label}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {contentItems.filter(item => item.category === category.value).length}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${category.color}`}>
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Contenido Actual</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
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
                      placeholder="Buscar por clave o valor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todas</SelectItem>
                      {CONTENT_CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      {CONTENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content List */}
          <Card>
            <CardHeader>
              <CardTitle>Contenido ({filteredContent.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredContent.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl">{getTypeIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{item.key}</h4>
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {formatValue(item.value, item.type)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Actualizado por {item.admin?.name || 'Sistema'} el {new Date(item.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPreviewContent(item)
                          setPreviewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteContent(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="space-y-6">
            {Object.entries(PREDEFINED_CONTENT).map(([categoryKey, templates]) => (
              <Card key={categoryKey}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${getCategoryColor(categoryKey)}`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    {CONTENT_CATEGORIES.find(c => c.value === categoryKey)?.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => {
                      const existingItem = contentItems.find(item => item.key === template.key)
                      return (
                        <div key={template.key} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getTypeIcon(template.type)}</span>
                              <span className="font-medium text-sm">{template.label}</span>
                            </div>
                            {existingItem && (
                              <Badge variant="secondary" className="text-xs">
                                Existe
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-3">{template.key}</p>
                          {existingItem ? (
                            <div className="space-y-2">
                              <p className="text-xs text-gray-500 truncate">
                                {formatValue(existingItem.value, existingItem.type)}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleQuickEdit(existingItem)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => handleCreateFromTemplate(template, categoryKey)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Crear
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Content Dialog */}
      <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Contenido' : 'Crear Nuevo Contenido'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="key">Clave</Label>
                <Input
                  id="key"
                  value={contentForm.key}
                  onChange={(e) => setContentForm(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="app_welcome_message"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select value={contentForm.category} onValueChange={(value: any) => setContentForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="type">Tipo de Contenido</Label>
              <Select value={contentForm.type} onValueChange={(value: any) => setContentForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="value">Valor</Label>
              {contentForm.type === 'text' || contentForm.type === 'json' ? (
                <Textarea
                  id="value"
                  value={contentForm.value}
                  onChange={(e) => setContentForm(prev => ({ ...prev, value: e.target.value }))}
                  rows={contentForm.type === 'json' ? 8 : 4}
                  placeholder={
                    contentForm.type === 'json' 
                      ? '{"key": "value", "enabled": true}'
                      : 'Ingresa el contenido de texto aquí...'
                  }
                />
              ) : (
                <Input
                  id="value"
                  value={contentForm.value}
                  onChange={(e) => setContentForm(prev => ({ ...prev, value: e.target.value }))}
                  placeholder={
                    contentForm.type === 'image' 
                      ? 'https://lh3.googleusercontent.com/7__llX8NJkm3Bh8iR33K6oxiqvt5peMHiK3cfKThSch2VcpqGkNcZk8d-2qU_dTV38EmC7v3MEkeLpwbN9OVuRw7_Inl8E3QPThdYTcEGa1zhMV_s7QGIrssusiJnn8RLNC9GSfZz4q8p_vG30f7KlYQLgBpb_urtzpBB2GM9yScWsx4Pzym0i_Oxg'
                      : contentForm.type === 'config'
                      ? '0.20'
                      : 'Valor...'
                  }
                />
              )}
            </div>
            
            {contentForm.type === 'json' && (
              <div className="text-sm text-gray-500">
                <p>Asegúrate de que el JSON sea válido. Puedes usar herramientas online para validar el formato.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setContentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveContent}
              disabled={!contentForm.key || !contentForm.value}
            >
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vista Previa - {previewContent?.key}</DialogTitle>
          </DialogHeader>
          
          {previewContent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(previewContent.category)}>
                  {previewContent.category}
                </Badge>
                <Badge variant="outline">
                  {previewContent.type}
                </Badge>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                {previewContent.type === 'image' ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">URL de la imagen:</p>
                    <p className="text-sm break-all">{previewContent.value}</p>
                    {previewContent.value && (
                      <img 
                        src={previewContent.value} 
                        alt="Preview" 
                        className="max-w-full h-auto rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                ) : previewContent.type === 'json' ? (
                  <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(JSON.parse(previewContent.value), null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{previewContent.value}</p>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                <p>Última actualización: {new Date(previewContent.updatedAt).toLocaleString()}</p>
                <p>Actualizado por: {previewContent.admin?.name || 'Sistema'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
