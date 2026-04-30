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
    project_id: (user as unknown as { project_id?: string } | null)?.project_id,
    type: selectedType === 'ALL' ? undefined : selectedType,
    page: 0,
    size: 50,
  })

  // Fetch unread count
  const { data: unreadData } = useGetUnreadCountQuery({
    project_id: (user as unknown as { project_id?: string } | null)?.project_id,
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
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-neutral-900">Wiadomości</h1>
              {unreadData?.count !== undefined && unreadData.count > 0 && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-medium text-red-700">
                  {unreadData.count} nieprzeczytanych
                </span>
              )}
            </div>

            <button
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              onClick={() => setShowCreateModal(true)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 4v16m8-8H4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              Nowy wątek
            </button>
          </div>

          {/* Type filter tabs */}
          <div className="flex gap-2 pb-4">
            {(['ALL', 'INDIVIDUAL', 'GROUP'] as const).map((type) => (
              <button
                key={type}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
                onClick={() => setSelectedType(type)}
              >
                {type === 'ALL' ? 'Wszystkie' : type === 'INDIVIDUAL' ? 'Indywidualne' : 'Grupowe'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 lg:col-span-2">
            <ThreadList
              isLoading={isLoadingThreads}
              threads={filteredThreads}
              onSelectThread={(thread) => handleSelectThread(thread.id)}
            />
          </div>

          {/* Sidebar with quick stats */}
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-4 shadow">
              <h3 className="mb-3 font-semibold text-neutral-900">Statystyki</h3>
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
      {showCreateModal ? (
        <CreateThreadModal
          defaultProjectId={(user as unknown as { project_id?: string } | null)?.project_id}
          isLoading={isCreating}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateThread}
        />
      ) : null}
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

function CreateThreadModal({
  onClose,
  onSubmit,
  isLoading,
  defaultProjectId,
}: CreateThreadModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-neutral-900">Nowy wątek</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Tytuł</label>
            <input
              autoFocus
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Wprowadź tytuł wątku"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Typ</label>
            <div className="flex gap-2">
              <button
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  type === 'INDIVIDUAL'
                    ? 'border-2 border-blue-300 bg-blue-100 text-blue-800'
                    : 'border-2 border-transparent bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
                type="button"
                onClick={() => setType('INDIVIDUAL')}
              >
                Indywidualny
              </button>
              <button
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  type === 'GROUP'
                    ? 'border-2 border-blue-300 bg-blue-100 text-blue-800'
                    : 'border-2 border-transparent bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
                type="button"
                onClick={() => setType('GROUP')}
              >
                Grupowy
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              type="button"
              onClick={onClose}
            >
              Anuluj
            </button>
            <button
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!title.trim() || isLoading}
              type="submit"
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
