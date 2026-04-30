import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth, newPasswordSchema, type NewPasswordFormData } from '@features/auth'
import { Button, Input, Card } from '@shared/components'

/**
 * ResetPasswordPage Component
 *
 * Password reset with token page
 */
export const ResetPasswordPage = () => {
  // navigate is currently unused but reserved for redirecting after successful reset
  const _navigate = useNavigate()
  void _navigate
  const { token } = useParams<{ token: string }>()
  const { resetPassword, error, clearAuthError } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReset, setIsReset] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: NewPasswordFormData) => {
    if (!token) {
      return
    }

    setIsSubmitting(true)
    clearAuthError()

    const result = await resetPassword(token, data.password)

    if (result.success) {
      setIsReset(true)
    }

    setIsSubmitting(false)
  }

  if (isReset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-12">
        <Card className="w-full max-w-md" variant="elevated">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
              <svg
                className="h-8 w-8 text-success-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>

            <h1 className="mb-2 text-2xl font-bold text-neutral-900">Hasło zmienione</h1>
            <p className="mb-6 text-neutral-600">
              Twoje hasło zostało pomyślnie zresetowane. Możesz się teraz zalogować.
            </p>

            <Link to="/login">
              <Button fullWidth variant="primary">
                Zaloguj się
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-12">
      <Card className="w-full max-w-md" variant="elevated">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
            <svg
              className="h-7 w-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900">Ustaw nowe hasło</h1>
          <p className="mt-2 text-neutral-600">Wpisz swoje nowe hasło</p>
        </div>

        {/* Error message */}
        {error ? (
          <div className="mb-6 rounded-lg border border-error-200 bg-error-50 p-4">
            <p className="text-sm text-error-800">{error}</p>
          </div>
        ) : null}

        {/* Reset form */}
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            fullWidth
            error={errors.password?.message}
            helperText="Min. 8 znaków, wielka i mała litera, cyfra"
            label="Nowe hasło"
            placeholder="••••••••"
            type="password"
            {...register('password')}
          />

          <Input
            fullWidth
            error={errors.confirmPassword?.message}
            label="Potwierdź nowe hasło"
            placeholder="••••••••"
            type="password"
            {...register('confirmPassword')}
          />

          <Button fullWidth loading={isSubmitting} size="lg" type="submit" variant="primary">
            Zmień hasło
          </Button>
        </form>

        {/* Back to login */}
        <p className="mt-8 text-center text-sm text-neutral-600">
          <Link className="font-medium text-primary-600 hover:text-primary-700" to="/login">
            Wróć do logowania
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default ResetPasswordPage
