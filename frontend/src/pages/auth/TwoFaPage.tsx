import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth, twoFaSchema, type TwoFaFormData } from '@features/auth'
import { Button, Card } from '@shared/components'
import { cn } from '@shared/lib'

/**
 * TwoFaPage Component
 *
 * Two-factor authentication verification page
 */
export const TwoFaPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyTwoFa, error, clearAuthError } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const email = (location.state as { email?: string })?.email || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TwoFaFormData>({
    resolver: zodResolver(twoFaSchema),
    defaultValues: {
      code: '',
    },
  })

  const code = watch('code')

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [resendCooldown])

  // Auto-submit when code is complete
  useEffect(() => {
    if (code.length === 6 && !isSubmitting) {
      handleSubmit(onSubmit)()
    }
  }, [code])

  const onSubmit = async (data: TwoFaFormData) => {
    setIsSubmitting(true)
    clearAuthError()

    const result = await verifyTwoFa(data.code)

    if (result.success) {
      navigate('/dashboard')
    }

    setIsSubmitting(false)
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    // TODO: Call API to resend code
    setResendCooldown(30)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setValue('code', value)
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
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900">Weryfikacja dwuetapowa</h1>
          <p className="mt-2 text-neutral-600">
            Wpisz 6-cyfrowy kod wysłany na {email || 'Twój email'}
          </p>
        </div>

        {/* Error message */}
        {error ? (
          <div className="mb-6 rounded-lg border border-error-200 bg-error-50 p-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-error-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  fillRule="evenodd"
                />
              </svg>
              <p className="text-sm text-error-800">{error}</p>
            </div>
          </div>
        ) : null}

        {/* 2FA form */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* OTP Input */}
          <div className="flex justify-center">
            <input
              aria-describedby={errors.code ? 'code-error' : undefined}
              aria-invalid={!!errors.code}
              aria-label="6-cyfrowy kod weryfikacyjny"
              autoComplete="one-time-code"
              className={cn(
                'w-48 text-center text-3xl font-bold tracking-widest',
                'rounded-lg border-2 border-neutral-300 px-4 py-3',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                'transition-colors duration-200',
                errors.code && 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
              )}
              disabled={isSubmitting}
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]*"
              placeholder="000000"
              type="text"
              {...register('code')}
              onChange={handleInputChange}
            />
          </div>

          {errors.code ? (
            <p
              className="flex items-center justify-center gap-1 text-center text-sm text-error-600"
              id="code-error"
              role="alert"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  fillRule="evenodd"
                />
              </svg>
              {errors.code.message}
            </p>
          ) : null}

          {/* Loading indicator */}
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2 text-neutral-600">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-sm">Weryfikacja...</span>
            </div>
          ) : null}

          <Button
            fullWidth
            disabled={code.length !== 6 || isSubmitting}
            loading={isSubmitting}
            size="lg"
            type="submit"
            variant="primary"
          >
            Zweryfikuj
          </Button>
        </form>

        {/* Resend code */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Nie otrzymałeś kodu?{' '}
            <button
              className={cn(
                'font-medium',
                resendCooldown > 0
                  ? 'cursor-not-allowed text-neutral-400'
                  : 'text-primary-600 hover:text-primary-700'
              )}
              disabled={resendCooldown > 0}
              type="button"
              onClick={handleResendCode}
            >
              {resendCooldown > 0 ? `Wyślij ponownie za ${resendCooldown}s` : 'Wyślij kod ponownie'}
            </button>
          </p>
        </div>

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

export default TwoFaPage
