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
      status,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Deleguj wątek</h3>
          <p className="mt-1 truncate text-sm text-gray-500">{threadTitle}</p>
        </div>

        <form className="px-6 py-4" onSubmit={handleSubmit}>
          {error ? (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Błąd: {String(error)}
            </div>
          ) : null}

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="assignee">
              Przypisz do *
            </label>
            <select
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
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
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="status">
              Status *
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ThreadStatus)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="comment">
              Komentarz
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="comment"
              placeholder="Dodaj komentarz (opcjonalnie)"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="button"
              onClick={handleClose}
            >
              Anuluj
            </button>
            <button
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading}
              type="submit"
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
