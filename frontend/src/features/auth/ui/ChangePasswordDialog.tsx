import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from '@headlessui/react'
import { useChangePasswordMutation } from '../api/authApi'
import { useAuth } from '../hooks/useAuth'
import { Input } from '@shared/components'
import { Button } from '@shared/components'

/**
 * Change password form schema with strength validation
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
const changePasswordDialogSchema = z
  .object({
    currentPassword: z.string().min(1, 'Podaj obecne hasło'),
    newPassword: z
      .string()
      .min(12, 'Hasło musi mieć co najmniej 12 znaków')
      .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
      .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
      .regex(/[0-9]/, 'Hasło musi zawierać cyfrę')
      .regex(/[^A-Za-z0-9]/, 'Hasło musi zawierać znak specjalny'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Hasła nie są identyczne',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Nowe hasło musi być inne niż obecne',
    path: ['newPassword'],
  })

type ChangePasswordDialogFormData = z.infer<typeof changePasswordDialogSchema>

interface ChangePasswordDialogProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * ChangePasswordDialog Component
 *
 * Dialog for changing user password with validation.
 * After successful password change, clears auth and redirects to login
 * because backend revokes all refresh tokens.
 */
export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ isOpen, onClose }) => {
  const [changePassword, { isLoading, error }] = useChangePasswordMutation()
  const { clearAuth } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ChangePasswordDialogFormData>({
    resolver: zodResolver(changePasswordDialogSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  // Watched for potential strength meter; currently unused but reserves the dependency.
  void watch('newPassword')

  const onSubmit = async (data: ChangePasswordDialogFormData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap()

      // Clear auth and redirect to login
      clearAuth()
      reset()
      onClose()

      // Redirect to login
      window.location.href = '/login'
    } catch (err) {
      console.error('Failed to change password:', err)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog className="relative z-50" open={isOpen} onClose={handleClose}>
      {/* Backdrop */}
      <div aria-hidden="true" className="fixed inset-0 bg-black/50" />

      {/* Dialog panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Header */}
            <div className="border-b border-neutral-200 px-6 py-4">
              <Dialog.Title className="text-lg font-semibold text-neutral-900">
                Zmień hasło
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-neutral-500">
                Po zmianie hasła zostaniesz wylogowany
              </Dialog.Description>
            </div>

            {/* Body */}
            <div className="space-y-4 px-6 py-4">
              {/* Error message */}
              {error ? (
                <div className="rounded border border-error-200 bg-error-50 p-3 text-sm text-error-700">
                  {('data' in error
                    ? (error.data as { message?: string })?.message
                    : 'Błąd zmiany hasła') || 'Błąd zmiany hasła'}
                </div>
              ) : null}

              {/* Current password */}
              <Input
                fullWidth
                errorMessage={errors.currentPassword?.message}
                label="Obecne hasło"
                placeholder="Wpisz obecne hasło"
                type="password"
                variant={errors.currentPassword ? 'error' : 'default'}
                {...register('currentPassword')}
              />

              {/* New password */}
              <Input
                fullWidth
                errorMessage={errors.newPassword?.message}
                helperText="Min. 12 znaków, wielka i mała litera, cyfra i znak specjalny"
                label="Nowe hasło"
                placeholder="Wpisz nowe hasło"
                type="password"
                variant={errors.newPassword ? 'error' : 'default'}
                {...register('newPassword')}
              />

              {/* Confirm new password */}
              <Input
                fullWidth
                errorMessage={errors.confirmNewPassword?.message}
                label="Potwierdź nowe hasło"
                placeholder="Wpisz ponownie nowe hasło"
                type="password"
                variant={errors.confirmNewPassword ? 'error' : 'default'}
                {...register('confirmNewPassword')}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 border-t border-neutral-200 px-6 py-4">
              <Button
                disabled={isSubmitting || isLoading}
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Anuluj
              </Button>
              <Button loading={isSubmitting || isLoading} type="submit" variant="primary">
                Zmień hasło
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default ChangePasswordDialog
