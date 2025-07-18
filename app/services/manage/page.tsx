
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { BottomNavigation } from '@/components/bottom-navigation'
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
  createdAt: string
  updatedAt: string
}

export default function ManageServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services/manage')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You must be a professional to manage services.",
          variant: "destructive",
        })
        router.push('/profile')
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast({
        title: "Error",
        description: "Failed to load services.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleServiceStatus = async (serviceId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/services/manage/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        setServices(prev => prev.map(service => 
          service.id === serviceId ? { ...service, isActive } : service
        ))
        toast({
          title: "Success",
          description: `Service ${isActive ? 'activated' : 'deactivated'} successfully.`,
        })
      }
    } catch (error) {
      console.error('Error updating service:', error)
      toast({
        title: "Error",
        description: "Failed to update service status.",
        variant: "destructive",
      })
    }
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/services/manage/${serviceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setServices(prev => prev.filter(service => service.id !== serviceId))
        toast({
          title: "Success",
          description: "Service deleted successfully.",
        })
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      toast({
        title: "Error",
        description: "Failed to delete service.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-xl font-bold">Manage Services</h1>
            </div>
            <Button
              onClick={() => router.push('/services/manage/create')}
              className="bg-white text-amber-700 hover:bg-amber-50"
            >
              <Plus size={20} className="mr-2" />
              Add Service
            </Button>
          </div>
        </div>

        <div className="p-4">
          {services.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No services yet</h2>
              <p className="text-gray-500 mb-6">Create your first service to start accepting bookings.</p>
              <Button 
                onClick={() => router.push('/services/manage/create')}
                className="bg-amber-700 hover:bg-amber-800"
              >
                <Plus size={20} className="mr-2" />
                Create Service
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <Card key={service.id} className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {service.images.length > 0 && (
                        <img
                          src={service.images[0]}
                          alt={service.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800">{service.name}</h3>
                            <Badge variant="secondary" className="mt-1">
                              {SERVICE_CATEGORIES[service.category as keyof typeof SERVICE_CATEGORIES]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              {service.isActive ? (
                                <Eye className="w-4 h-4 text-green-600" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                              <Switch
                                checked={service.isActive}
                                onCheckedChange={(checked) => toggleServiceStatus(service.id, checked)}
                              />
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {service.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-semibold text-amber-700">
                              ${service.price}
                            </span>
                            <span className="text-sm text-gray-500">
                              {service.duration} min
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/services/manage/edit/${service.id}`)}
                              className="border-amber-200 text-amber-700 hover:bg-amber-50"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteService(service.id)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}
