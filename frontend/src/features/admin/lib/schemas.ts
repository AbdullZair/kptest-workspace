import { z } from 'zod'

/**
 * Anonymization reason enum values
 */
export const anonymizationReasons = ['treatment', 'patient_request', 'other'] as const

/**
 * Schema for anonymizing patient data
 * Used in AnonymizePatientDialog form validation
 */
export const anonymizePatientSchema = z.object({
  reason: z.enum(anonymizationReasons, {
    required_error: 'Wybierz powód anonimizacji',
  }),
  additional_notes: z.string().max(500, 'Notatki nie mogą przekraczać 500 znaków').optional(),
  confirmation: z
    .string()
    .refine((val) => val === 'ANONYMIZUJ', {
      message: 'Wpisz "ANONYMIZUJ" aby potwierdzić',
    }),
})

/**
 * Schema for erasing patient data
 * Used in ErasePatientDialog form validation
 */
export const erasePatientSchema = z
  .object({
    reason: z.string().min(10, 'Powód musi mieć co najmniej 10 znaków'),
    confirm: z.literal(true, {
      errorMap: () => ({ message: 'Musisz potwierdzić operację' }),
    }),
    force: z.boolean().optional(),
  })
  .refine((data) => data.reason.length >= 10, {
    message: 'Powód musi mieć co najmniej 10 znaków',
    path: ['reason'],
  })

/**
 * Legal basis enum values for data processing activities
 */
export const legalBasisValues = [
  'CONSENT',
  'CONTRACT',
  'LEGAL_OBLIGATION',
  'VITAL_INTEREST',
  'PUBLIC_TASK',
  'LEGITIMATE_INTEREST',
] as const

/**
 * Schema for data processing activity form
 * Used in DataProcessingActivitiesPage CRUD operations
 */
export const dataProcessingActivitySchema = z.object({
  name: z.string().min(3, 'Nazwa musi mieć co najmniej 3 znaki').max(200, 'Nazwa nie może przekraczać 200 znaków'),
  purpose: z.string().min(10, 'Cel musi mieć co najmniej 10 znaków').max(1000, 'Cel nie może przekraczać 1000 znaków'),
  legal_basis: z.enum(legalBasisValues, {
    required_error: 'Wybierz podstawę prawną',
  }),
  categories: z.array(z.string().min(1, 'Kategoria nie może być pusta')).min(1, 'Dodaj co najmniej jedną kategorię'),
  recipients: z.array(z.string().min(1, 'Odbiorca nie może być pusty')).default([]),
  retention_period: z.string().min(5, 'Okres przechowywania musi mieć co najmniej 5 znaków').max(200, 'Okres przechowywania nie może przekraczać 200 znaków'),
  security_measures: z.string().min(10, 'Środki bezpieczeństwa muszą mieć co najmniej 10 znaków').max(2000, 'Środki bezpieczeństwa nie mogą przekraczać 2000 znaków'),
  data_controller: z.string().min(3, 'Administrator musi mieć co najmniej 3 znaki').max(200, 'Administrator nie może przekraczać 200 znaków'),
  data_processor: z.string().max(200, 'Procesor nie może przekraczać 200 znaków').optional(),
})

/**
 * Export format enum values
 */
export const exportFormatValues = ['json', 'pdf'] as const

/**
 * Type exports inferred from schemas
 */
export type AnonymizePatientFormData = z.infer<typeof anonymizePatientSchema>
export type ErasePatientFormData = z.infer<typeof erasePatientSchema>
export type DataProcessingActivityFormData = z.infer<typeof dataProcessingActivitySchema>
export type ExportFormat = (typeof exportFormatValues)[number]
export type AnonymizationReason = (typeof anonymizationReasons)[number]
export type LegalBasis = (typeof legalBasisValues)[number]
