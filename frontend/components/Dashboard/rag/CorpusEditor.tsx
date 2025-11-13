'use client'

import { useState, useEffect } from 'react'
import { Edit3, Database, Loader2 } from 'lucide-react'

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

import { Corpus, UpdateCorpusRequest } from '@/types/rag'
import { updateCorpus } from '@/lib/rag-api'

interface FormData {
  display_name: string
  description: string
}

interface FormErrors {
  display_name?: string
  description?: string
}

interface CorpusEditorProps {
  corpus: Corpus | null
  isOpen: boolean
  onClose: () => void
  onCorpusUpdated: (corpus: Corpus) => void
}

export default function CorpusEditor({ 
  corpus, 
  isOpen, 
  onClose, 
  onCorpusUpdated 
}: CorpusEditorProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    display_name: '',
    description: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Reset form when corpus changes
  useEffect(() => {
    if (corpus) {
      setFormData({
        display_name: corpus.display_name,
        description: corpus.description || ''
      })
      setErrors({})
    }
  }, [corpus])

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!corpus || !validateForm()) return

    try {
      setIsUpdating(true)

      const updateData: UpdateCorpusRequest = {
        display_name: formData.display_name.trim(),
        description: formData.description.trim() || undefined,
      }

      const updatedCorpus = await updateCorpus(corpus.id, updateData)

      console.log('Success: Corpus updated successfully:', updatedCorpus.display_name)

      onCorpusUpdated(updatedCorpus)
      onClose()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update corpus'
      
      console.error('Error updating corpus:', errorMessage)
      console.error('Corpus update error:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClose = () => {
    if (!isUpdating) {
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

  const hasChanges = corpus && (
    formData.display_name !== corpus.display_name ||
    formData.description !== (corpus.description || '')
  )

  if (!corpus) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Edit Corpus
          </DialogTitle>
          <DialogDescription>
            Update the name and description of your corpus. Note that the embedding model cannot be changed after creation.
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
              disabled={isUpdating}
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
              disabled={isUpdating}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              Optional description to help identify this corpus
            </p>
          </div>

          {/* Read-only Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="text-sm font-medium text-gray-700">Corpus Information</div>
            <div className="space-y-1 text-xs text-gray-600">
              <div><span className="font-medium">ID:</span> {corpus.id}</div>
              <div><span className="font-medium">Documents:</span> {corpus.document_count}</div>
              <div><span className="font-medium">Embedding Model:</span> {corpus.embedding_model.split('/').pop()}</div>
              <div><span className="font-medium">Created:</span> {new Date(corpus.created_at).toLocaleString()}</div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !hasChanges}
              className="w-full sm:w-auto"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Update Corpus
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}