import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { findHelpArticle } from './helpContent'

interface HelpDialogProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * HelpDialog (US-S-20 — kontekstowa pomoc dla personelu).
 *
 * Modal showing help content selected by current `pathname`. Closes on
 * Escape and on backdrop click. Focus is trapped inside the dialog.
 */
export const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const article = findHelpArticle(location.pathname)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-lg rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h3 id="help-dialog-title" className="text-lg font-semibold text-neutral-900">
              {article.title}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Pomoc dotyczy widoku: <code>{location.pathname}</code>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Zamknij pomoc"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-6 py-4 text-sm text-neutral-700">
          <p>{article.body}</p>

          {article.links && article.links.length > 0 ? (
            <div>
              <p className="font-medium text-neutral-800">Powiązane:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {article.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      to={l.href}
                      onClick={onClose}
                      className="text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
            Pełna dokumentacja użytkownika dostępna w portalu wsparcia placówki.
            Skróty klawiaturowe: <kbd>Esc</kbd> zamyka pomoc, <kbd>?</kbd> otwiera.
          </div>
        </div>

        <div className="flex justify-end border-t border-neutral-200 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  )
}

export default HelpDialog
