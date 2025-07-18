
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Link,
  Activity,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react'
import { SalonWebhook, WEBHOOK_EVENTS } from '@/lib/types'

export function WebhookManager() {
  const [webhooks, setWebhooks] = useState<SalonWebhook[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [] as string[],
    description: '',
    isActive: true
  })

  useEffect(() => {
    fetchWebhooks()
  }, [])

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/salon-portal/webhooks')
      if (response.ok) {
        const data = await response.json()
        setWebhooks(data)
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWebhook = async () => {
    try {
      const response = await fetch('/api/salon-portal/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWebhook),
      })

      if (response.ok) {
        const webhook = await response.json()
        setWebhooks([...webhooks, webhook])
        setNewWebhook({
          url: '',
          events: [],
          description: '',
          isActive: true
        })
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Error creating webhook:', error)
    }
  }

  const handleToggleWebhook = async (webhookId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/salon-portal/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        setWebhooks(webhooks.map(w => 
          w.id === webhookId ? { ...w, isActive } : w
        ))
      }
    } catch (error) {
      console.error('Error toggling webhook:', error)
    }
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/salon-portal/webhooks/${webhookId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWebhooks(webhooks.filter(w => w.id !== webhookId))
      }
    } catch (error) {
      console.error('Error deleting webhook:', error)
    }
  }

  const handleTestWebhook = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/salon-portal/webhooks/${webhookId}/test`, {
        method: 'POST',
      })

      if (response.ok) {
        // Show success message
        console.log('Webhook test successful')
      }
    } catch (error) {
      console.error('Error testing webhook:', error)
    }
  }

  const handleEventToggle = (event: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }))
  }

  if (loading) {
    return <div>Loading webhooks...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="webhooks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link className="h-5 w-5" />
                  <span>Webhook Management</span>
                </div>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Webhook
                </Button>
              </CardTitle>
              <CardDescription>
                Configure webhooks to sync with external systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCreating && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Create New Webhook</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <Input
                        id="webhook-url"
                        placeholder="https://your-system.com/webhook"
                        value={newWebhook.url}
                        onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="webhook-description">Description</Label>
                      <Textarea
                        id="webhook-description"
                        placeholder="Describe what this webhook is for"
                        value={newWebhook.description}
                        onChange={(e) => setNewWebhook({ ...newWebhook, description: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium">Events to Subscribe</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {Object.entries(WEBHOOK_EVENTS).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={key}
                              checked={newWebhook.events.includes(key)}
                              onCheckedChange={() => handleEventToggle(key)}
                            />
                            <label htmlFor={key} className="text-sm">
                              {value}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="webhook-active"
                        checked={newWebhook.isActive}
                        onCheckedChange={(checked) => setNewWebhook({ ...newWebhook, isActive: checked })}
                      />
                      <Label htmlFor="webhook-active">Active</Label>
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleCreateWebhook}>
                        Create Webhook
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreating(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{webhook.url}</h3>
                        <Badge variant={webhook.isActive ? "default" : "secondary"}>
                          {webhook.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {webhook.failureCount > 0 && (
                          <Badge variant="destructive">
                            {webhook.failureCount} failures
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{webhook.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {webhook.events.length} events subscribed
                        </span>
                        {webhook.lastTriggered && (
                          <span className="text-xs text-gray-500">
                            Last triggered: {new Date(webhook.lastTriggered).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestWebhook(webhook.id)}
                      >
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleWebhook(webhook.id, !webhook.isActive)}
                      >
                        {webhook.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {webhooks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No webhooks configured yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Integrations</CardTitle>
                <CardDescription>
                  Connect with popular salon management systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Vagaro", description: "Complete salon management solution", status: "Available" },
                    { name: "Booker", description: "Appointment scheduling platform", status: "Available" },
                    { name: "Square", description: "POS and payment processing", status: "Available" },
                    { name: "Mindbody", description: "Wellness business management", status: "Coming Soon" }
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{integration.name}</h4>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </div>
                      <Badge variant={integration.status === "Available" ? "default" : "secondary"}>
                        {integration.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  Resources for developers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    API Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Copy className="h-4 w-4 mr-2" />
                    Sample Code
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    API Keys
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Webhook Testing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Activity Logs</span>
              </CardTitle>
              <CardDescription>
                Monitor webhook deliveries and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { event: "booking.created", url: "https://example.com/webhook", status: "success", timestamp: new Date() },
                  { event: "payment.completed", url: "https://example.com/webhook", status: "failed", timestamp: new Date() },
                  { event: "booking.cancelled", url: "https://example.com/webhook", status: "success", timestamp: new Date() }
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {log.status === "success" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{log.event}</p>
                        <p className="text-sm text-gray-600">{log.url}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={log.status === "success" ? "default" : "destructive"}>
                        {log.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {log.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
