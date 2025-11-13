'use client'

import { useState, useRef, useCallback } from 'react'
import { 
  Upload, 
  FileText, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  File,
  Trash2,
  Play,
  Pause
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
// Toast functionality removed

import { DocumentUploadProps, ChunkingStrategy } from '@/types/rag'
import { 
  validateFiles, 
  uploadDocument, 
  batchUploadDocuments,
  validateFile,
  formatFileSize,
  getFileTypeDisplay
} from '@/lib/rag-api'

interface UploadFile extends File {
  id: string
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  error?: string
  displayName?: string
}

interface DocumentUploaderProps {
  corpusId?: string
  isOpen: boolean
  onClose: () => void
  onUploadComplete: (documents: any[]) => void
}

export default function DocumentUploader({
  corpusId,
  isOpen,
  onClose,
  onUploadComplete
}: DocumentUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [chunkingStrategy, setChunkingStrategy] = useState<ChunkingStrategy>('auto')
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Toast functionality removed

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleFileChange = (selectedFiles: File[]) => {
    const newFiles: UploadFile[] = selectedFiles.map((file, index) => ({
      ...file,
      id: `${Date.now()}-${index}`,
      status: 'pending' as const,
      progress: 0,
      displayName: file.name
    }))

    // Validate files
    const validatedFiles = newFiles.map(file => {
      const validation = validateFile(file)
      return {
        ...file,
        status: validation.valid ? 'pending' as const : 'error' as const,
        error: validation.error
      }
    })

    setFiles(prev => [...prev, ...validatedFiles])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    handleFileChange(selectedFiles)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFileChange(droppedFiles)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const updateFileName = (fileId: string, newName: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, displayName: newName || file.name }
        : file
    ))
  }

  const handleUpload = async () => {
    if (!corpusId || files.length === 0) return

    const validFiles = files.filter(f => f.status !== 'error')
    if (validFiles.length === 0) {
      console.error('No valid files to upload')
      return
    }

    setIsUploading(true)
    abortControllerRef.current = new AbortController()
    
    try {
      // Validate files with backend first
      setIsValidating(true)
      const validation = await validateFiles(validFiles, corpusId)
      setIsValidating(false)

      if (!validation.valid_files || validation.valid_files.length === 0) {
        console.error('Validation failed: No files passed backend validation')
        return
      }

      // Update file statuses based on validation
      setFiles(prev => prev.map(file => {
        if (validation.invalid_files.some(invalid => invalid.filename === file.name)) {
          const error = validation.invalid_files.find(invalid => invalid.filename === file.name)
          return { ...file, status: 'error' as const, error: error?.message }
        }
        return file.status === 'pending' ? { ...file, status: 'pending' as const } : file
      }))

      const finalValidFiles = files.filter(f => 
        validation.valid_files.includes(f.name) && f.status !== 'error'
      )

      if (finalValidFiles.length === 0) {
        console.error('All files failed validation')
        return
      }

      // Upload files one by one for progress tracking
      const uploadedDocuments = []
      let completedCount = 0

      for (const file of finalValidFiles) {
        try {
          // Update file status to uploading
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'uploading' as const, progress: 0 }
              : f
          ))

          const document = await uploadDocument(file, corpusId, {
            display_name: file.displayName !== file.name ? file.displayName : undefined,
            chunking_strategy: chunkingStrategy
          })

          // Update file status to completed
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'completed' as const, progress: 100 }
              : f
          ))

          uploadedDocuments.push(document)
          completedCount++

          // Update overall progress
          setUploadProgress((completedCount / finalValidFiles.length) * 100)

        } catch (error) {
          // Update file status to error
          const errorMessage = error instanceof Error ? error.message : 'Upload failed'
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'error' as const, error: errorMessage }
              : f
          ))
        }
      }

      if (uploadedDocuments.length > 0) {
        console.log(`Upload completed: ${uploadedDocuments.length} document${uploadedDocuments.length === 1 ? '' : 's'} uploaded successfully`)
        onUploadComplete(uploadedDocuments)
      }

      const errorCount = finalValidFiles.length - uploadedDocuments.length
      if (errorCount > 0) {
        console.error(`Partial upload failure: ${errorCount} document${errorCount === 1 ? '' : 's'} failed to upload`)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      console.error('Upload failed:', errorMessage)
    } finally {
      setIsUploading(false)
      setIsValidating(false)
    }
  }

  const handleClose = () => {
    if (isUploading) {
      abortControllerRef.current?.abort()
      setIsUploading(false)
    }
    setFiles([])
    setUploadProgress(0)
    onClose()
  }

  const getFileIcon = (file: UploadFile) => {
    if (file.type.includes('pdf')) return '📄'
    if (file.type.includes('text')) return '📝'
    if (file.type.includes('word')) return '📘'
    if (file.type.includes('csv')) return '📊'
    if (file.type.includes('json')) return '🔧'
    return '📄'
  }

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800'
      case 'uploading': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const validFilesCount = files.filter(f => f.status !== 'error').length
  const totalFileSize = files.reduce((sum, file) => sum + file.size, 0)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Documents
          </DialogTitle>
          <DialogDescription>
            Upload documents to your corpus for RAG functionality. Supported formats: PDF, TXT, DOCX, MD, CSV, JSON.
          </DialogDescription>
        </DialogHeader>

        {/* Upload Settings */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="chunking-strategy">Chunking Strategy</Label>
            <select
              id="chunking-strategy"
              value={chunkingStrategy}
              onChange={(e) => setChunkingStrategy(e.target.value as ChunkingStrategy)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isUploading}
            >
              <option value="auto">Auto (Recommended) - Smart content-aware chunking</option>
              <option value="fixed">Fixed Size - Consistent chunk sizes</option>
              <option value="semantic">Semantic - Meaning-based chunking</option>
            </select>
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={openFileDialog}
            className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer touch-manipulation active:scale-[0.99] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            role="button"
            tabIndex={isUploading ? -1 : 0}
            aria-label="Upload documents by dropping files or clicking to browse"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openFileDialog()
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.md,.docx,.doc,.csv,.json"
              onChange={handleInputChange}
              style={{ display: 'none' }}
              aria-label="Select files to upload"
            />
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            {isDragActive ? (
              <p className="text-blue-600 font-medium text-sm sm:text-base">Drop files here...</p>
            ) : (
              <>
                <p className="text-gray-600 mb-2 text-sm sm:text-base">
                  <span className="hidden sm:inline">Drag and drop files here, or </span>
                  <span className="text-blue-600 font-medium">
                    <span className="sm:hidden">Tap to select files</span>
                    <span className="hidden sm:inline">browse</span>
                  </span>
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Max 50MB per file • PDF, TXT, DOCX, MD, CSV, JSON
                </p>
              </>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  Files ({validFilesCount}/{files.length}) • {formatFileSize(totalFileSize)}
                </h3>
                {!isUploading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiles([])}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-60 sm:max-h-80 overflow-y-auto touch-pan-y">
                {files.map((file) => (
                  <Card key={file.id} className={`transition-all duration-200 ${file.status === 'error' ? 'border-red-200 bg-red-50' : 'hover:shadow-sm'}`}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="text-xl sm:text-2xl flex-shrink-0">{getFileIcon(file)}</div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Mobile layout - stack vertically */}
                          <div className="space-y-2 sm:space-y-1">
                            <div className="flex items-center gap-2">
                              {file.status !== 'error' && !isUploading ? (
                                <Input
                                  value={file.displayName || ''}
                                  onChange={(e) => updateFileName(file.id, e.target.value)}
                                  className="text-sm h-8 sm:h-7 font-medium flex-1"
                                  placeholder={file.name}
                                />
                              ) : (
                                <p className="font-medium text-sm truncate flex-1">{file.displayName}</p>
                              )}
                              <Badge className={`${getStatusColor(file.status)} text-xs`}>
                                {file.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{getFileTypeDisplay(file.type)}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>{formatFileSize(file.size)}</span>
                            </div>

                            {file.status === 'uploading' && (
                              <Progress value={file.progress} className="mt-2 h-2" />
                            )}

                            {file.status === 'error' && file.error && (
                              <p className="text-xs text-red-600 mt-1 break-words">{file.error}</p>
                            )}
                          </div>
                        </div>

                        {!isUploading && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 flex-shrink-0 touch-manipulation"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Upload Progress</span>
                <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
              className="w-full sm:w-auto"
            >
              {isUploading ? 'Cancel Upload' : 'Close'}
            </Button>
            
            <Button
              onClick={handleUpload}
              disabled={validFilesCount === 0 || isUploading || !corpusId}
              className="w-full sm:w-auto"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {validFilesCount} File{validFilesCount === 1 ? '' : 's'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}