
'use client'

import { useEffect, useState } from 'react'
import { 
  BookOpen, Plus, Edit, Trash2, Eye, Users, 
  DollarSign, Star, Play, FileText, Upload,
  MoreHorizontal, Calendar, Award, TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: string
  price: number
  originalPrice?: number
  duration: number
  thumbnailUrl: string
  previewVideoUrl?: string
  syllabus: string
  tags: string[]
  badges: string[]
  requirements: string[]
  skillsYouWillLearn: string[]
  totalStudents: number
  averageRating: number
  totalReviews: number
  totalRevenue: number
  isActive: boolean
  isFeatured: boolean
  allowReviews: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
  instructor?: {
    name: string
    email: string
    instructorProfile?: {
      bio: string
      specializations: string[]
      averageRating: number
    }
  }
  _count?: {
    modules: number
    enrollments: number
    reviews: number
  }
}

interface AcademyStats {
  totalCourses: number
  totalStudents: number
  totalRevenue: number
  averageRating: number
  coursesCompleted: number
  certificationsEarned: number
  activeSubscriptions: number
  monthlyStats: Array<{
    month: string
    students: number
    revenue: number
    courses: number
  }>
}

interface CourseForm {
  title: string
  description: string
  category: string
  level: string
  price: number
  originalPrice?: number
  duration: number
  thumbnailUrl: string
  previewVideoUrl?: string
  syllabus: string
  tags: string[]
  badges: string[]
  requirements: string[]
  skillsYouWillLearn: string[]
  isActive: boolean
  isFeatured: boolean
  allowReviews: boolean
}

const COURSE_CATEGORIES = [
  'HAIR_STYLING',
  'MAKEUP',
  'NAILS',
  'BUSINESS_SKILLS',
  'SKINCARE',
  'EYEBROWS',
  'ADVANCED_TECHNIQUES'
]

const COURSE_LEVELS = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
  'MASTERCLASS'
]

const COURSE_BADGES = [
  'BESTSELLER',
  'NEW',
  'PREMIUM',
  'TRENDING',
  'FEATURED',
  'LIMITED'
]

export default function AdminAcademyPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<AcademyStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [courseDialogOpen, setCourseDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [courseForm, setCourseForm] = useState<CourseForm>({
    title: '',
    description: '',
    category: '',
    level: '',
    price: 0,
    duration: 0,
    thumbnailUrl: '',
    syllabus: '',
    tags: [],
    badges: [],
    requirements: [],
    skillsYouWillLearn: [],
    isActive: true,
    isFeatured: false,
    allowReviews: true
  })
  const [newTag, setNewTag] = useState('')
  const [newRequirement, setNewRequirement] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
    fetchStats()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/academy/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      } else {
        toast({
          title: "Error",
          description: "Error al cargar cursos",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast({
        title: "Error",
        description: "Error al cargar cursos",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/academy/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleCreateCourse = async () => {
    try {
      const response = await fetch('/api/admin/academy/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      })

      if (response.ok) {
        toast({
          title: "Curso Creado",
          description: "El curso ha sido creado exitosamente"
        })
        setCourseDialogOpen(false)
        resetForm()
        fetchCourses()
        fetchStats()
      } else {
        toast({
          title: "Error",
          description: "Error al crear curso",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating course:', error)
      toast({
        title: "Error",
        description: "Error al crear curso",
        variant: "destructive"
      })
    }
  }

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return

    try {
      const response = await fetch(`/api/admin/academy/courses/${selectedCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      })

      if (response.ok) {
        toast({
          title: "Curso Actualizado",
          description: "El curso ha sido actualizado exitosamente"
        })
        setCourseDialogOpen(false)
        resetForm()
        fetchCourses()
        fetchStats()
      } else {
        toast({
          title: "Error",
          description: "Error al actualizar curso",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating course:', error)
      toast({
        title: "Error",
        description: "Error al actualizar curso",
        variant: "destructive"
      })
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este curso?')) return

    try {
      const response = await fetch(`/api/admin/academy/courses/${courseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Curso Eliminado",
          description: "El curso ha sido eliminado exitosamente"
        })
        fetchCourses()
        fetchStats()
      } else {
        toast({
          title: "Error",
          description: "Error al eliminar curso",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      toast({
        title: "Error",
        description: "Error al eliminar curso",
        variant: "destructive"
      })
    }
  }

  const handleToggleFeatured = async (courseId: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/admin/academy/courses/${courseId}/featured`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured })
      })

      if (response.ok) {
        toast({
          title: featured ? "Curso Destacado" : "Curso No Destacado",
          description: `El curso ha sido ${featured ? 'destacado' : 'removido de destacados'} exitosamente`
        })
        fetchCourses()
      } else {
        toast({
          title: "Error",
          description: "Error al actualizar estado del curso",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error toggling featured:', error)
      toast({
        title: "Error",
        description: "Error al actualizar estado del curso",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setCourseForm({
      title: '',
      description: '',
      category: '',
      level: '',
      price: 0,
      duration: 0,
      thumbnailUrl: '',
      syllabus: '',
      tags: [],
      badges: [],
      requirements: [],
      skillsYouWillLearn: [],
      isActive: true,
      isFeatured: false,
      allowReviews: true
    })
    setSelectedCourse(null)
    setIsEditing(false)
  }

  const openCreateDialog = () => {
    resetForm()
    setCourseDialogOpen(true)
  }

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course)
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price,
      originalPrice: course.originalPrice,
      duration: course.duration,
      thumbnailUrl: course.thumbnailUrl,
      previewVideoUrl: course.previewVideoUrl,
      syllabus: course.syllabus,
      tags: course.tags,
      badges: course.badges,
      requirements: course.requirements,
      skillsYouWillLearn: course.skillsYouWillLearn,
      isActive: course.isActive,
      isFeatured: course.isFeatured,
      allowReviews: course.allowReviews
    })
    setIsEditing(true)
    setCourseDialogOpen(true)
  }

  const addTag = () => {
    if (newTag.trim() && !courseForm.tags.includes(newTag.trim())) {
      setCourseForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setCourseForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addRequirement = () => {
    if (newRequirement.trim() && !courseForm.requirements.includes(newRequirement.trim())) {
      setCourseForm(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }))
      setNewRequirement('')
    }
  }

  const removeRequirement = (reqToRemove: string) => {
    setCourseForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== reqToRemove)
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !courseForm.skillsYouWillLearn.includes(newSkill.trim())) {
      setCourseForm(prev => ({
        ...prev,
        skillsYouWillLearn: [...prev.skillsYouWillLearn, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setCourseForm(prev => ({
      ...prev,
      skillsYouWillLearn: prev.skillsYouWillLearn.filter(skill => skill !== skillToRemove)
    }))
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'HAIR_STYLING': 'bg-purple-100 text-purple-800',
      'MAKEUP': 'bg-pink-100 text-pink-800',
      'NAILS': 'bg-blue-100 text-blue-800',
      'BUSINESS_SKILLS': 'bg-green-100 text-green-800',
      'SKINCARE': 'bg-yellow-100 text-yellow-800',
      'EYEBROWS': 'bg-indigo-100 text-indigo-800',
      'ADVANCED_TECHNIQUES': 'bg-red-100 text-red-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getLevelColor = (level: string) => {
    const colors = {
      'BEGINNER': 'bg-green-100 text-green-800',
      'INTERMEDIATE': 'bg-blue-100 text-blue-800',
      'ADVANCED': 'bg-orange-100 text-orange-800',
      'EXPERT': 'bg-red-100 text-red-800',
      'MASTERCLASS': 'bg-purple-100 text-purple-800'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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
          <h1 className="text-2xl font-bold text-gray-900">Academy - Gestión de Cursos</h1>
          <p className="text-gray-600">Administra todos los cursos de la Beauty Academy</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Curso
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cursos</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalCourses}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-purple-600">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                  <p className="text-2xl font-bold text-yellow-600">⭐ {stats.averageRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                {course.isFeatured && (
                  <Badge className="bg-yellow-500 text-white">
                    Destacado
                  </Badge>
                )}
                {!course.isActive && (
                  <Badge variant="secondary">
                    Inactivo
                  </Badge>
                )}
              </div>
              <div className="absolute top-2 left-2 flex gap-1">
                {course.badges.map((badge, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(course)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleFeatured(course.id, !course.isFeatured)}>
                      <Star className="mr-2 h-4 w-4" />
                      {course.isFeatured ? 'Quitar destacado' : 'Destacar'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2 mb-3">
                <Badge className={getCategoryColor(course.category)}>
                  {course.category.replace('_', ' ')}
                </Badge>
                <Badge className={getLevelColor(course.level)}>
                  {course.level}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Precio</span>
                  <div className="flex items-center gap-2">
                    {course.originalPrice && course.originalPrice > course.price && (
                      <span className="text-sm text-gray-400 line-through">
                        ${course.originalPrice}
                      </span>
                    )}
                    <span className="font-bold text-green-600">${course.price}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estudiantes</span>
                  <span className="font-semibold">{course.totalStudents}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rating</span>
                  <span className="font-semibold">⭐ {course.averageRating.toFixed(1)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duración</span>
                  <span className="font-semibold">{course.duration} min</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ingresos</span>
                  <span className="font-semibold text-green-600">${course.totalRevenue.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <Users className="w-4 h-4 mr-1" />
                  Estudiantes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Course Dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Curso' : 'Crear Nuevo Curso'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="pricing">Precios</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título del Curso</Label>
                  <Input
                    id="title"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duración (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={courseForm.category} onValueChange={(value) => setCourseForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSE_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="level">Nivel</Label>
                  <Select value={courseForm.level} onValueChange={(value) => setCourseForm(prev => ({ ...prev, level: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSE_LEVELS.map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="thumbnailUrl">URL de Miniatura</Label>
                  <Input
                    id="thumbnailUrl"
                    value={courseForm.thumbnailUrl}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="previewVideoUrl">URL de Video Preview</Label>
                  <Input
                    id="previewVideoUrl"
                    value={courseForm.previewVideoUrl || ''}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, previewVideoUrl: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <div>
                <Label htmlFor="syllabus">Syllabus del Curso</Label>
                <Textarea
                  id="syllabus"
                  value={courseForm.syllabus}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, syllabus: e.target.value }))}
                  rows={4}
                />
              </div>
              
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Agregar tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {courseForm.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Requisitos</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Agregar requisito"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  />
                  <Button type="button" onClick={addRequirement}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {courseForm.requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{req}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeRequirement(req)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Habilidades que Aprenderás</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Agregar habilidad"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button type="button" onClick={addSkill}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {courseForm.skillsYouWillLearn.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{skill}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeSkill(skill)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Precio Original (opcional)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={courseForm.originalPrice || ''}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
              </div>
              
              <div>
                <Label>Badges</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {COURSE_BADGES.map(badge => (
                    <label key={badge} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={courseForm.badges.includes(badge)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCourseForm(prev => ({ ...prev, badges: [...prev.badges, badge] }))
                          } else {
                            setCourseForm(prev => ({ ...prev, badges: prev.badges.filter(b => b !== badge) }))
                          }
                        }}
                      />
                      <span className="text-sm">{badge}</span>
                    </label>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Curso Activo</Label>
                    <p className="text-sm text-gray-600">El curso está disponible para estudiantes</p>
                  </div>
                  <Switch
                    checked={courseForm.isActive}
                    onCheckedChange={(checked) => setCourseForm(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Curso Destacado</Label>
                    <p className="text-sm text-gray-600">El curso aparece en la sección destacada</p>
                  </div>
                  <Switch
                    checked={courseForm.isFeatured}
                    onCheckedChange={(checked) => setCourseForm(prev => ({ ...prev, isFeatured: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Permitir Reviews</Label>
                    <p className="text-sm text-gray-600">Los estudiantes pueden dejar reviews</p>
                  </div>
                  <Switch
                    checked={courseForm.allowReviews}
                    onCheckedChange={(checked) => setCourseForm(prev => ({ ...prev, allowReviews: checked }))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={isEditing ? handleUpdateCourse : handleCreateCourse}
              disabled={!courseForm.title || !courseForm.description || !courseForm.category || !courseForm.level}
            >
              {isEditing ? 'Actualizar' : 'Crear'} Curso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
