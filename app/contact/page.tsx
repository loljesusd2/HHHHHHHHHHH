
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  HelpCircle,
  CheckCircle,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ErrorBoundary } from '@/components/error-boundary'
import { EnhancedContactForm } from '@/components/forms/enhanced-contact-form'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface ContactInfo {
  company: {
    name: string
    description: string
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    socialMedia: {
      instagram: string
      facebook: string
      twitter: string
    }
  }
  supportHours: {
    weekdays: string
    weekends: string
    holidays: string
  }
  faq: Array<{
    id: number
    question: string
    answer: string
  }>
}

interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export default function ContactPage() {
  const router = useRouter()
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('/api/contact')
      if (response.ok) {
        const data = await response.json()
        setContactInfo(data)
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        toast.error(result.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <ContactPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Contact Us</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-24">
        {/* Company Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mt-6"
        >
          <Card className="bg-white shadow-lg border-0 rounded-xl">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {contactInfo?.company.name}
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                {contactInfo?.company.description}
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Badge variant="outline" className="border-amber-200 text-amber-700 px-4 py-2">
                  <MessageCircle size={14} className="mr-2" />
                  24/7 Support
                </Badge>
                <Badge variant="outline" className="border-green-200 text-green-700 px-4 py-2">
                  <CheckCircle size={14} className="mr-2" />
                  Verified Platform
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm rounded-lg p-1">
              <TabsTrigger value="contact" className="rounded-md">Contact</TabsTrigger>
              <TabsTrigger value="faq" className="rounded-md">FAQ</TabsTrigger>
              <TabsTrigger value="info" className="rounded-md">Info</TabsTrigger>
            </TabsList>

            {/* Contact Form Tab */}
            <TabsContent value="contact" className="space-y-6 mt-6">
              <ErrorBoundary>
                <EnhancedContactForm />
              </ErrorBoundary>

              {/* Quick Contact Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white shadow-sm border-0 rounded-xl hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Phone className="w-8 h-8 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg mb-1">Call Us</h3>
                        <p className="text-gray-600">{contactInfo?.company.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-0 rounded-xl hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Mail className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg mb-1">Email Us</h3>
                        <p className="text-gray-600">{contactInfo?.company.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-6 mt-6">
              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <HelpCircle size={24} className="text-amber-600" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <Accordion type="single" collapsible className="w-full space-y-2">
                    {contactInfo?.faq.map((item) => (
                      <AccordionItem key={item.id} value={`item-${item.id}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 pb-4">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Company Info Tab */}
            <TabsContent value="info" className="space-y-6 mt-6">
              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Address</h4>
                      <p className="text-gray-600 leading-relaxed">
                        {contactInfo?.company.address.street}<br />
                        {contactInfo?.company.address.city}, {contactInfo?.company.address.state} {contactInfo?.company.address.zipCode}<br />
                        {contactInfo?.company.address.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Phone</h4>
                      <p className="text-gray-600">{contactInfo?.company.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Email</h4>
                      <p className="text-gray-600">{contactInfo?.company.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <Clock size={24} className="text-amber-600" />
                    Support Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Weekdays:</span>
                    <span className="font-semibold text-gray-800">{contactInfo?.supportHours.weekdays}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Weekends:</span>
                    <span className="font-semibold text-gray-800">{contactInfo?.supportHours.weekends}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Holidays:</span>
                    <span className="font-semibold text-gray-800">{contactInfo?.supportHours.holidays}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Follow Us</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="flex gap-4 flex-wrap">
                    <Button variant="outline" size="default" className="flex-1 min-w-[120px]" asChild>
                      <a href={`https://instagram.com/${contactInfo?.company.socialMedia.instagram?.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <Instagram size={18} className="mr-2" />
                        Instagram
                      </a>
                    </Button>
                    <Button variant="outline" size="default" className="flex-1 min-w-[120px]" asChild>
                      <a href={`https://facebook.com/${contactInfo?.company.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer">
                        <Facebook size={18} className="mr-2" />
                        Facebook
                      </a>
                    </Button>
                    <Button variant="outline" size="default" className="flex-1 min-w-[120px]" asChild>
                      <a href={`https://twitter.com/${contactInfo?.company.socialMedia.twitter?.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <Twitter size={18} className="mr-2" />
                        Twitter
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

function ContactPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-20 bg-white/20" />
            <Skeleton className="h-6 w-24 bg-white/20" />
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="-mt-6">
          <Card className="bg-white shadow-lg border-0 rounded-xl">
            <CardContent className="p-8 text-center space-y-4">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
              <div className="flex justify-center gap-4">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 space-y-6">
          <Skeleton className="h-12 w-full" />
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardContent className="p-8 space-y-6">
              <Skeleton className="h-6 w-40" />
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
              <Skeleton className="h-32" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
