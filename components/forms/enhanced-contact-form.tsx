
'use client'

import { useState } from 'react'
import { Send, User, Mail, Phone, MessageSquare } from 'lucide-react'
import { EnhancedInput } from '@/components/ui/enhanced-input'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'
import { useAnalytics } from '@/hooks/use-analytics'
import { SuccessState, ErrorState } from '@/components/ui/loading-states'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export function EnhancedContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<ContactFormData>>({})
  
  const { trigger } = useHapticFeedback()
  const { trackUserAction, trackConversion } = useAnalytics()

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      trigger('error')
      return
    }

    setIsSubmitting(true)
    trackUserAction('contact_form_submit', 'engagement')

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
        trigger('success')
        trackConversion('contact_form_success')
        
        setIsSubmitted(true)
        toast.success(result.message || 'Message sent successfully!')
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        trigger('error')
        trackUserAction('contact_form_error', 'engagement', result.error)
        toast.error(result.error || 'Failed to send message')
      }
    } catch (error) {
      trigger('error')
      trackUserAction('contact_form_error', 'engagement', 'network_error')
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white shadow-sm border-0 rounded-xl">
          <CardContent className="p-8">
            <SuccessState
              title="Message Sent!"
              message="Thank you for contacting us. We'll get back to you within 24 hours."
              onContinue={() => setIsSubmitted(false)}
            />
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white shadow-sm border-0 rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-3">
            <Send size={24} className="text-amber-600" />
            Send us a Message
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EnhancedInput
                label="Name"
                type="text"
                inputMode="text"
                enterKeyHint="next"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                leftIcon={<User size={18} />}
                hapticFeedback
                required
              />
              
              <EnhancedInput
                label="Email"
                type="email"
                inputMode="email"
                enterKeyHint="next"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                leftIcon={<Mail size={18} />}
                hapticFeedback
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EnhancedInput
                label="Phone (Optional)"
                type="tel"
                inputMode="tel"
                enterKeyHint="next"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={errors.phone}
                leftIcon={<Phone size={18} />}
                hapticFeedback
              />
              
              <EnhancedInput
                label="Subject"
                type="text"
                inputMode="text"
                enterKeyHint="next"
                placeholder="How can we help?"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                error={errors.subject}
                leftIcon={<MessageSquare size={18} />}
                hapticFeedback
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Message *
              </label>
              <div className="relative">
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  className="resize-none"
                  required
                />
              </div>
              {errors.message && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.message}
                </p>
              )}
            </div>

            <EnhancedButton
              type="submit"
              loading={isSubmitting}
              loadingText="Sending..."
              className="w-full bg-amber-600 hover:bg-amber-700 h-12 text-base font-medium"
              hapticFeedback
              hapticPattern="medium"
              leftIcon={!isSubmitting ? <Send size={18} /> : undefined}
            >
              Send Message
            </EnhancedButton>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
