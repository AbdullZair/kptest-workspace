import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GenerateActivationCodeButton } from '../GenerateActivationCodeButton'
import * as adminApi from '../../api/adminApi'

jest.mock('../../api/adminApi', () => ({
  useGenerateActivationCodeMutation: jest.fn(),
}))

describe('GenerateActivationCodeButton', () => {
  const mockOnSuccess = jest.fn()
  const mockGenerateActivationCode = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(adminApi.useGenerateActivationCodeMutation as jest.Mock).mockReturnValue([
      mockGenerateActivationCode,
      { isLoading: false, error: null },
    ])
  })

  it('renders the generate button', () => {
    render(
      <GenerateActivationCodeButton
        patientId="patient-123"
        patientName="Jan Kowalski"
        patientPesel="90010112345"
      />
    )

    expect(screen.getByText(/generuj kod aktywacyjny/i)).toBeInTheDocument()
  })

  it('opens modal when button is clicked', () => {
    render(
      <GenerateActivationCodeButton
        patientId="patient-123"
        patientName="Jan Kowalski"
        patientPesel="90010112345"
      />
    )

    fireEvent.click(screen.getByText(/generuj kod aktywacyjny/i))

    expect(screen.getByText(/kod aktywacyjny dla pacjenta/i)).toBeInTheDocument()
    expect(screen.getByText(/jan kowalski/i)).toBeInTheDocument()
    expect(screen.getByText(/90010112345/i)).toBeInTheDocument()
  })

  it('displays information about activation code before generation', () => {
    render(
      <GenerateActivationCodeButton
        patientId="patient-123"
        patientName="Jan Kowalski"
        patientPesel="90010112345"
      />
    )

    fireEvent.click(screen.getByText(/generuj kod aktywacyjny/i))

    expect(screen.getByText(/informacje o kodzie aktywacyjnym/i)).toBeInTheDocument()
    expect(screen.getByText(/kod będzie miał 8 znaków/i)).toBeInTheDocument()
    expect(screen.getByText(/ważność kodu: 72 godziny/i)).toBeInTheDocument()
  })

  it('calls generateActivationCode when generate button is clicked', async () => {
    mockGenerateActivationCode.mockResolvedValue({
      patient_id: 'patient-123',
      activation_code: 'ABC12345',
      expires_at: new Date().toISOString(),
      pdf_url: '/pdf/url',
      message: 'Code generated',
    })

    render(
      <GenerateActivationCodeButton
        patientId="patient-123"
        patientName="Jan Kowalski"
        patientPesel="90010112345"
        onSuccess={mockOnSuccess}
      />
    )

    fireEvent.click(screen.getByText(/generuj kod aktywacyjny/i))
    fireEvent.click(screen.getByText(/generuj kod/i))

    await waitFor(() => {
      expect(mockGenerateActivationCode).toHaveBeenCalledWith('patient-123')
    })

    expect(mockOnSuccess).toHaveBeenCalledWith('ABC12345')
  })

  it('displays generated code after successful generation', async () => {
    mockGenerateActivationCode.mockResolvedValue({
      patient_id: 'patient-123',
      activation_code: 'ABC12345',
      expires_at: new Date().toISOString(),
      pdf_url: '/pdf/url',
      message: 'Code generated',
    })

    render(
      <GenerateActivationCodeButton
        patientId="patient-123"
        patientName="Jan Kowalski"
        patientPesel="90010112345"
      />
    )

    fireEvent.click(screen.getByText(/generuj kod aktywacyjny/i))
    fireEvent.click(screen.getByText(/generuj kod/i))

    await waitFor(() => {
      expect(screen.getByText('ABC12345')).toBeInTheDocument()
    })

    expect(screen.getByText(/kod wygenerowany pomyślnie/i)).toBeInTheDocument()
  })

  it('allows copying code to clipboard', async () => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    }
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    })

    mockGenerateActivationCode.mockResolvedValue({
      patient_id: 'patient-123',
      activation_code: 'ABC12345',
      expires_at: new Date().toISOString(),
      pdf_url: '/pdf/url',
      message: 'Code generated',
    })

    const originalAlert = window.alert
    window.alert = jest.fn()

    render(
      <GenerateActivationCodeButton
        patientId="patient-123"
        patientName="Jan Kowalski"
        patientPesel="90010112345"
      />
    )

    fireEvent.click(screen.getByText(/generuj kod aktywacyjny/i))
    fireEvent.click(screen.getByText(/generuj kod/i))

    await waitFor(() => {
      expect(screen.getByText('ABC12345')).toBeInTheDocument()
    })

    const copyButton = screen.getByTitle('Kopiuj kod')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith('ABC12345')
      expect(window.alert).toHaveBeenCalledWith('Kod skopiowany do schowka!')
    })

    window.alert = originalAlert
  })

  it('shows error message on failure', async () => {
    mockGenerateActivationCode.mockRejectedValue(new Error('Generation failed'))

    render(
      <GenerateActivationCodeButton
        patientId="patient-123"
        patientName="Jan Kowalski"
        patientPesel="90010112345"
      />
    )

    fireEvent.click(screen.getByText(/generuj kod aktywacyjny/i))
    fireEvent.click(screen.getByText(/generuj kod/i))

    await waitFor(() => {
      expect(screen.queryByText(/błąd/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during generation', () => {
    ;(adminApi.useGenerateActivationCodeMutation as jest.Mock).mockReturnValue([
      mockGenerateActivationCode,
      { isLoading: true, error: null },
    ])

    render(
      <GenerateActivationCodeButton
        patientId="patient-123"
        patientName="Jan Kowalski"
        patientPesel="90010112345"
      />
    )

    fireEvent.click(screen.getByText(/generuj kod aktywacyjny/i))

    expect(screen.getByText(/generowanie.../i)).toBeInTheDocument()
    expect(screen.getByText(/generuj kod/i)).toBeDisabled()
  })

  it('allows downloading PDF after generation', async () => {
    mockGenerateActivationCode.mockResolvedValue({
      patient_id: 'patient-123',
      activation_code: 'ABC12345',
      expires_at: new Date().toISOString(),
      pdf_url: '/pdf/url',
      message: 'Code generated',
    })

    const originalAlert = window.alert
    window.alert = jest.fn()

    render(
      <GenerateActivationCodeButton
        patientId="patient-123"
        patientName="Jan Kowalski"
        patientPesel="90010112345"
      />
    )

    fireEvent.click(screen.getByText(/generuj kod aktywacyjny/i))
    fireEvent.click(screen.getByText(/generuj kod/i))

    await waitFor(() => {
      expect(screen.getByText('ABC12345')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/pobierz pdf/i))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Pobieranie PDF')
      )
    })

    window.alert = originalAlert
  })

  it('closes modal when close button is clicked', async () => {
    mockGenerateActivationCode.mockResolvedValue({
      patient_id: 'patient-123',
      activation_code: 'ABC12345',
      expires_at: new Date().toISOString(),
      pdf_url: '/pdf/url',
      message: 'Code generated',
    })

    render(
      <GenerateActivationCodeButton
        patientId="patient-123"
        patientName="Jan Kowalski"
        patientPesel="90010112345"
      />
    )

    fireEvent.click(screen.getByText(/generuj kod aktywacyjny/i))
    fireEvent.click(screen.getByText(/generuj kod/i))

    await waitFor(() => {
      expect(screen.getByText('ABC12345')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/zamknij/i))

    expect(screen.queryByText(/kod aktywacyjny dla pacjenta/i)).not.toBeInTheDocument()
  })

  it('can cancel before generation', () => {
    render(
      <GenerateActivationCodeButton
        patientId="patient-123"
        patientName="Jan Kowalski"
        patientPesel="90010112345"
      />
    )

    fireEvent.click(screen.getByText(/generuj kod aktywacyjny/i))
    fireEvent.click(screen.getByText(/anuluj/i))

    expect(screen.queryByText(/kod aktywacyjny dla pacjenta/i)).not.toBeInTheDocument()
  })
})
