import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog } from '@headlessui/react'
import { z } from 'zod'
import { useCreateStaffMutation } from '../api/adminApi'
import type { CreateStaffRole } from '../types'
import { Button, Input } from '@shared/components'
import type { ApiError } from '@shared/api'

/**
 * CreateStaffModal Component (US-A-01)
 *
 * Form for creating a new staff member with role
 * (ADMIN / DOCTOR / COORDINATOR / NURSE / THERAPIST).
 * Uses react-hook-form + Zod for validation; password rules mirror
 * the registerSchema in features/auth/types/schemas.ts.
 */
export interface CreateStaffModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const STAFF_ROLES: { value: CreateStaffRole; label: string }[] = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'DOCTOR', label: 'Lekarz' },
  { value: 'COORDINATOR', label: 'Koordynator' },
  { value: 'NURSE', label: 'Pielęgniarka' },
  { value: 'THERAPIST', label: 'Terapeuta' },
]

const createStaffSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z
    .string()
    .min(10, 'Hasło musi mieć co najmniej 10 znaków')
    .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
    .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
    .regex(/[0-9]/, 'Hasło musi zawierać cyfrę')
    .regex(/[@$!%*?&]/, 'Hasło musi zawierać znak specjalny'),
  firstName: z.string().min(1, 'Imię jest wymagane'),
  lastName: z.string().min(1, 'Nazwisko jest wymagane'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'DOCTOR', 'COORDINATOR', 'NURSE', 'THERAPIST']),
})

type CreateStaffFormData = z.infer<typeof createStaffSchema>

export const CreateStaffModal: React.FC<CreateStaffModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [createStaff, { isLoading, error }] = useCreateStaffMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateStaffFormData>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'COORDINATOR',
    },
  })

  const handleFormSubmit = async (data: CreateStaffFormData): Promise<void> => {
    try {
      await createStaff({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone && data.phone.length > 0 ? data.phone : undefined,
        role: data.role,
      }).unwrap()

      reset()
      onSuccess?.()
      onClose()
    } catch (err) {
      // Error is rendered via the `error` value from the mutation hook below
      console.error('Failed to create staff:', err)
    }
  }

  const handleClose = (): void => {
    reset()
    onClose()
  }

  const errorMessage = error ? (error as ApiError)?.message || String(error) : null

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className="w-full max-w-lg rounded-lg bg-white shadow-xl"
          data-testid="admin-create-staff-modal"
        >
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="border-b border-neutral-200 px-6 py-4">
              <Dialog.Title className="text-lg font-semibold text-neutral-900">
                Dodaj pracownika
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-neutral-500">
                Tworzy konto pracownika z wybraną rolą i powiązanym profilem Staff.
              </Dialog.Description>
            </div>

            <div className="space-y-4 px-6 py-4">
              {errorMessage ? (
                <div
                  className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  data-testid="admin-create-staff-error"
                >
                  Błąd: {errorMessage}
                </div>
              ) : null}

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">
                  Email *
                </label>
                <Input
                  id="email"
                  {...register('email')}
                  type="email"
                  placeholder="jan.kowalski@kptest.com"
                  variant={errors.email ? 'error' : 'default'}
                  errorMessage={errors.email?.message ?? ''}
                  fullWidth
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-neutral-700"
                >
                  Hasło *
                </label>
                <Input
                  id="password"
                  {...register('password')}
                  type="password"
                  placeholder="Min. 10 znaków, A-z, 0-9, @$!%*?&"
                  variant={errors.password ? 'error' : 'default'}
                  errorMessage={errors.password?.message ?? ''}
                  fullWidth
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1 block text-sm font-medium text-neutral-700"
                  >
                    Imię *
                  </label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    type="text"
                    variant={errors.firstName ? 'error' : 'default'}
                    errorMessage={errors.firstName?.message ?? ''}
                    fullWidth
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1 block text-sm font-medium text-neutral-700"
                  >
                    Nazwisko *
                  </label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    type="text"
                    variant={errors.lastName ? 'error' : 'default'}
                    errorMessage={errors.lastName?.message ?? ''}
                    fullWidth
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium text-neutral-700">
                  Telefon
                </label>
                <Input
                  id="phone"
                  {...register('phone')}
                  type="text"
                  placeholder="+48 ..."
                  variant={errors.phone ? 'error' : 'default'}
                  errorMessage={errors.phone?.message ?? ''}
                  fullWidth
                />
              </div>

              <div>
                <label htmlFor="role" className="mb-1 block text-sm font-medium text-neutral-700">
                  Rola *
                </label>
                <select
                  id="role"
                  {...register('role')}
                  data-testid="admin-create-staff-role"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {STAFF_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.role ? (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end gap-3 rounded-b-lg border-t border-neutral-200 bg-neutral-50 px-6 py-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Anuluj
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                data-testid="admin-create-staff-submit"
              >
                Utwórz
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default CreateStaffModal
