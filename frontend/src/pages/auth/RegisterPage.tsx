import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth, registerSchema, type RegisterFormData } from '@features/auth'
import { Button, Input, Card } from '@shared/components'

/**
 * RegisterPage Component
 *
 * Authentication page for user registration
 */
export const RegisterPage = () => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-12">
      <Card className="w-full max-w-lg" variant="elevated">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900">Utwórz konto</h1>
          <p className="text-neutral-600 mt-2">Dołącz do KPTEST Portal</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-sm text-error-800">{error}</p>
          </div>
        )}

        {/* Register form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Imię"
              placeholder="Jan"
              error={errors.firstName?.message}
              fullWidth
              {...register('firstName')}
            />

            <Input
              label="Nazwisko"
              placeholder="Kowalski"
              error={errors.lastName?.message}
              fullWidth
              {...register('lastName')}
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="wpisz@email.pl"
            error={errors.email?.message}
            fullWidth
            {...register('email')}
          />

          <Input
            label="Telefon"
            type="tel"
            placeholder="+48 123 456 789"
            error={errors.phone?.message}
            fullWidth
            {...register('phone')}
          />

          <Input
            label="Hasło"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            helperText="Min. 8 znaków, wielka i mała litera, cyfra"
            fullWidth
            {...register('password')}
          />

          <Input
            label="Potwierdź hasło"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            fullWidth
            {...register('confirmPassword')}
          />

          <div className="flex items-start">
            <input
              type="checkbox"
              id="acceptTerms"
              className="w-4 h-4 text-primary-600 border-neutral-300 rounded mt-1 focus:ring-primary-500"
              {...register('acceptTerms')}
            />
            <label htmlFor="acceptTerms" className="ml-2 text-sm text-neutral-700">
              Akceptuję{' '}
              <a href="/regulamin" className="text-primary-600 hover:underline" target="_blank">
                regulamin
              </a>{' '}
              i{' '}
              <a href="/polityka" className="text-primary-600 hover:underline" target="_blank">
                politykę prywatności
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-error-600">{errors.acceptTerms.message}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
          >
            Utwórz konto
          </Button>
        </form>

        {/* Login link */}
        <p className="mt-8 text-center text-sm text-neutral-600">
          Masz już konto?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Zaloguj się
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default RegisterPage
