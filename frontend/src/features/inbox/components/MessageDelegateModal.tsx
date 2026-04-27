import React, { useState } from 'react'
import { useDelegateThreadMutation } from '../api/inboxApi'
import type { DelegateMessageRequest, ThreadStatus } from '../types'

interface MessageDelegateModalProps {
  isOpen: boolean
  onClose: () => void
  threadId: string
  threadTitle: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
}

// Mock team members - in real app, fetch from API
const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Dr. Anna Kowalska', role: 'DOCTOR', email: 'anna.kowalska@hospital.pl' },
  { id: '2', name: 'Piotr Nowak', role: 'NURSE', email: 'piotr.nowak@hospital.pl' },
  { id: '3', name: 'Maria Wiśniewska', role: 'THERAPIST', email: 'maria.wisniewska@hospital.pl' },
  { id: '4', name: 'Dr. Jan Zieliński', role: 'COORDINATOR', email: 'jan.zielinski@hospital.pl' },
]

const STATUS_OPTIONS: { value: ThreadStatus; label: string }[] = [
  { value: 'NEW', label: 'Nowy' },
  { value: 'IN_PROGRESS', label: 'W trakcie' },
  { value: 'RESOLVED', label: 'Rozwiązany' },
  { value: 'CLOSED', label: 'Zamknięty' },
]

export const MessageDelegateModal: React.FC<MessageDelegateModalProps> = ({
  isOpen,
  onClose,
  threadId,
  threadTitle,
}) => {
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [status, setStatus] = useState<ThreadStatus>('IN_PROGRESS')
  const [comment, setComment] = useState<string>('')

  const [delegateThread, { isLoading, error }] = useDelegateThreadMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!assigneeId) {
      alert('Wybierz osobę do przypisania')
      return
    }

    const request: DelegateMessageRequest = {
      assignee_id: assigneeId,
      status: status,
      comment: comment || undefined,
    }

    try {
      await delegateThread({ threadId, body: request }).unwrap()
      // Reset form and close
      setAssigneeId('')
      setStatus('IN_PROGRESS')
      setComment('')
      onClose()
    } catch (err) {
      console.error('Failed to delegate thread:', err)
    }
  }

  const handleClose = () => {
    setAssigneeId('')
    setStatus('IN_PROGRESS')
    setComment('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Deleguj wątek</h3>
          <p className="text-sm text-gray-500 mt-1 truncate">{threadTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              Błąd: {String(error)}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-2">
              Przypisz do *
            </label>
            <select
              id="assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Wybierz członka zespołu</option>
              {MOCK_TEAM_MEMBERS.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ThreadStatus)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Komentarz
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dodaj komentarz (opcjonalnie)"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Delegowanie...' : 'Deleguj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MessageDelegateModal
