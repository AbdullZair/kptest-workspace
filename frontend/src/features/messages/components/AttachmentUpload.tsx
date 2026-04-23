import { useRef, useCallback, useState } from 'react'
import { Button, Card } from '@shared/components'

/**
 * AttachmentUpload component props
 */
export interface AttachmentUploadProps {
  messageId: string
  onUpload: (messageId: string, file: File) => Promise<void>
  isLoading?: boolean
  acceptedTypes?: string
  maxSizeMB?: number
}

/**
 * Format file size
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * AttachmentUpload Component
 *
 * File upload component for message attachments
 *
 * @example
 * ```tsx
 * <AttachmentUpload
 *   messageId={messageId}
 *   onUpload={handleUpload}
 *   maxSizeMB={10}
 * />
 * ```
 */
export const AttachmentUpload = function AttachmentUpload({
  messageId,
  onUpload,
  isLoading = false,
  acceptedTypes,
  maxSizeMB = 10,
}: AttachmentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(
    async (file: File) => {
      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes) {
        alert(`Plik jest za duży. Maksymalny rozmiar to ${maxSizeMB}MB`)
        return
      }

      try {
        setUploadProgress(0)
        await onUpload(messageId, file)
        setUploadProgress(100)
        setTimeout(() => setUploadProgress(null), 2000)
      } catch (error) {
        console.error('Upload failed:', error)
        alert('Nie udało się przesłać pliku')
        setUploadProgress(null)
      }
    },
    [messageId, onUpload, maxSizeMB]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleUpload(file)
      }
      // Reset input value to allow selecting the same file again
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [handleUpload]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const file = e.dataTransfer.files?.[0]
      if (file) {
        handleUpload(file)
      }
    },
    [handleUpload]
  )

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  return (
    <Card variant="default" size="sm" className="p-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-neutral-300 hover:border-neutral-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={handleInputChange}
          accept={acceptedTypes}
          className="hidden"
          disabled={isLoading}
        />

        {/* Upload progress */}
        {uploadProgress !== null && (
          <div className="absolute inset-0 bg-white/90 rounded-lg flex items-center justify-center z-10">
            <div className="w-full max-w-xs">
              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-neutral-600 mt-2">
                {uploadProgress === 100 ? 'Przesłano!' : `Przesyłanie... ${uploadProgress}%`}
              </p>
            </div>
          </div>
        )}

        {/* Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>

          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-neutral-700">
              {isLoading ? 'Przesyłanie...' : 'Przeciągnij plik lub kliknij aby wybrać'}
            </p>
            <p className="text-xs text-neutral-500">
              Maksymalny rozmiar: {maxSizeMB}MB
              {acceptedTypes && ` • Typy: ${acceptedTypes}`}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isLoading}
          >
            Wybierz plik
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default AttachmentUpload
