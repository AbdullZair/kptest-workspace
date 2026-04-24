export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'archived';
  careTeam: CareTeamMember[];
  goals: string[];
  patientCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CareTeamMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone?: string;
}

export interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'completed' | 'archived';
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  goals: string[];
  careTeam: {
    id: string;
    role: string;
  }[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  endDate?: string;
  status?: 'active' | 'completed' | 'archived';
  goals?: string[];
}

export interface ProjectPatient {
  id: string;
  firstName: string;
  lastName: string;
  pesel: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'discharged';
}

export interface ProjectPatientsResponse {
  patients: ProjectPatient[];
  total: number;
}
