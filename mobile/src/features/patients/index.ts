export { patientApi } from './api/patientApi';
export {
  useGetPatientsQuery,
  useGetPatientQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useGetPatientProjectsQuery,
  useSearchPatientsQuery,
} from './api/patientApi';
export type {
  Patient,
  ProjectSummary,
  PatientListParams,
  PatientListResponse,
  CreatePatientRequest,
  UpdatePatientRequest,
} from './api/types';
