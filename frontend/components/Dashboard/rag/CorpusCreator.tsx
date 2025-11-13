'use client'

import { useState } from 'react'
import { X, Database, Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { CorpusCreatorProps, CreateCorpusRequest } from '@/types/rag'
import { createCorpus } from '@/lib/rag-api'

interface FormData {
  display_name: string
  description: string
  embedding_model: string
}

interface FormErrors {
  display_name?: string
  description?: string
  embedding_model?: string
}

export default function CorpusCreator({ 
  isOpen, 
  onClose, 
  chatbotId, 
  onCorpusCreated 
}: CorpusCreatorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    display_name: '',
    description: '',
    embedding_model: 'textembedding-gecko@003'
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate display name
    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Corpus name is required'
    } else if (formData.display_name.length > 100) {
      newErrors.display_name = 'Corpus name must be 100 characters or less'
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.display_name)) {
      newErrors.display_name = 'Only letters, numbers, spaces, hyphens and underscores are allowed'
    }

    // Validate description
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less'
    }

    // Validate embedding model
    if (!formData.embedding_model) {
      newErrors.embedding_model = 'Embedding model is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsCreating(true)

      const corpusData: CreateCorpusRequest = {
        display_name: formData.display_name.trim(),
        description: formData.description.trim() || undefined,
        embedding_model: formData.embedding_model,
        chatbot_id: chatbotId,
      }

      const newCorpus = await createCorpus(corpusData)

      console.log('Success: Corpus created successfully:', newCorpus.display_name)

      onCorpusCreated(newCorpus)
      handleClose()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create corpus'
      
      console.error('Error creating corpus:', errorMessage)
      console.error('Corpus creation error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setFormData({
        display_name: '',
        description: '',
        embedding_model: 'textembedding-gecko@003'
      })
      setErrors({})
      onClose()
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Create Corpus
          </DialogTitle>
          <DialogDescription>
            Create a new document corpus for your chatbot. This will store and organize your RAG documents.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Corpus Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name">Corpus Name *</Label>
            <Input
              id="display_name"
              placeholder="e.g., Product Documentation, FAQ Database"
              value={formData.display_name}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              disabled={isCreating}
              className={errors.display_name ? 'border-red-500' : ''}
            />
            {errors.display_name && (
              <p className="text-sm text-red-600">{errors.display_name}</p>
            )}
            <p className="text-xs text-gray-500">
              A descriptive name for your document corpus
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what types of documents this corpus contains..."
              className={`resize-none ${errors.description ? 'border-red-500' : ''}`}
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isCreating}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              Optional description to help identify this corpus
            </p>
          </div>

          {/* Embedding Model */}
          <div className="space-y-2">
            <Label htmlFor="embedding_model">Embedding Model *</Label>
            <Select 
              value={formData.embedding_model} 
              onValueChange={(value) => handleInputChange('embedding_model', value)}
              disabled={isCreating}
            >
              <SelectTrigger className={errors.embedding_model ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select an embedding model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="textembedding-gecko@003">
                  <div>
                    <div className="font-medium">Text Embedding Gecko 003</div>
                    <div className="text-xs text-gray-500">Recommended for general use</div>
                  </div>
                </SelectItem>
                <SelectItem value="textembedding-gecko@001">
                  <div>
                    <div className="font-medium">Text Embedding Gecko 001</div>
                    <div className="text-xs text-gray-500">Legacy model</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.embedding_model && (
              <p className="text-sm text-red-600">{errors.embedding_model}</p>
            )}
            <p className="text-xs text-gray-500">
              Choose the embedding model for vector similarity search
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="w-full sm:w-auto"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Create Corpus
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}