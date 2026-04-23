import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth, loginSchema, type LoginFormData } from '@features/auth'
import { Button, Input, Card } from '@shared/components'
import { cn } from '@shared/lib'

/**
 * LoginPage Component
 *
 * Authentication page for user login
 */
export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, error, clearAuthError } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    clearAuthError()

    const result = await login(data)

    if (result.success) {
      navigate('/dashboard')
    }

    setIsSubmitting(false)
  }

  const handleDemoLogin = async () => {
    setIsSubmitting(true)
    clearAuthError()

    const result = await login({
      email: 'demo@kptest.pl',
      password: 'Demo123!',
      rememberMe: true,
    })

    if (result.success) {
      navigate('/dashboard')
    }

    setIsSubmitting(false)
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900">KPTEST Portal</h1>
          <p className="text-neutral-600 mt-2">Zaloguj się do systemu medycznego</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-error-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-error-800">{error}</p>
            </div>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="wpisz@email.pl"
            autoComplete="email"
            error={errors.email?.message}
            fullWidth
            {...register('email')}
          />

          <div>
            <Input
              label="Hasło"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              fullWidth
              {...register('password')}
            />
            <div className="flex justify-end mt-1">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Zapomniałeś hasła?
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              {...register('rememberMe')}
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-neutral-700">
              Zapamiętaj mnie
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
          >
            Zaloguj się
          </Button>
        </form>

        {/* Demo login button */}
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            onClick={handleDemoLogin}
            disabled={isSubmitting}
          >
            Zaloguj jako demo
          </Button>
        </div>

        {/* Register link */}
        <p className="mt-8 text-center text-sm text-neutral-600">
          Nie masz konta?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Zarejestruj się
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default LoginPage
