
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AuthGuard } from '@/components/auth-guard'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { ImageUpload } from '@/components/ui/image-upload'
import { User } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export default function EditProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    businessName: '',
    bio: '',
    yearsExperience: '',
    certifications: [] as string[],
    portfolio: [] as string[]
  })
  const [newCertification, setNewCertification] = useState('')
  
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setFormData({
          name: userData.name || '',
          phone: userData.phone || '',
          avatar: userData.avatar || '',
          address: userData.clientProfile?.address || userData.professionalProfile?.address || '',
          city: userData.clientProfile?.city || userData.professionalProfile?.city || '',
          state: userData.clientProfile?.state || userData.professionalProfile?.state || '',
          zipCode: userData.clientProfile?.zipCode || userData.professionalProfile?.zipCode || '',
          businessName: userData.professionalProfile?.businessName || '',
          bio: userData.professionalProfile?.bio || '',
          yearsExperience: userData.professionalProfile?.yearsExperience?.toString() || '',
          certifications: userData.professionalProfile?.certifications || [],
          portfolio: userData.professionalProfile?.portfolio || []
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Error al cargar los datos del perfil.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }))
      setNewCertification('')
    }
  }

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }



  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null
        }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Perfil actualizado exitosamente.",
        })
        router.push('/profile')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Error al actualizar el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Perfil no encontrado</h2>
          <Button onClick={() => router.push('/auth/login')}>Iniciar Sesión</Button>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold">Editar Perfil</h1>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Profile Picture */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-800">Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <AvatarUpload
                value={formData.avatar}
                onChange={(avatar) => handleInputChange('avatar', avatar)}
                name={formData.name}
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-800">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                />
              </div>
              <div>
                <Label htmlFor="phone">Número de Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-800">Dirección</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Calle Principal 123"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Madrid"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado/Provincia</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Madrid"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="zipCode">Código Postal</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="28001"
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          {user.role === 'PROFESSIONAL' && (
            <>
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-amber-800">Información del Negocio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Nombre del Negocio</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder="Nombre de tu negocio"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Cuéntale a los clientes sobre ti y tus servicios..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsExperience">Años de Experiencia</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      value={formData.yearsExperience}
                      onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-amber-800">Certificaciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Agregar una certificación"
                      onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                    />
                    <Button onClick={addCertification} className="bg-amber-700 hover:bg-amber-800">
                      Agregar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between bg-amber-50 p-3 rounded-lg">
                        <span className="text-amber-800">{cert}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCertification(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-amber-800">Portfolio de Imágenes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    value={formData.portfolio}
                    onChange={(images) => setFormData(prev => ({ ...prev, portfolio: images }))}
                    maxImages={10}
                    placeholder="Subir imágenes del portfolio"
                  />
                </CardContent>
              </Card>
            </>
          )}

          {/* Save Button */}
          <div className="pb-6">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save size={20} />
                  Guardar Cambios
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
