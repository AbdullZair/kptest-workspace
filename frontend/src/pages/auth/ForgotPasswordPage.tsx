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

            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Sprawdź email</h1>
            <p className="text-neutral-600 mb-6">
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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900">Zapomniałeś hasła?</h1>
          <p className="text-neutral-600 mt-2">
            Wpisz swój email, aby otrzymać instrukcje resetowania
          </p>
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
            label="Email"
            type="email"
            placeholder="wpisz@email.pl"
            error={errors.email?.message}
            fullWidth
            {...register('email')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
          >
            Wyślij instrukcje
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

export default ForgotPasswordPage
