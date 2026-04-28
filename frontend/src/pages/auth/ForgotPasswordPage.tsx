import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth, passwordResetSchema, type PasswordResetFormData } from '@features/auth'
import { Button, Input, Card } from '@shared/components'

/**
 * ForgotPasswordPage Component
 *
 * Password reset request page
 */
export const ForgotPasswordPage = () => {
  const { requestPasswordReset, error, clearAuthError } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: PasswordResetFormData) => {
    setIsSubmitting(true)
    clearAuthError()

    const result = await requestPasswordReset(data.email)

    if (result.success) {
      setIsSent(true)
    }

    setIsSubmitting(false)
  }

  if (isSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-12">
        <Card className="w-full max-w-md" variant="elevated">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
              <svg
                className="h-8 w-8 text-success-600"
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

            <h1 className="mb-2 text-2xl font-bold text-neutral-900">Sprawdź email</h1>
            <p className="mb-6 text-neutral-600">
              Wysłaliśmy instrukcje resetowania hasła na podany adres email.
            </p>

            <div className="space-y-3">
              <Button variant="primary" fullWidth onClick={() => window.location.reload()}>
                Wyślij ponownie
              </Button>

              <Link to="/login">
                <Button variant="outline" fullWidth>
                  Wróć do logowania
                </Button>
              </Link>
            </div>
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
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900">Zapomniałeś hasła?</h1>
          <p className="mt-2 text-neutral-600">
            Wpisz swój email, aby otrzymać instrukcje resetowania
          </p>
        </div>

        {/* Error message */}
        {error ? (
          <div className="mb-6 rounded-lg border border-error-200 bg-error-50 p-4">
            <p className="text-sm text-error-800">{error}</p>
          </div>
        ) : null}

        {/* Reset form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="wpisz@email.pl"
            error={errors.email?.message}
            fullWidth
            {...register('email')}
          />

          <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
            Wyślij instrukcje
          </Button>
        </form>

        {/* Back to login */}
        <p className="mt-8 text-center text-sm text-neutral-600">
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Wróć do logowania
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
