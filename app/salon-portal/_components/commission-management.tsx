
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DollarSign, 
  Calculator, 
  Users, 
  TrendingUp,
  Settings,
  Download,
  CreditCard,
  PieChart
} from 'lucide-react'
import { CommissionCalculation, COMMISSION_TIERS } from '@/lib/types'

export function CommissionManagement() {
  const [commissionSettings, setCommissionSettings] = useState({
    platformFeeRate: 0.12,
    salonCommissionRate: 0.23,
    professionalCommissionRate: 0.65
  })
  const [calculationAmount, setCalculationAmount] = useState(100)
  const [calculation, setCalculation] = useState<CommissionCalculation | null>(null)
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommissionData()
  }, [])

  useEffect(() => {
    calculateCommission()
  }, [calculationAmount, commissionSettings])

  const fetchCommissionData = async () => {
    try {
      const response = await fetch('/api/salon-portal/commissions')
      if (response.ok) {
        const data = await response.json()
        setCommissionSettings(data.settings)
        setPayouts(data.payouts)
      }
    } catch (error) {
      console.error('Error fetching commission data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCommission = () => {
    const platformFee = calculationAmount * commissionSettings.platformFeeRate
    const salonCommission = calculationAmount * commissionSettings.salonCommissionRate
    const professionalEarnings = calculationAmount * commissionSettings.professionalCommissionRate

    setCalculation({
      totalAmount: calculationAmount,
      platformFee,
      salonCommission,
      professionalEarnings,
      platformFeeRate: commissionSettings.platformFeeRate,
      salonCommissionRate: commissionSettings.salonCommissionRate,
      professionalCommissionRate: commissionSettings.professionalCommissionRate
    })
  }

  const handleSettingsUpdate = async () => {
    try {
      const response = await fetch('/api/salon-portal/commissions/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commissionSettings),
      })

      if (response.ok) {
        // Show success message
        console.log('Commission settings updated successfully')
      }
    } catch (error) {
      console.error('Error updating commission settings:', error)
    }
  }

  const applyCommissionTier = (tier: keyof typeof COMMISSION_TIERS) => {
    const tierSettings = COMMISSION_TIERS[tier]
    setCommissionSettings({
      platformFeeRate: tierSettings.platform,
      salonCommissionRate: tierSettings.salon,
      professionalCommissionRate: tierSettings.professional
    })
  }

  if (loading) {
    return <div>Loading commission data...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Commission Calculator</span>
                </CardTitle>
                <CardDescription>
                  Calculate commission splits for any booking amount
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Service Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={calculationAmount}
                    onChange={(e) => setCalculationAmount(Number(e.target.value))}
                    placeholder="Enter service amount"
                  />
                </div>

                {calculation && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Total Amount</span>
                      <span className="font-bold">${calculation.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Platform Fee ({(calculation.platformFeeRate * 100).toFixed(1)}%)</span>
                      <span className="font-bold text-red-600">-${calculation.platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Salon Commission ({(calculation.salonCommissionRate * 100).toFixed(1)}%)</span>
                      <span className="font-bold text-blue-600">-${calculation.salonCommission.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Professional Earnings ({(calculation.professionalCommissionRate * 100).toFixed(1)}%)</span>
                      <span className="font-bold text-green-600">${calculation.professionalEarnings.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission Breakdown</CardTitle>
                <CardDescription>Visual representation of commission splits</CardDescription>
              </CardHeader>
              <CardContent>
                {calculation && (
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                      <div 
                        className="bg-red-500 h-full"
                        style={{ width: `${calculation.platformFeeRate * 100}%` }}
                      />
                      <div 
                        className="bg-blue-500 h-full"
                        style={{ width: `${calculation.salonCommissionRate * 100}%` }}
                      />
                      <div 
                        className="bg-green-500 h-full"
                        style={{ width: `${calculation.professionalCommissionRate * 100}%` }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-sm">Platform Fee</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm">Salon Commission</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm">Professional Earnings</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Commission Settings</span>
              </CardTitle>
              <CardDescription>
                Configure commission rates for your salon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preset Tiers */}
              <div>
                <Label className="text-base font-medium">Preset Commission Tiers</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {Object.entries(COMMISSION_TIERS).map(([key, tier]) => (
                    <Card key={key} className="cursor-pointer hover:bg-gray-50" onClick={() => applyCommissionTier(key as keyof typeof COMMISSION_TIERS)}>
                      <CardContent className="p-4">
                        <h3 className="font-medium capitalize">{key.toLowerCase()}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <p>Platform: {(tier.platform * 100).toFixed(0)}%</p>
                          <p>Salon: {(tier.salon * 100).toFixed(0)}%</p>
                          <p>Professional: {(tier.professional * 100).toFixed(0)}%</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Custom Settings */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Custom Commission Rates</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="platform-rate">Platform Fee Rate (%)</Label>
                    <Input
                      id="platform-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={(commissionSettings.platformFeeRate * 100).toFixed(1)}
                      onChange={(e) => setCommissionSettings({
                        ...commissionSettings,
                        platformFeeRate: Number(e.target.value) / 100
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="salon-rate">Salon Commission Rate (%)</Label>
                    <Input
                      id="salon-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={(commissionSettings.salonCommissionRate * 100).toFixed(1)}
                      onChange={(e) => setCommissionSettings({
                        ...commissionSettings,
                        salonCommissionRate: Number(e.target.value) / 100
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="professional-rate">Professional Rate (%)</Label>
                    <Input
                      id="professional-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={(commissionSettings.professionalCommissionRate * 100).toFixed(1)}
                      onChange={(e) => setCommissionSettings({
                        ...commissionSettings,
                        professionalCommissionRate: Number(e.target.value) / 100
                      })}
                    />
                  </div>
                </div>

                <Button onClick={handleSettingsUpdate} className="w-full">
                  Update Commission Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payout Management</span>
              </CardTitle>
              <CardDescription>
                Manage professional payouts and payment schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payouts.map((payout, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{payout.professionalName}</p>
                        <p className="text-sm text-gray-600">{payout.period}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">${payout.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{payout.bookings} bookings</p>
                      </div>
                      <Badge variant={payout.status === 'paid' ? 'default' : 'secondary'}>
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Commission Reports</span>
              </CardTitle>
              <CardDescription>
                Generate and download commission reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download Monthly Report</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download Yearly Report</span>
                  </Button>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Reports include:</p>
                  <ul className="list-disc list-inside text-sm text-blue-800 mt-2">
                    <li>Commission breakdown by professional</li>
                    <li>Platform fees and salon earnings</li>
                    <li>Payout schedules and history</li>
                    <li>Tax documentation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
