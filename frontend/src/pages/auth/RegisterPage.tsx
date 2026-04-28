import { type FormEvent, useState } from 'react'
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      acceptTerms: false,
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    clearAuthError()

    const result = await registerUser({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    })

    if (result.success) {
      navigate('/dashboard')
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
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900" data-testid="register-title">{t('auth.register.title')}</h1>
          <p className="mt-2 text-neutral-600">{t('auth.register.subtitle')}</p>
        </div>

        {/* Error message */}
        {error ? (
          <div className="mb-6 rounded-lg border border-error-200 bg-error-50 p-4" data-testid="error-message">
            <p className="text-sm text-error-800">{error}</p>
          </div>
        ) : null}

        {/* Register form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="register-form">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('auth.register.firstName')}
              placeholder={t('auth.register.firstNamePlaceholder')}
              error={errors.firstName?.message}
              fullWidth
              data-testid="firstName-input"
              {...register('firstName')}
            />

            <Input
              label={t('auth.register.lastName')}
              placeholder={t('auth.register.lastNamePlaceholder')}
              error={errors.lastName?.message}
              fullWidth
              data-testid="lastName-input"
              {...register('lastName')}
            />
          </div>

          <Input
            label={t('auth.register.email')}
            type="email"
            placeholder={t('auth.register.emailPlaceholder')}
            error={errors.email?.message}
            fullWidth
            data-testid="email-input"
            {...register('email')}
          />

          <Input
            label={t('auth.register.phone')}
            type="tel"
            placeholder={t('auth.register.phonePlaceholder')}
            error={errors.phone?.message}
            fullWidth
            data-testid="phone-input"
            {...register('phone')}
          />

          <Input
            label={t('auth.register.password')}
            type="password"
            placeholder={t('auth.register.passwordPlaceholder')}
            error={errors.password?.message}
            helperText={t('auth.register.passwordHint')}
            fullWidth
            data-testid="password-input"
            {...register('password')}
          />

          <Input
            label={t('auth.register.confirmPassword')}
            type="password"
            placeholder={t('auth.register.confirmPasswordPlaceholder')}
            error={errors.confirmPassword?.message}
            fullWidth
            data-testid="confirmPassword-input"
            {...register('confirmPassword')}
          />

          <div className="flex items-start">
            <input
              type="checkbox"
              id="acceptTerms"
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              data-testid="terms-checkbox"
              {...register('acceptTerms')}
            />
            <label htmlFor="acceptTerms" className="ml-2 text-sm text-neutral-700">
              {t('auth.register.acceptTerms')}{' '}
              <a href="/regulamin" className="text-primary-600 hover:underline" target="_blank">
                {t('auth.register.terms')}
              </a>{' '}
              {t('auth.register.and')}{' '}
              <a href="/polityka" className="text-primary-600 hover:underline" target="_blank">
                {t('auth.register.privacyPolicy')}
              </a>
            </label>
          </div>
          {errors.acceptTerms ? (
            <p className="text-sm text-error-600" data-testid="validation-error">{errors.acceptTerms.message}</p>
          ) : null}

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            fullWidth 
            loading={isSubmitting}
            data-testid="submit-button"
          >
            {t('auth.register.submit')}
          </Button>
        </form>

        {/* Login link */}
        <p className="mt-8 text-center text-sm text-neutral-600">
          {t('auth.register.hasAccount')}{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700" data-testid="login-link">
            {t('auth.register.login')}
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default RegisterPage
