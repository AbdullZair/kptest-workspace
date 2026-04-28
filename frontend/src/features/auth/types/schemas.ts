import { z } from 'zod'

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string().min(1, 'Hasło jest wymagane'),
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Register form schema
 */
export const registerSchema = z
  .object({
    email: z.string().email('Nieprawidłowy adres email'),
    password: z
      .string()
      .min(10, 'Hasło musi mieć co najmniej 10 znaków')
      .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
      .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
      .regex(/[0-9]/, 'Hasło musi zawierać cyfrę')
      .regex(/[@$!%*?&]/, 'Hasło musi zawierać znak specjalny'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'Imię jest wymagane'),
    lastName: z.string().min(1, 'Nazwisko jest wymagane'),
    pesel: z
      .string()
      .min(11, 'PESEL musi mieć 11 cyfr')
      .max(11, 'PESEL musi mieć 11 cyfr')
      .regex(/^\d{11}$/, 'PESEL musi zawierać tylko cyfry'),
    phone: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, 'Musisz zaakceptować regulamin'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są identyczne',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Password reset schema
 */
export const passwordResetSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
})

export type PasswordResetFormData = z.infer<typeof passwordResetSchema>

/**
 * New password schema
 */
export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Hasło musi mieć co najmniej 8 znaków')
      .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
      .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
      .regex(/[0-9]/, 'Hasło musi zawierać cyfrę'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są identyczne',
    path: ['confirmPassword'],
  })

export type NewPasswordFormData = z.infer<typeof newPasswordSchema>

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Podaj obecne hasło'),
    newPassword: z
      .string()
      .min(8, 'Hasło musi mieć co najmniej 8 znaków')
      .regex(/[A-Z]/, 'Hasło musi zawierać wielką literę')
      .regex(/[a-z]/, 'Hasło musi zawierać małą literę')
      .regex(/[0-9]/, 'Hasło musi zawierać cyfrę'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Hasła nie są identyczne',
    path: ['confirmNewPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

/**
 * Two-factor authentication schema
 */
export const twoFaSchema = z.object({
  code: z
    .string()
    .length(6, 'Kod musi składać się z 6 cyfr')
    .regex(/^[0-9]+$/, 'Kod musi zawierać tylko cyfry'),
})

export type TwoFaFormData = z.infer<typeof twoFaSchema>

export default {
  loginSchema,
  registerSchema,
  passwordResetSchema,
  newPasswordSchema,
  changePasswordSchema,
  twoFaSchema,
}
