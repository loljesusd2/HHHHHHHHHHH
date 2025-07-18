
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { AuthGuard } from '@/components/auth-guard'
import { useToast } from '@/hooks/use-toast'
import { SERVICE_CATEGORIES } from '@/lib/types'

interface Service {
  id: string
  name: string
  description: string
  category: string
  price: number
  duration: number
  images: string[]
  isActive: boolean
}

export default function EditServicePage({ params }: { params: { serviceId: string } }) {
  const [service, setService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    images: [] as string[],
    isActive: true
  })
  const [newImageUrl, setNewImageUrl] = useState('')
  
  const router = useRouter()
  const { toast } = useToast()
  const { serviceId } = params

  useEffect(() => {
    fetchService()
  }, [serviceId])

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}`)
      if (response.ok) {
        const serviceData = await response.json()
        setService(serviceData)
        setFormData({
          name: serviceData.name,
          description: serviceData.description,
          category: serviceData.category,
          price: serviceData.price.toString(),
          duration: serviceData.duration.toString(),
          images: serviceData.images || [],
          isActive: serviceData.isActive
        })
      } else {
        throw new Error('Service not found')
      }
    } catch (error) {
      console.error('Error fetching service:', error)
      toast({
        title: "Error",
        description: "Failed to load service data.",
        variant: "destructive",
      })
      router.push('/services/manage')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }))
      setNewImageUrl('')
    }
  }

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.category || !formData.price || !formData.duration) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/services/manage/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration)
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Service updated successfully.",
        })
        router.push('/services/manage')
      } else {
        throw new Error('Failed to update service')
      }
    } catch (error) {
      console.error('Error updating service:', error)
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
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

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Service not found</h2>
          <Button onClick={() => router.push('/services/manage')}>Back to Services</Button>
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
            <h1 className="text-xl font-bold">Edit Service</h1>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Service Status */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-800">Service Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Active Service</Label>
                  <p className="text-sm text-gray-600">
                    {formData.isActive ? 'Service is visible to clients' : 'Service is hidden from clients'}
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-800">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Classic Manicure"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your service in detail..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SERVICE_CATEGORIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="50.00"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="60"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-800">Service Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Add image URL"
                  onKeyPress={(e) => e.key === 'Enter' && addImageUrl()}
                />
                <Button onClick={addImageUrl} className="bg-amber-700 hover:bg-amber-800">
                  Add
                </Button>
              </div>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Service image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImageUrl(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white hover:bg-red-700"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="pb-6">
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save size={20} />
                  Update Service
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
