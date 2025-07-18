
'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface ImageUploadProps {
  value?: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  maxSizeMB?: number
  className?: string
  placeholder?: string
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  maxSizeMB = 5,
  className = '',
  placeholder = 'Subir imágenes'
}: ImageUploadProps) {
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
    const files = Array.from(event.target.files || [])
    
    if (files.length === 0) return
    
    // Verificar límite de imágenes
    if (value.length + files.length > maxImages) {
      toast({
        title: "Demasiadas imágenes",
        description: `Máximo ${maxImages} imágenes permitidas`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const newImages: string[] = []

      for (const file of files) {
        // Verificar tipo de archivo
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Tipo de archivo inválido",
            description: `${file.name} no es una imagen válida`,
            variant: "destructive",
          })
          continue
        }

        // Verificar tamaño
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast({
            title: "Archivo muy grande",
            description: `${file.name} supera el límite de ${maxSizeMB}MB`,
            variant: "destructive",
          })
          continue
        }

        try {
          const base64 = await convertToBase64(file)
          newImages.push(base64)
        } catch (error) {
          console.error('Error converting file to base64:', error)
          toast({
            title: "Error al procesar imagen",
            description: `No se pudo procesar ${file.name}`,
            variant: "destructive",
          })
        }
      }

      if (newImages.length > 0) {
        onChange([...value, ...newImages])
        toast({
          title: "Imágenes subidas",
          description: `${newImages.length} imagen(es) agregada(s)`,
        })
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      toast({
        title: "Error",
        description: "Error al subir las imágenes",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset input
      event.target.value = ''
    }
  }, [value, onChange, maxImages, maxSizeMB, toast])

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    
    // Simular el evento de input file
    const mockEvent = {
      target: { files }
    } as any
    
    handleFileSelect(mockEvent)
  }, [handleFileSelect])

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <label className="block p-6 text-center cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading || value.length >= maxImages}
          />
          
          <div className="space-y-2">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600">Subiendo imágenes...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{placeholder}</p>
                  <p>Arrastra y suelta aquí o haz clic para seleccionar</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo {maxImages} imágenes, {maxSizeMB}MB cada una
                  </p>
                </div>
              </>
            )}
          </div>
        </label>
      </Card>

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {value.map((image, index) => (
            <div key={index} className="relative group">
              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={image}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Si la imagen no carga, mostrar un placeholder
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbjwvdGV4dD48L3N2Zz4='
                    }}
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X size={12} />
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500">
        {value.length} de {maxImages} imágenes subidas
      </div>
    </div>
  )
}
