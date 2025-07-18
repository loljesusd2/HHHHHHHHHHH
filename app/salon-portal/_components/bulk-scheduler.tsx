
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Copy
} from 'lucide-react'
import { format } from 'date-fns'

export function BulkScheduler() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [scheduleTemplates, setScheduleTemplates] = useState<any[]>([])
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScheduleData()
  }, [])

  const fetchScheduleData = async () => {
    try {
      const [templatesResponse, professionalsResponse] = await Promise.all([
        fetch('/api/salon-portal/scheduling/templates'),
        fetch('/api/salon-portal/professionals')
      ])

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json()
        setScheduleTemplates(templatesData)
      }

      if (professionalsResponse.ok) {
        const professionalsData = await professionalsResponse.json()
        setProfessionals(professionalsData)
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkScheduleUpdate = async (templateId: string) => {
    try {
      const response = await fetch('/api/salon-portal/scheduling/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          professionalIds: selectedProfessionals,
          date: selectedDate,
        }),
      })

      if (response.ok) {
        // Show success message
        console.log('Schedule updated successfully')
      }
    } catch (error) {
      console.error('Error updating schedule:', error)
    }
  }

  const handleProfessionalToggle = (professionalId: string) => {
    setSelectedProfessionals(prev => 
      prev.includes(professionalId)
        ? prev.filter(id => id !== professionalId)
        : [...prev, professionalId]
    )
  }

  if (loading) {
    return <div>Loading schedule data...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="bulk-update" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bulk-update">Bulk Update</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="blackout-dates">Blackout Dates</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk-update" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Select Professionals</span>
                </CardTitle>
                <CardDescription>
                  Choose which professionals to update
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedProfessionals.length === professionals.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProfessionals(professionals.map(p => p.id))
                        } else {
                          setSelectedProfessionals([])
                        }
                      }}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium">
                      Select All ({professionals.length})
                    </label>
                  </div>
                  
                  <div className="border-t pt-2 max-h-60 overflow-y-auto">
                    {professionals.map((professional) => (
                      <div key={professional.id} className="flex items-center space-x-2 py-2">
                        <Checkbox
                          id={professional.id}
                          checked={selectedProfessionals.includes(professional.id)}
                          onCheckedChange={() => handleProfessionalToggle(professional.id)}
                        />
                        <label htmlFor={professional.id} className="text-sm flex-1">
                          {professional.user?.name}
                          <span className="text-gray-500 ml-2">
                            ({professional.professional?.businessName})
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span>Select Date Range</span>
                </CardTitle>
                <CardDescription>
                  Choose the date to apply schedule changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Apply Schedule Template</CardTitle>
              <CardDescription>
                Select a template to apply to selected professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduleTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {template.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                        <Badge variant="outline">
                          {Object.keys(template.schedule).length} days configured
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleBulkScheduleUpdate(template.id)}
                      disabled={selectedProfessionals.length === 0}
                    >
                      Apply Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Schedule Templates</span>
              </CardTitle>
              <CardDescription>
                Create and manage schedule templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Template
                </Button>

                <div className="space-y-4">
                  {scheduleTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {template.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                          <Badge variant="outline">
                            Created {format(new Date(template.createdAt), 'MMM d, yyyy')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-1" />
                          Duplicate
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blackout-dates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Blackout Dates</span>
              </CardTitle>
              <CardDescription>
                Set dates when professionals are unavailable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="blackout-name">Event Name</Label>
                    <Input id="blackout-name" placeholder="Holiday, Training, etc." />
                  </div>
                  <div>
                    <Label htmlFor="blackout-type">Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="holiday">Holiday</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="event">Special Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Start Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                </div>

                <Button className="w-full">
                  Create Blackout Period
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
