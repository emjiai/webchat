'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'

import { Corpus, UpdateCorpusRequest } from '@/types/rag'
import { updateCorpus } from '@/lib/rag-api'

const corpusEditSchema = z.object({
  display_name: z
    .string()
    .min(1, 'Corpus name is required')
    .max(100, 'Corpus name must be 100 characters or less')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Only letters, numbers, spaces, hyphens and underscores are allowed'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
})

type CorpusEditFormData = z.infer<typeof corpusEditSchema>

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
  const { toast } = useToast()

  const form = useForm<CorpusEditFormData>({
    resolver: zodResolver(corpusEditSchema),
    defaultValues: {
      display_name: '',
      description: '',
    },
  })

  // Reset form when corpus changes
  useEffect(() => {
    if (corpus) {
      form.reset({
        display_name: corpus.display_name,
        description: corpus.description || '',
      })
    }
  }, [corpus, form])

  const onSubmit = async (data: CorpusEditFormData) => {
    if (!corpus) return

    try {
      setIsUpdating(true)

      const updateData: UpdateCorpusRequest = {
        display_name: data.display_name,
        description: data.description || undefined,
      }

      const updatedCorpus = await updateCorpus(corpus.id, updateData)

      toast({
        title: 'Success',
        description: `Corpus "${updatedCorpus.display_name}" updated successfully`,
      })

      onCorpusUpdated(updatedCorpus)
      onClose()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update corpus'
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })

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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Corpus Name */}
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Corpus Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Product Documentation, FAQ Database"
                      {...field}
                      disabled={isUpdating}
                    />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for your document corpus
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what types of documents this corpus contains..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isUpdating}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description to help identify this corpus
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={isUpdating || !form.formState.isDirty}
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
        </Form>
      </DialogContent>
    </Dialog>
  )
}