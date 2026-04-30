import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useAuth, registerSchema, type RegisterFormData } from '@features/auth'
import { Button, Input, Card } from '@shared/components'

/**
 * RegisterPage Component
 *
 * Authentication page for user registration
 */
export const RegisterPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register: registerUser, error, clearAuthError } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      pesel: '',
      phone: '',
      acceptTerms: false,
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    clearAuthError()

    const result = await registerUser({
      identifier: data.email,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      pesel: data.pesel,
      phone: data.phone,
      termsAccepted: data.acceptTerms ? 'true' : '',
    })

    if (result.success) {
      // Patient registers with PENDING_VERIFICATION status (US-NH-01) — backend
      // does not return tokens, so we surface success and let the user move on.
      const data = result.data as { tokens?: unknown } | undefined
      if (data?.tokens) {
        navigate('/dashboard')
      } else {
        setSuccess(true)
      }
    }

    setIsSubmitting(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-12">
      <Card className="w-full max-w-lg" variant="elevated">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900" data-testid="register-title">
            {t('auth.register.title')}
          </h1>
          <p className="mt-2 text-neutral-600">{t('auth.register.subtitle')}</p>
        </div>

        {/* Error message */}
        {error ? (
          <div
            className="mb-6 rounded-lg border border-error-200 bg-error-50 p-4"
            data-testid="error-message"
          >
            <p className="text-sm text-error-800">{error}</p>
          </div>
        ) : null}

        {/* Success message — patient pending staff verification (US-NH-01) */}
        {success ? (
          <div
            className="mb-6 rounded-lg border border-success-200 bg-success-50 p-4"
            data-testid="success-message"
            role="status"
          >
            <p className="text-sm text-success-800">
              Rejestracja zakończona. Konto czeka na weryfikację przez personel medyczny —
              zostaniesz poinformowany po jej zakończeniu. Za chwilę przekierujemy Cię na stronę
              logowania.
            </p>
          </div>
        ) : null}

        {/* Register form */}
        <form className="space-y-5" data-testid="register-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              fullWidth
              data-testid="firstName-input"
              error={errors.firstName?.message}
              label={t('auth.register.firstName')}
              placeholder={t('auth.register.firstNamePlaceholder')}
              {...register('firstName')}
            />

            <Input
              fullWidth
              data-testid="lastName-input"
              error={errors.lastName?.message}
              label={t('auth.register.lastName')}
              placeholder={t('auth.register.lastNamePlaceholder')}
              {...register('lastName')}
            />
          </div>

          <Input
            fullWidth
            data-testid="email-input"
            error={errors.email?.message}
            label={t('auth.register.email')}
            placeholder={t('auth.register.emailPlaceholder')}
            type="email"
            {...register('email')}
          />

          <Input
            fullWidth
            data-testid="pesel-input"
            error={errors.pesel?.message}
            label="PESEL"
            maxLength={11}
            placeholder="00000000000"
            type="text"
            {...register('pesel')}
          />

          <Input
            fullWidth
            data-testid="phone-input"
            error={errors.phone?.message}
            label={t('auth.register.phone')}
            placeholder={t('auth.register.phonePlaceholder')}
            type="tel"
            {...register('phone')}
          />

          <Input
            fullWidth
            data-testid="password-input"
            error={errors.password?.message}
            helperText={t('auth.register.passwordHint')}
            label={t('auth.register.password')}
            placeholder={t('auth.register.passwordPlaceholder')}
            type="password"
            {...register('password')}
          />

          <Input
            fullWidth
            data-testid="confirmPassword-input"
            error={errors.confirmPassword?.message}
            label={t('auth.register.confirmPassword')}
            placeholder={t('auth.register.confirmPasswordPlaceholder')}
            type="password"
            {...register('confirmPassword')}
          />

          <div className="flex items-start">
            <input
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              data-testid="terms-checkbox"
              id="acceptTerms"
              type="checkbox"
              {...register('acceptTerms')}
            />
            <label className="ml-2 text-sm text-neutral-700" htmlFor="acceptTerms">
              {t('auth.register.acceptTerms')}{' '}
              <a className="text-primary-600 hover:underline" href="/regulamin" target="_blank">
                {t('auth.register.terms')}
              </a>{' '}
              {t('auth.register.and')}{' '}
              <a className="text-primary-600 hover:underline" href="/polityka" target="_blank">
                {t('auth.register.privacyPolicy')}
              </a>
            </label>
          </div>
          {errors.acceptTerms ? (
            <p className="text-sm text-error-600" data-testid="validation-error">
              {errors.acceptTerms.message}
            </p>
          ) : null}

          <Button
            fullWidth
            data-testid="submit-button"
            loading={isSubmitting}
            size="lg"
            type="submit"
            variant="primary"
          >
            {t('auth.register.submit')}
          </Button>
        </form>

        {/* Login link */}
        <p className="mt-8 text-center text-sm text-neutral-600">
          {t('auth.register.hasAccount')}{' '}
          <Link
            className="font-medium text-primary-600 hover:text-primary-700"
            data-testid="login-link"
            to="/login"
          >
            {t('auth.register.login')}
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default RegisterPage
