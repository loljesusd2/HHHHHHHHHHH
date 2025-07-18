
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'
import { EnhancedInput } from '@/components/ui/enhanced-input'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'
import { useAnalytics } from '@/hooks/use-analytics'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { ErrorState, LoadingState } from '@/components/ui/loading-states'
import { useTranslations } from '@/lib/i18n-client'
import { motion } from 'framer-motion'

interface LoginFormData {
  email: string
  password: string
}

export function EnhancedLoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})
  
  const router = useRouter()
  const { toast } = useToast()
  const { trigger } = useHapticFeedback()
  const { trackUserAction, trackConversion } = useAnalytics()
  const t = useTranslations()

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
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

    setIsLoading(true)
    trackUserAction('login_attempt', 'auth')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        trigger('success')
        trackConversion('login_success')
        
        toast({
          title: t('auth.welcomeBack'),
          description: t('auth.loginSuccess'),
        })
        
        router.push('/')
        router.refresh()
      } else {
        trigger('error')
        trackUserAction('login_failed', 'auth', data.error)
        
        toast({
          title: t('auth.loginFailed'),
          description: data.error || t('auth.invalidCredentials'),
          variant: "destructive",
        })
      }
    } catch (error) {
      trigger('error')
      trackUserAction('login_error', 'auth', 'network_error')
      
      toast({
        title: t('errors.somethingWentWrong'),
        description: t('errors.tryAgain'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Keyboard navigation
  useKeyboardNavigation({
    onEnter: () => {
      if (!isLoading) {
        handleSubmit(new Event('submit') as any)
      }
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-center text-xl">{t('auth.login')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <EnhancedInput
              label={t('auth.email')}
              type="email"
              inputMode="email"
              enterKeyHint="next"
              placeholder={t('auth.email')}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              leftIcon={<Mail size={18} />}
              hapticFeedback
              required
            />

            <EnhancedInput
              label={t('auth.password')}
              type="password"
              enterKeyHint="done"
              placeholder={t('auth.password')}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
              leftIcon={<Lock size={18} />}
              showPasswordToggle
              hapticFeedback
              required
            />

            <EnhancedButton
              type="submit"
              variant="gradient"
              className="w-full"
              loading={isLoading}
              loadingText={t('common.loading')}
              hapticFeedback
              hapticPattern="medium"
              leftIcon={!isLoading ? <LogIn size={18} /> : undefined}
            >
              {t('auth.login')}
            </EnhancedButton>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Client:</strong> client@demo.com / password123</p>
              <p><strong>Professional:</strong> pro@demo.com / password123</p>
              <p><strong>Admin:</strong> admin@demo.com / password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
