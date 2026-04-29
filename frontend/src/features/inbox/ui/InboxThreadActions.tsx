import React, { useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import {
  useUpdateThreadStatusMutation,
  useAssignThreadMutation,
  useSetThreadPriorityMutation,
} from '../api/inboxApi'
import type { InboxThread, ThreadStatus, MessagePriority } from '../types'

interface TeamMember {
  id: string
  name: string
  role: string
}

// Mock team members - in real app, fetch from API
const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Dr. Anna Kowalska', role: 'DOCTOR' },
  { id: '2', name: 'Piotr Nowak', role: 'NURSE' },
  { id: '3', name: 'Maria Wiśniewska', role: 'THERAPIST' },
  { id: '4', name: 'Jan Zieliński', role: 'COORDINATOR' },
]

const STATUS_OPTIONS: { value: ThreadStatus; label: string }[] = [
  { value: 'NEW', label: 'Nowy' },
  { value: 'IN_PROGRESS', label: 'W trakcie' },
  { value: 'RESOLVED', label: 'Rozwiązany' },
  { value: 'CLOSED', label: 'Zamknięty' },
]

const PRIORITY_OPTIONS: { value: MessagePriority; label: string; color: string }[] = [
  { value: 'LOW', label: 'Niski', color: 'text-green-600' },
  { value: 'MEDIUM', label: 'Średni', color: 'text-yellow-600' },
  { value: 'HIGH', label: 'Wysoki', color: 'text-orange-600' },
  { value: 'URGENT', label: 'Pilny', color: 'text-red-600' },
]

interface InboxThreadActionsProps {
  thread: InboxThread
  onActionComplete?: () => void
}

/**
 * InboxThreadActions Component
 *
 * Dropdown menu with thread actions:
 * - Mark as: NEW | IN_PROGRESS | RESOLVED | ARCHIVED
 * - Assign to: staff picker
 * - Set priority: LOW | NORMAL | HIGH | URGENT
 */
export const InboxThreadActions: React.FC<InboxThreadActionsProps> = ({
  thread,
  onActionComplete,
}) => {
  const [updateThreadStatus] = useUpdateThreadStatusMutation()
  const [assignThread] = useAssignThreadMutation()
  const [setThreadPriority] = useSetThreadPriorityMutation()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isAssigneeOpen, setIsAssigneeOpen] = useState(false)

  const handleStatusChange = async (status: ThreadStatus) => {
    try {
      await updateThreadStatus({ threadId: thread.id, status }).unwrap()
      onActionComplete?.()
    } catch (err) {
      console.error('Failed to update thread status:', err)
    }
  }

  const handleAssigneeChange = async (assigneeId: string) => {
    try {
      await assignThread({ threadId: thread.id, assigneeId }).unwrap()
      onActionComplete?.()
      setIsAssigneeOpen(false)
    } catch (err) {
      console.error('Failed to assign thread:', err)
    }
  }

  const handlePriorityChange = async (priority: string) => {
    try {
      await setThreadPriority({ threadId: thread.id, priority }).unwrap()
      onActionComplete?.()
    } catch (err) {
      console.error('Failed to set thread priority:', err)
    }
  }

  const getStatusBadgeClass = (status: ThreadStatus): string => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-700'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-700'
      case 'RESOLVED':
        return 'bg-green-100 text-green-700'
      case 'CLOSED':
        return 'bg-neutral-100 text-neutral-700'
      default:
        return 'bg-neutral-100 text-neutral-700'
    }
  }

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Akcje
          <svg className="-mr-1 ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md border border-neutral-200 bg-white shadow-lg focus:outline-none">
            <div className="py-2">
              {/* Status section */}
              <div className="border-b border-neutral-100 px-4 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Status
                </p>
              </div>
              {STATUS_OPTIONS.map((option) => (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      onClick={() => handleStatusChange(option.value)}
                      className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                        active ? 'bg-neutral-100' : ''
                      }`}
                    >
                      <span className="text-neutral-700">{option.label}</span>
                      {thread.status === option.value && (
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                            option.value
                          )}`}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  )}
                </Menu.Item>
              ))}

              {/* Priority section */}
              <div className="border-b border-t border-neutral-100 px-4 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Priorytet
                </p>
              </div>
              {PRIORITY_OPTIONS.map((option) => (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      onClick={() => handlePriorityChange(option.value)}
                      className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                        active ? 'bg-neutral-100' : ''
                      }`}
                    >
                      <span className={`text-neutral-700 ${option.color}`}>{option.label}</span>
                    </button>
                  )}
                </Menu.Item>
              ))}

              {/* Assignee section */}
              <div className="border-b border-t border-neutral-100 px-4 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Przypisz do
                </p>
              </div>
              {TEAM_MEMBERS.map((member) => (
                <Menu.Item key={member.id}>
                  {({ active }) => (
                    <button
                      onClick={() => handleAssigneeChange(member.id)}
                      className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                        active ? 'bg-neutral-100' : ''
                      }`}
                    >
                      <div>
                        <span className="text-neutral-700">{member.name}</span>
                        <span className="ml-2 text-xs text-neutral-400">{member.role}</span>
                      </div>
                      {thread.assigned_to === member.id && <span className="text-blue-600">✓</span>}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}

export default InboxThreadActions
