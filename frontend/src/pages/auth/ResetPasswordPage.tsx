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
  const navigate = useNavigate()
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-12">
        <Card className="w-full max-w-md" variant="elevated">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-success-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Hasło zmienione</h1>
            <p className="text-neutral-600 mb-6">
              Twoje hasło zostało pomyślnie zresetowane. Możesz się teraz zalogować.
            </p>

            <Link to="/login">
              <Button variant="primary" fullWidth>
                Zaloguj się
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-12">
      <Card className="w-full max-w-md" variant="elevated">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900">Ustaw nowe hasło</h1>
          <p className="text-neutral-600 mt-2">Wpisz swoje nowe hasło</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-sm text-error-800">{error}</p>
          </div>
        )}

        {/* Reset form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Nowe hasło"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            helperText="Min. 8 znaków, wielka i mała litera, cyfra"
            fullWidth
            {...register('password')}
          />

          <Input
            label="Potwierdź nowe hasło"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            fullWidth
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
          >
            Zmień hasło
          </Button>
        </form>

        {/* Back to login */}
        <p className="mt-8 text-center text-sm text-neutral-600">
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Wróć do logowania
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default ResetPasswordPage
