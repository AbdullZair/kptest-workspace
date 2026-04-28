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
export const MaterialViewer = memo(
  ({ material, onClose, onComplete, isCompleted = false }: MaterialViewerProps) => {
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
            <div className="flex h-full min-h-[500px] w-full items-center justify-center rounded-lg bg-neutral-100">
              {material.file_url ? (
                <iframe
                  src={material.file_url}
                  className="h-full min-h-[500px] w-full rounded-lg"
                  title={material.title}
                  onLoad={() => setIsLoading(false)}
                />
              ) : (
                <div className="p-8 text-center">
                  <MaterialTypeIcon type="PDF" size="lg" />
                  <p className="mt-4 text-neutral-600">Podgląd PDF niedostępny</p>
                  {material.external_url ? (
                    <a
                      href={material.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
                    >
                      Otwórz w nowej karcie
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ) : null}
                </div>
              )}
            </div>
          )

        case 'IMAGE':
          return (
            <div className="flex h-full min-h-[400px] w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
              {material.file_url ? (
                <img
                  src={material.file_url}
                  alt={material.title}
                  className="max-h-[600px] max-w-full rounded-lg object-contain"
                  onLoad={() => setIsLoading(false)}
                />
              ) : (
                <div className="p-8 text-center">
                  <MaterialTypeIcon type="IMAGE" size="lg" />
                  <p className="mt-4 text-neutral-600">Podgląd obrazu niedostępny</p>
                </div>
              )}
            </div>
          )

        case 'VIDEO':
          return (
            <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-lg bg-black">
              {material.file_url ? (
                <video
                  controls
                  className="max-h-[600px] w-full rounded-lg"
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
                  className="aspect-video max-h-[600px] w-full rounded-lg"
                  title={material.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setIsLoading(false)}
                />
              ) : (
                <div className="p-8 text-center">
                  <MaterialTypeIcon type="VIDEO" size="lg" />
                  <p className="mt-4 text-neutral-600">Podgląd wideo niedostępny</p>
                  {material.external_url ? (
                    <a
                      href={material.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
                    >
                      Otwórz w nowej karcie
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ) : null}
                </div>
              )}
            </div>
          )

        case 'AUDIO':
          return (
            <div className="w-full rounded-lg bg-neutral-100 p-6">
              {material.file_url ? (
                <audio controls className="w-full" onLoadedMetadata={() => setIsLoading(false)}>
                  <source src={material.file_url} />
                  Twoja przeglądarka nie obsługuje odtwarzania audio.
                </audio>
              ) : (
                <div className="p-8 text-center">
                  <MaterialTypeIcon type="AUDIO" size="lg" />
                  <p className="mt-4 text-neutral-600">Odtwarzacz audio niedostępny</p>
                </div>
              )}
            </div>
          )

        case 'LINK':
          return (
            <div className="p-8 text-center">
              <MaterialTypeIcon type="LINK" size="lg" />
              <h3 className="mt-4 text-lg font-semibold text-neutral-900">Zasób zewnętrzny</h3>
              <p className="mt-2 text-neutral-600">
                Ten materiał prowadzi do zewnętrznej strony internetowej.
              </p>
              {material.external_url ? (
                <a
                  href={material.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700"
                >
                  Otwórz link
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ) : null}
            </div>
          )

        default:
          return (
            <div className="p-8 text-center text-neutral-600">
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
            <div className="mb-2 flex items-center gap-3">
              <MaterialTypeIcon type={material.type} size="md" showLabel />
              {material.category ? (
                <span className="rounded bg-neutral-100 px-2 py-0.5 text-sm text-neutral-500">
                  {material.category}
                </span>
              ) : null}
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">{material.title}</h2>
          </div>

          {onClose ? (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          ) : null}
        </div>

        {/* Content */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
            </div>
          ) : null}
          {!isLoading && renderContent()}
        </div>

        {/* Actions */}
        {!isCompleted && onComplete && material.type !== 'LINK' ? (
          <div className="flex justify-end">
            <Button variant="default" size="md" onClick={handleComplete}>
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Oznacz jako przeczytane
            </Button>
          </div>
        ) : null}

        {isCompleted ? (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-green-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium">Materiał ukończony</span>
            </div>
          </div>
        ) : null}
      </div>
    )
  }
)

export default MaterialViewer
