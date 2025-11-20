"use client"

import { Upload, X } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value?: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  className?: string
  maxImages?: number
}

export function ImageUpload({ value = [], onChange, disabled, className, maxImages }: ImageUploadProps) {
  const handleUpload = () => {
    // Verifica o limite de imagens se especificado
    if (maxImages && value.length >= maxImages) {
      return
    }

    // Placeholder para upload de imagem
    // Integrar com Cloudinary ou outro serviço
    const newImage = `https://via.placeholder.com/300x200?text=Image+${value.length + 1}`
    onChange([...value, newImage])
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative group">
            <img
              src={url}
              alt={`Upload ${index + 1}`}
              className="h-32 w-32 rounded-md object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition"
              onClick={() => handleRemove(index)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleUpload}
        disabled={disabled || (maxImages ? value.length >= maxImages : false)}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload Image
        {maxImages && ` (${value.length}/${maxImages})`}
      </Button>
    </div>
  )
}
