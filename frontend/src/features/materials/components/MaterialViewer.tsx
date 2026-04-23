import { memo, useState } from 'react'
import { Button } from '@shared/components'
import { MaterialTypeIcon } from './MaterialTypeIcon'
import type { EducationalMaterial } from '../types/material.types'

/**
 * MaterialViewer component props
 */
export interface MaterialViewerProps {
  material: EducationalMaterial
  onClose?: () => void
  onComplete?: () => void
  isCompleted?: boolean
}

/**
 * MaterialViewer Component
 *
 * Displays educational material content based on type
 *
 * @example
 * ```tsx
 * <MaterialViewer
 *   material={material}
 *   onComplete={handleComplete}
 *   onClose={handleClose}
 * />
 * ```
 */
export const MaterialViewer = memo(function MaterialViewer({
  material,
  onClose,
  onComplete,
  isCompleted = false,
}: MaterialViewerProps) {
  const [isLoading, setIsLoading] = useState(true)

  const handleComplete = () => {
    onComplete?.()
  }

  const renderContent = () => {
    switch (material.type) {
      case 'ARTICLE':
        return (
          <div
            className="prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: material.content }}
          />
        )

      case 'PDF':
        return (
          <div className="w-full h-full min-h-[500px] bg-neutral-100 rounded-lg flex items-center justify-center">
            {material.file_url ? (
              <iframe
                src={material.file_url}
                className="w-full h-full min-h-[500px] rounded-lg"
                title={material.title}
                onLoad={() => setIsLoading(false)}
              />
            ) : (
              <div className="text-center p-8">
                <MaterialTypeIcon type="PDF" size="lg" />
                <p className="mt-4 text-neutral-600">Podgląd PDF niedostępny</p>
                {material.external_url && (
                  <a
                    href={material.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
                  >
                    Otwórz w nowej karcie
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        )

      case 'IMAGE':
        return (
          <div className="w-full h-full min-h-[400px] bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden">
            {material.file_url ? (
              <img
                src={material.file_url}
                alt={material.title}
                className="max-w-full max-h-[600px] object-contain rounded-lg"
                onLoad={() => setIsLoading(false)}
              />
            ) : (
              <div className="text-center p-8">
                <MaterialTypeIcon type="IMAGE" size="lg" />
                <p className="mt-4 text-neutral-600">Podgląd obrazu niedostępny</p>
              </div>
            )}
          </div>
        )

      case 'VIDEO':
        return (
          <div className="w-full h-full min-h-[400px] bg-black rounded-lg flex items-center justify-center">
            {material.file_url ? (
              <video
                controls
                className="w-full max-h-[600px] rounded-lg"
                onLoadedMetadata={() => setIsLoading(false)}
              >
                <source src={material.file_url} />
                Twoja przeglądarka nie obsługuje odtwarzania wideo.
              </video>
            ) : material.external_url?.includes('youtube.com') ||
              material.external_url?.includes('youtu.be') ||
              material.external_url?.includes('vimeo.com') ? (
              <iframe
                src={material.external_url}
                className="w-full aspect-video max-h-[600px] rounded-lg"
                title={material.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
              />
            ) : (
              <div className="text-center p-8">
                <MaterialTypeIcon type="VIDEO" size="lg" />
                <p className="mt-4 text-neutral-600">Podgląd wideo niedostępny</p>
                {material.external_url && (
                  <a
                    href={material.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
                  >
                    Otwórz w nowej karcie
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        )

      case 'AUDIO':
        return (
          <div className="w-full p-6 bg-neutral-100 rounded-lg">
            {material.file_url ? (
              <audio controls className="w-full" onLoadedMetadata={() => setIsLoading(false)}>
                <source src={material.file_url} />
                Twoja przeglądarka nie obsługuje odtwarzania audio.
              </audio>
            ) : (
              <div className="text-center p-8">
                <MaterialTypeIcon type="AUDIO" size="lg" />
                <p className="mt-4 text-neutral-600">Odtwarzacz audio niedostępny</p>
              </div>
            )}
          </div>
        )

      case 'LINK':
        return (
          <div className="text-center p-8">
            <MaterialTypeIcon type="LINK" size="lg" />
            <h3 className="mt-4 text-lg font-semibold text-neutral-900">Zasób zewnętrzny</h3>
            <p className="mt-2 text-neutral-600">
              Ten materiał prowadzi do zewnętrznej strony internetowej.
            </p>
            {material.external_url && (
              <a
                href={material.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Otwórz link
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        )

      default:
        return (
          <div className="text-center p-8 text-neutral-600">
            Nieobsługiwany typ materiału: {material.type}
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <MaterialTypeIcon type={material.type} size="md" showLabel />
            {material.category && (
              <span className="text-sm text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                {material.category}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">{material.title}</h2>
        </div>

        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        )}
        {!isLoading && renderContent()}
      </div>

      {/* Actions */}
      {!isCompleted && onComplete && material.type !== 'LINK' && (
        <div className="flex justify-end">
          <Button variant="default" size="md" onClick={handleComplete}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Oznacz jako przeczytane
          </Button>
        </div>
      )}

      {isCompleted && (
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Materiał ukończony</span>
          </div>
        </div>
      )}
    </div>
  )
})

export default MaterialViewer
