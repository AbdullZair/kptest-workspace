export { projectApi } from './api/projectApi';
export {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectPatientsQuery,
  useAddPatientToProjectMutation,
  useRemovePatientFromProjectMutation,
  useSearchProjectsQuery,
} from './api/projectApi';
export type {
  Project,
  CareTeamMember,
  ProjectListParams,
  ProjectListResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectPatient,
  ProjectPatientsResponse,
} from './api/types';
