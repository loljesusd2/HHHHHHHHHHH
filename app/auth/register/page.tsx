
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useTranslations } from '@/lib/i18n-client'
import { LanguageSelector } from '@/components/language-selector'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENT'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const t = useTranslations()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: t('errors.validationError'),
        description: t('auth.nameRequired'),
        variant: "destructive",
      })
      return false
    }

    if (!formData.email.trim()) {
      toast({
        title: t('errors.validationError'),
        description: t('auth.emailRequired'),
        variant: "destructive",
      })
      return false
    }

    if (!formData.phone.trim()) {
      toast({
        title: t('errors.validationError'),
        description: t('auth.phoneRequired'),
        variant: "destructive",
      })
      return false
    }

    if (formData.password.length < 6) {
      toast({
        title: t('errors.validationError'),
        description: t('auth.passwordMinLength'),
        variant: "destructive",
      })
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t('errors.validationError'),
        description: t('auth.passwordsNotMatch'),
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: t('auth.registerSuccess'),
          description: t('auth.loginSuccess'),
        })
        router.push('/auth/login')
      } else {
        toast({
          title: t('auth.registerFailed'),
          description: data.error || t('errors.somethingWentWrong'),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t('errors.somethingWentWrong'),
        description: t('errors.tryAgain'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="beauty-gradient w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">BG</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t('auth.register')}</h1>
          <p className="text-gray-600">{t('home.appName')}</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-center text-xl">{t('auth.register')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('auth.name')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder={t('auth.name')}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('auth.email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="email"
                    placeholder={t('auth.email')}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('auth.phone')}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="tel"
                    placeholder={t('auth.phone')}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('auth.role')}</label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('auth.role')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">{t('auth.client')}</SelectItem>
                    <SelectItem value="PROFESSIONAL">{t('auth.professional')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('auth.password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t('auth.password')}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t('auth.confirmPassword')}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('auth.register')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link href="/auth/login" className="text-amber-700 hover:text-amber-800 font-medium">
                  {t('auth.signInHere')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
