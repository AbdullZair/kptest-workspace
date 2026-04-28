import React from 'react'
import { Button } from '@shared/components'

interface ExportConversationButtonProps {
  threadId: string
  threadTitle?: string
}

/**
 * ExportConversationButton Component
 *
 * Button that exports conversation thread as PDF.
 * Calls POST /messages/threads/{threadId}/export and downloads the blob.
 */
export const ExportConversationButton: React.FC<ExportConversationButtonProps> = ({
  threadId,
  threadTitle,
}) => {
  const handleExport = async () => {
    try {
      const token = localStorage.getItem('auth_access_token')

      const response = await fetch(`/api/v1/messages/threads/${threadId}/export?format=pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to export conversation')
      }

      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `konwersacja-${threadTitle || threadId}.pdf`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export conversation:', err)
      alert('Nie udało się wyeksportować konwersacji')
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      leftIcon={
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      }
    >
      Eksportuj PDF
    </Button>
  )
}

export default ExportConversationButton
