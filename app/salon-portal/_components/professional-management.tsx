
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  DollarSign, 
  Calendar,
  Settings,
  UserCheck,
  UserX
} from 'lucide-react'
import { SalonProfessional, SALON_ROLES } from '@/lib/types'

export function ProfessionalManagement() {
  const [professionals, setProfessionals] = useState<SalonProfessional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchProfessionals()
  }, [])

  const fetchProfessionals = async () => {
    try {
      const response = await fetch('/api/salon-portal/professionals')
      if (response.ok) {
        const data = await response.json()
        setProfessionals(data)
      }
    } catch (error) {
      console.error('Error fetching professionals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (professionalId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/salon-portal/professionals/${professionalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        setProfessionals(professionals.map(p => 
          p.id === professionalId ? { ...p, isActive } : p
        ))
      }
    } catch (error) {
      console.error('Error updating professional status:', error)
    }
  }

  const handleCommissionChange = async (professionalId: string, commissionRate: number) => {
    try {
      const response = await fetch(`/api/salon-portal/professionals/${professionalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commissionRate }),
      })

      if (response.ok) {
        setProfessionals(professionals.map(p => 
          p.id === professionalId ? { ...p, commissionRate } : p
        ))
      }
    } catch (error) {
      console.error('Error updating commission rate:', error)
    }
  }

  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = professional.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.professional?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || professional.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && professional.isActive) ||
                         (statusFilter === 'inactive' && !professional.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading professionals...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Professional Management</span>
          </CardTitle>
          <CardDescription>
            Manage salon professionals, roles, and commission rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search professionals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(SALON_ROLES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Professionals List */}
          <div className="space-y-4">
            {filteredProfessionals.map((professional) => (
              <div key={professional.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={professional.user?.avatar} />
                      <AvatarFallback>
                        {professional.user?.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{professional.user?.name}</h3>
                      <p className="text-sm text-gray-600">{professional.professional?.businessName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={professional.isActive ? "default" : "secondary"}>
                          {professional.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {SALON_ROLES[professional.role as keyof typeof SALON_ROLES]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{(professional.commissionRate * 100).toFixed(0)}%</p>
                      <p className="text-xs text-gray-600">Commission</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={professional.isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleStatusChange(professional.id, !professional.isActive)}
                      >
                        {professional.isActive ? (
                          <>
                            <UserX className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProfessionals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No professionals found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
