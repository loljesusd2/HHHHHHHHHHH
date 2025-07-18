
'use client'

import { useState, useCallback } from 'react'
import { Upload, User, Camera } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface AvatarUploadProps {
  value?: string
  onChange: (avatar: string) => void
  name?: string
  maxSizeMB?: number
  className?: string
}

export function AvatarUpload({
  value,
  onChange,
  name = 'Usuario',
  maxSizeMB = 2,
  className = ''
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (!file) return

    // Verificar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de archivo inválido",
        description: "Por favor selecciona una imagen válida",
        variant: "destructive",
      })
      return
    }

    // Verificar tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: `La imagen debe ser menor a ${maxSizeMB}MB`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const base64 = await convertToBase64(file)
      onChange(base64)
      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil ha sido actualizada",
      })
    } catch (error) {
      console.error('Error converting file to base64:', error)
      toast({
        title: "Error",
        description: "Error al procesar la imagen",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset input
      event.target.value = ''
    }
  }, [onChange, maxSizeMB, toast])

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative group">
        <Avatar className="w-24 h-24">
          <AvatarImage src={value} />
          <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="text-center">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          
          <Button variant="outline" size="sm" disabled={isUploading} asChild>
            <span>
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  {value ? 'Cambiar foto' : 'Subir foto'}
                </>
              )}
            </span>
          </Button>
        </label>
        
        <p className="text-xs text-gray-500 mt-2">
          Máximo {maxSizeMB}MB, formatos: JPG, PNG, GIF
        </p>
      </div>
    </div>
  )
}
