import { describe, it, expect } from 'vitest'
import { anonymizePatientSchema, erasePatientSchema, dataProcessingActivitySchema } from '../schemas'

describe('RODO Zod Schemas', () => {
  describe('anonymizePatientSchema', () => {
    it('validates correct anonymization data', () => {
      const validData = {
        reason: 'patient_request' as const,
        confirmation: 'ANONYMIZUJ',
      }

      const result = anonymizePatientSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('fails when confirmation text is incorrect', () => {
      const invalidData = {
        reason: 'patient_request' as const,
        confirmation: 'wrong text',
      }

      const result = anonymizePatientSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.some((e) => e.message.includes('ANONYMIZUJ'))).toBe(true)
      }
    })

    it('fails when reason is missing', () => {
      const invalidData = {
        confirmation: 'ANONYMIZUJ',
      }

      const result = anonymizePatientSchema.safeParse(invalidData as any)
      expect(result.success).toBe(false)
    })

    it('accepts all valid reason values', () => {
      const reasons = ['treatment', 'patient_request', 'other'] as const

      reasons.forEach((reason) => {
        const validData = {
          reason,
          confirmation: 'ANONYMIZUJ',
        }

        const result = anonymizePatientSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })

    it('accepts optional additional_notes', () => {
      const validData = {
        reason: 'treatment' as const,
        additional_notes: 'Some notes here',
        confirmation: 'ANONYMIZUJ',
      }

      const result = anonymizePatientSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects additional_notes longer than 500 characters', () => {
      const invalidData = {
        reason: 'treatment' as const,
        additional_notes: 'a'.repeat(501),
        confirmation: 'ANONYMIZUJ',
      }

      const result = anonymizePatientSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('erasePatientSchema', () => {
    it('validates correct erasure data', () => {
      const validData = {
        reason: 'Patient requested erasure under RODO Art. 17',
        confirm: true,
      }

      const result = erasePatientSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('fails when reason is shorter than 10 characters', () => {
      const invalidData = {
        reason: 'Short',
        confirm: true,
      }

      const result = erasePatientSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('fails when confirm is not true', () => {
      const invalidData = {
        reason: 'Patient requested erasure under RODO Art. 17',
        confirm: false,
      }

      const result = erasePatientSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('accepts force flag as optional', () => {
      const validData = {
        reason: 'Patient requested erasure under RODO Art. 17',
        confirm: true,
        force: true,
      }

      const result = erasePatientSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('dataProcessingActivitySchema', () => {
    it('validates correct activity data', () => {
      const validData = {
        name: 'Test Activity',
        purpose: 'Testing purposes for validation',
        legal_basis: 'CONSENT' as const,
        categories: ['Category 1'],
        recipients: ['Recipient 1'],
        retention_period: '5 years',
        security_measures: 'Standard security measures applied',
        data_controller: 'Test Controller',
      }

      const result = dataProcessingActivitySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('fails when name is shorter than 3 characters', () => {
      const invalidData = {
        name: 'AB',
        purpose: 'Testing purposes for validation',
        legal_basis: 'CONSENT' as const,
        categories: ['Category 1'],
        retention_period: '5 years',
        security_measures: 'Standard security measures applied',
        data_controller: 'Test Controller',
      }

      const result = dataProcessingActivitySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('fails when purpose is shorter than 10 characters', () => {
      const invalidData = {
        name: 'Test Activity',
        purpose: 'Short',
        legal_basis: 'CONSENT' as const,
        categories: ['Category 1'],
        retention_period: '5 years',
        security_measures: 'Standard security measures applied',
        data_controller: 'Test Controller',
      }

      const result = dataProcessingActivitySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('fails when categories is empty', () => {
      const invalidData = {
        name: 'Test Activity',
        purpose: 'Testing purposes for validation',
        legal_basis: 'CONSENT' as const,
        categories: [],
        retention_period: '5 years',
        security_measures: 'Standard security measures applied',
        data_controller: 'Test Controller',
      }

      const result = dataProcessingActivitySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('accepts all valid legal basis values', () => {
      const legalBasisValues = ['CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'VITAL_INTEREST', 'PUBLIC_TASK', 'LEGITIMATE_INTEREST'] as const

      legalBasisValues.forEach((legal_basis) => {
        const validData = {
          name: 'Test Activity',
          purpose: 'Testing purposes for validation',
          legal_basis,
          categories: ['Category 1'],
          retention_period: '5 years',
          security_measures: 'Standard security measures applied',
          data_controller: 'Test Controller',
        }

        const result = dataProcessingActivitySchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })

    it('accepts optional data_processor', () => {
      const validData = {
        name: 'Test Activity',
        purpose: 'Testing purposes for validation',
        legal_basis: 'CONSENT' as const,
        categories: ['Category 1'],
        retention_period: '5 years',
        security_measures: 'Standard security measures applied',
        data_controller: 'Test Controller',
        data_processor: 'Test Processor',
      }

      const result = dataProcessingActivitySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
