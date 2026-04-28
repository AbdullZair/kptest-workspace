import React, { useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useExportPatientDataMutation } from '../api/adminApi'
import { Button } from '@shared/components'
import type { ExportFormat } from '../lib/schemas'

export interface ExportPatientDataButtonProps {
  patientId: string
  patientName: string
  onSuccess?: () => void
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; icon: string }[] = [
  { value: 'json', label: 'JSON', icon: '📄' },
  { value: 'pdf', label: 'PDF', icon: '📕' },
]

/**
 * ExportPatientDataButton Component
 *
 * Dropdown button for exporting patient data in JSON or PDF format
 * Implements US-A-11 (eksport danych pacjenta - RODO Art. 20)
 */
export const ExportPatientDataButton: React.FC<ExportPatientDataButtonProps> = ({
  patientId,
  patientName,
  onSuccess,
}) => {
  const [exportPatientData, { isLoading }] = useExportPatientDataMutation()

  const handleExport = async (format: ExportFormat): Promise<void> => {
    try {
      const blob = await exportPatientData({
        patientId,
        format,
      }).unwrap()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dane_pacjenta_${patientName.replace(/\s+/g, '_')}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      onSuccess?.()
    } catch (err) {
      console.error('Failed to export patient data:', err)
    }
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* Button */}
      <Menu.Button as="div">
        <Button
          variant="primary"
          size="sm"
          loading={isLoading}
          rightIcon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          }
        >
          Eksportuj dane
        </Button>
      </Menu.Button>

      {/* Dropdown menu */}
      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md border border-neutral-200 bg-white shadow-lg focus:outline-none">
          <div className="py-1">
            {FORMAT_OPTIONS.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => handleExport(option.value)}
                    disabled={isLoading}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm ${
                      active ? 'bg-neutral-100' : ''
                    }`}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default ExportPatientDataButton
