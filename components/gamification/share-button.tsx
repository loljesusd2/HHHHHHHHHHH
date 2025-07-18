
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Facebook, Twitter, Instagram, MessageSquare, Linkedin, Copy, Check, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useSocialShare } from '@/hooks/use-social-share'

interface ShareButtonProps {
  type: 'booking_result' | 'timeline_photo' | 'service_promotion' | 'app_referral'
  data: any
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  children?: React.ReactNode
  compact?: boolean
}

export function ShareButton({ 
  type, 
  data, 
  variant = 'default', 
  size = 'default',
  children,
  compact = false 
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [shareData, setShareData] = useState<any>(null)
  const [shareUrls, setShareUrls] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const { generateShareContent, shareToSocial, copyToClipboard, loading } = useSocialShare()

  const handleGenerateContent = async () => {
    try {
      const result = await generateShareContent(type, {
        ...data,
        ...(customMessage && { customMessage })
      })
      setShareData(result.shareData)
      setShareUrls(result.shareUrls)
    } catch (error) {
      console.error('Error generating share content:', error)
    }
  }

  const handleShare = async (platform: string) => {
    if (!shareData) return
    
    try {
      shareToSocial(platform, shareData)
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleCopyText = async () => {
    if (!shareData) return
    
    try {
      const text = `${shareData.title}\n\n${shareData.description}\n\n${shareData.hashtags.join(' ')}`
      await copyToClipboard(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying text:', error)
    }
  }

  const socialPlatforms = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700', key: 'facebook' },
    { name: 'Twitter', icon: Twitter, color: 'bg-sky-500 hover:bg-sky-600', key: 'twitter' },
    { name: 'Instagram', icon: Instagram, color: 'bg-pink-600 hover:bg-pink-700', key: 'instagram' },
    { name: 'WhatsApp', icon: MessageSquare, color: 'bg-green-600 hover:bg-green-700', key: 'whatsapp' },
    { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700 hover:bg-blue-800', key: 'linkedin' }
  ]

  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={variant} 
            size={size}
            onClick={handleGenerateContent}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {children || 'Share'}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Beauty Experience</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {shareData && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800">{shareData.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{shareData.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {shareData.hashtags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {socialPlatforms.slice(0, 3).map((platform) => (
                    <Button
                      key={platform.key}
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(platform.key)}
                      className="flex items-center gap-2"
                    >
                      <platform.icon className="w-4 h-4" />
                      {platform.name}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyText}
                  className="w-full flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          onClick={handleGenerateContent}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          {children || 'Share Your Beauty Experience'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Your Beauty Experience</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Customize your message (optional)
            </label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add your personal touch to the message..."
              className="min-h-[80px]"
            />
          </div>

          {/* Preview */}
          {shareData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {shareData.imageUrl && (
                      <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={shareData.imageUrl}
                          alt="Share preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          <Camera className="w-3 h-3 inline mr-1" />
                          Beauty GO
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <p className="font-medium text-gray-800">{shareData.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{shareData.description}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {shareData.hashtags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Platforms */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Share on social media</h4>
                <div className="grid grid-cols-2 gap-3">
                  {socialPlatforms.map((platform) => (
                    <Button
                      key={platform.key}
                      variant="outline"
                      onClick={() => handleShare(platform.key)}
                      className={`flex items-center gap-2 hover:text-white transition-colors ${platform.color}`}
                    >
                      <platform.icon className="w-4 h-4" />
                      {platform.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Copy Options */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Or copy to share elsewhere</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCopyText}
                    className="flex items-center gap-2 flex-1"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </Button>
                  {shareUrls?.instagram && (
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://www.instagram.com/', '_blank')}
                      className="flex items-center gap-2"
                    >
                      <Instagram className="w-4 h-4" />
                      Open Instagram
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
