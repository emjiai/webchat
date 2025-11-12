'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

import { CorpusCreatorProps, CreateCorpusRequest } from '@/types/rag'
import { createCorpus } from '@/lib/rag-api'

const corpusSchema = z.object({
  display_name: z
    .string()
    .min(1, 'Corpus name is required')
    .max(100, 'Corpus name must be 100 characters or less')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Only letters, numbers, spaces, hyphens and underscores are allowed'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  embedding_model: z
    .string()
    .default('publishers/google/models/text-embedding-004')
})

type CorpusFormData = z.infer<typeof corpusSchema>

export default function CorpusCreator({ 
  isOpen, 
  onClose, 
  chatbotId, 
  onCorpusCreated 
}: CorpusCreatorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const form = useForm<CorpusFormData>({
    resolver: zodResolver(corpusSchema),
    defaultValues: {
      display_name: '',
      description: '',
      embedding_model: 'publishers/google/models/text-embedding-004'
    },
  })

  const onSubmit = async (data: CorpusFormData) => {
    try {
      setIsCreating(true)

      const corpusData: CreateCorpusRequest = {
        display_name: data.display_name,
        description: data.description || undefined,
        chatbot_id: chatbotId,
        embedding_model: data.embedding_model
      }

      const newCorpus = await createCorpus(corpusData)

      toast({
        title: 'Success',
        description: `Corpus "${newCorpus.display_name}" created successfully`,
      })

      onCorpusCreated(newCorpus)
      form.reset()
      onClose()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create corpus'
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })

      console.error('Corpus creation error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      form.reset()
      onClose()
    }
  }

  const embeddingModels = [
    {
      value: 'publishers/google/models/text-embedding-004',
      label: 'Text Embedding 004 (Recommended)',
      description: 'Latest high-performance embedding model'
    },
    {
      value: 'publishers/google/models/text-embedding-003',
      label: 'Text Embedding 003',
      description: 'Previous generation embedding model'
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Create New Corpus
          </DialogTitle>
          <DialogDescription>
            Create a new document corpus for RAG functionality. This will store and organize documents for your chatbot.
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
                      disabled={isCreating}
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
                      placeholder="Describe what types of documents this corpus will contain..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isCreating}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description to help identify this corpus
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Embedding Model */}
            <FormField
              control={form.control}
              name="embedding_model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embedding Model</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isCreating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an embedding model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {embeddingModels.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{model.label}</span>
                            <span className="text-xs text-gray-500">{model.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The AI model used to create embeddings from your documents
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">What happens next?</p>
                  <p className="text-blue-700 mt-1">
                    After creating the corpus, you'll be able to upload documents that will be processed 
                    and made searchable for your chatbot's RAG functionality.
                  </p>
                </div>
              </div>
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
                    Creating Corpus...
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
        </Form>
      </DialogContent>
    </Dialog>
  )
}