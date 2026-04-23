import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@features/auth'
import { ThreadList } from '../components'
import {
  useGetThreadsQuery,
  useCreateThreadMutation,
  useGetUnreadCountQuery,
} from '../api/messageApi'
import type { ThreadFormData, ThreadType } from '../types'

/**
 * MessagesPage Component
 *
 * Main page displaying list of conversation threads
 *
 * @route /messages
 */
export const MessagesPage = function MessagesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState<ThreadType | 'ALL'>('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Fetch threads
  const {
    data: threads = [],
    isLoading: isLoadingThreads,
    refetch,
  } = useGetThreadsQuery({
    project_id: user?.project_id,
    type: selectedType === 'ALL' ? undefined : selectedType,
    page: 0,
    size: 50,
  })

  // Fetch unread count
  const { data: unreadData } = useGetUnreadCountQuery({
    project_id: user?.project_id,
  })

  // Create thread mutation
  const [createThread, { isLoading: isCreating }] = useCreateThreadMutation()

  // Handle thread selection
  const handleSelectThread = (threadId: string) => {
    navigate(`/messages/${threadId}`)
  }

  // Handle create new thread
  const handleCreateThread = async (data: ThreadFormData) => {
    try {
      const result = await createThread(data).unwrap()
      setShowCreateModal(false)
      navigate(`/messages/${result.id}`)
      refetch()
    } catch (error) {
      console.error('Failed to create thread:', error)
      alert('Nie udało się utworzyć wątku')
    }
  }

  // Filter threads by type
  const filteredThreads = useMemo(() => {
    if (selectedType === 'ALL') return threads
    return threads.filter((t) => t.type === selectedType)
  }, [threads, selectedType])

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-neutral-900">Wiadomości</h1>
              {unreadData?.count !== undefined && unreadData.count > 0 && (
                <span className="px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  {unreadData.count} nieprzeczytanych
                </span>
              )}
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nowy wątek
            </button>
          </div>

          {/* Type filter tabs */}
          <div className="flex gap-2 pb-4">
            {(['ALL', 'INDIVIDUAL', 'GROUP'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {type === 'ALL' ? 'Wszystkie' : type === 'INDIVIDUAL' ? 'Indywidualne' : 'Grupowe'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-2">
            <ThreadList
              threads={filteredThreads}
              onSelectThread={(thread) => handleSelectThread(thread.id)}
              isLoading={isLoadingThreads}
            />
          </div>

          {/* Sidebar with quick stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-neutral-900 mb-3">Statystyki</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Wszystkie wątki:</span>
                  <span className="font-medium">{threads.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Indywidualne:</span>
                  <span className="font-medium">
                    {threads.filter((t) => t.type === 'INDIVIDUAL').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Grupowe:</span>
                  <span className="font-medium">
                    {threads.filter((t) => t.type === 'GROUP').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Nieprzeczytane:</span>
                  <span className="font-medium text-red-600">{unreadData?.count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create thread modal */}
      {showCreateModal && (
        <CreateThreadModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateThread}
          isLoading={isCreating}
          defaultProjectId={user?.project_id}
        />
      )}
    </div>
  )
}

/**
 * CreateThreadModal Component
 */
interface CreateThreadModalProps {
  onClose: () => void
  onSubmit: (data: ThreadFormData) => void
  isLoading: boolean
  defaultProjectId?: string
}

function CreateThreadModal({ onClose, onSubmit, isLoading, defaultProjectId }: CreateThreadModalProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<ThreadType>('INDIVIDUAL')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !defaultProjectId) return

    onSubmit({
      project_id: defaultProjectId,
      title: title.trim(),
      type,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Nowy wątek</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tytuł
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wprowadź tytuł wątku"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Typ
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('INDIVIDUAL')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  type === 'INDIVIDUAL'
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'bg-neutral-100 text-neutral-700 border-2 border-transparent hover:bg-neutral-200'
                }`}
              >
                Indywidualny
              </button>
              <button
                type="button"
                onClick={() => setType('GROUP')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  type === 'GROUP'
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'bg-neutral-100 text-neutral-700 border-2 border-transparent hover:bg-neutral-200'
                }`}
              >
                Grupowy
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors font-medium"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Tworzenie...' : 'Utwórz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MessagesPage
