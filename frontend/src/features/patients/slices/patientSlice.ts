import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Patient, PatientTableFilters } from '../types'
import { patientApiSlice } from '../api/patientApi'

/**
 * Patient state interface
 */
interface PatientState {
  selectedPatient: Patient | null
  filters: PatientTableFilters
  searchQuery: string
  isFormModalOpen: boolean
  editingPatientId: string | null
}

const initialState: PatientState = {
  selectedPatient: null,
  filters: {},
  searchQuery: '',
  isFormModalOpen: false,
  editingPatientId: null,
}

/**
 * Patient slice for managing patient-related state
 */
export const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    /**
     * Set selected patient
     */
    setSelectedPatient: (state, action: PayloadAction<Patient | null>) => {
      state.selectedPatient = action.payload
    },

    /**
     * Set table filters
     */
    setFilters: (state, action: PayloadAction<PatientTableFilters>) => {
      state.filters = action.payload
    },

    /**
     * Update single filter
     */
    updateFilter: (
      state,
      action: PayloadAction<{ key: keyof PatientTableFilters; value: unknown }>
    ) => {
      state.filters[action.payload.key] = action.payload.value as never
    },

    /**
     * Clear filters
     */
    clearFilters: (state) => {
      state.filters = {}
    },

    /**
     * Set search query
     */
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },

    /**
     * Open form modal for creating patient
     */
    openCreateModal: (state) => {
      state.isFormModalOpen = true
      state.editingPatientId = null
      state.selectedPatient = null
    },

    /**
     * Open form modal for editing patient
     */
    openEditModal: (state, action: PayloadAction<string>) => {
      state.isFormModalOpen = true
      state.editingPatientId = action.payload
    },

    /**
     * Close form modal
     */
    closeFormModal: (state) => {
      state.isFormModalOpen = false
      state.editingPatientId = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle get patient by ID
      .addMatcher(patientApiSlice.endpoints.getPatientById.matchFulfilled, (state, action) => {
        state.selectedPatient = action.payload
      })
      // Handle create patient
      .addMatcher(patientApiSlice.endpoints.createPatient.matchFulfilled, (state) => {
        state.isFormModalOpen = false
        state.editingPatientId = null
      })
      // Handle update patient
      .addMatcher(patientApiSlice.endpoints.updatePatient.matchFulfilled, (state) => {
        state.isFormModalOpen = false
        state.editingPatientId = null
      })
  },
})

/**
 * Export actions
 */
export const {
  setSelectedPatient,
  setFilters,
  updateFilter,
  clearFilters,
  setSearchQuery,
  openCreateModal,
  openEditModal,
  closeFormModal,
} = patientSlice.actions

/**
 * Export selectors
 */
export const selectSelectedPatient = (state: { patient: PatientState }) =>
  state.patient.selectedPatient
export const selectFilters = (state: { patient: PatientState }) => state.patient.filters
export const selectSearchQuery = (state: { patient: PatientState }) => state.patient.searchQuery
export const selectIsFormModalOpen = (state: { patient: PatientState }) =>
  state.patient.isFormModalOpen
export const selectEditingPatientId = (state: { patient: PatientState }) =>
  state.patient.editingPatientId

/**
 * Export reducer
 */
export const patientReducer = patientSlice.reducer

export default patientSlice
