import type {
  InstitutionSummary,
  InstitutionHierarchyTree,
  GovernanceSummary,
  AcademicDivision,
  Department,
  AcademicProgram,
  AcademicSession,
  InstitutionalDocument,
  DocumentSearchResponse,
} from '../types/institution';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export const institutionApi = {
  // Institutions List & Summary
  async getInstitutions(params?: Record<string, string>): Promise<InstitutionSummary[]> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${API_BASE}/api/institutions/${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch institutions`);
    return res.json();
  },

  // 4-Tier Hierarchy Tree
  async getInstitutionTree(id: string): Promise<InstitutionHierarchyTree> {
    const res = await fetch(`${API_BASE}/api/institutions/${id}/tree/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch institution tree`);
    return res.json();
  },

  // Governance Metrics & Executive Summary
  async getGovernanceSummary(id: string): Promise<GovernanceSummary> {
    const res = await fetch(`${API_BASE}/api/institutions/${id}/governance-summary/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch governance summary`);
    return res.json();
  },

  // Document Citation Search
  async searchDocuments(
    institutionId: string,
    query: string,
    topK: number = 5,
    docType?: string
  ): Promise<DocumentSearchResponse> {
    const payload: { query: string; top_k: number; doc_type?: string } = {
      query,
      top_k: topK,
    };
    if (docType) payload.doc_type = docType;

    const res = await fetch(`${API_BASE}/api/institutions/${institutionId}/search-documents/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Document search failed`);
    return res.json();
  },

  // Divisions CRUD
  async getDivisions(institutionId: string): Promise<AcademicDivision[]> {
    const res = await fetch(`${API_BASE}/api/divisions/?institution=${institutionId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch divisions`);
    return res.json();
  },

  async createDivision(data: {
    institution: string;
    name: string;
    code: string;
    division_type: 'FACULTY' | 'SCHOOL' | 'COLLEGE';
    dean_name?: string;
    dean_email?: string;
  }): Promise<AcademicDivision> {
    const res = await fetch(`${API_BASE}/api/divisions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to create division`);
    return res.json();
  },

  // Departments CRUD
  async getDepartments(institutionId: string, divisionId?: string): Promise<Department[]> {
    let url = `${API_BASE}/api/departments/?institution=${institutionId}`;
    if (divisionId) url += `&division=${divisionId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch departments`);
    return res.json();
  },

  async createDepartment(data: {
    institution: string;
    division: string;
    name: string;
    code: string;
    hod_name?: string;
    hod_email?: string;
    siwes_eligible: boolean;
  }): Promise<Department> {
    const res = await fetch(`${API_BASE}/api/departments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to create department`);
    return res.json();
  },

  // Programs CRUD
  async getPrograms(institutionId: string, departmentId?: string): Promise<AcademicProgram[]> {
    let url = `${API_BASE}/api/programs/?institution=${institutionId}`;
    if (departmentId) url += `&department=${departmentId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch programs`);
    return res.json();
  },

  async createProgram(data: {
    institution: string;
    department: string;
    name: string;
    program_code: string;
    award_level: string;
    duration_years: number;
    siwes_duration_months: number;
  }): Promise<AcademicProgram> {
    const res = await fetch(`${API_BASE}/api/programs/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to create program`);
    return res.json();
  },

  // Sessions CRUD
  async getSessions(institutionId: string): Promise<AcademicSession[]> {
    const res = await fetch(`${API_BASE}/api/sessions/?institution=${institutionId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch sessions`);
    return res.json();
  },

  // Documents CRUD & Text Ingestion
  async getDocuments(institutionId: string): Promise<InstitutionalDocument[]> {
    const res = await fetch(`${API_BASE}/api/documents/?institution=${institutionId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch documents`);
    return res.json();
  },

  async createDocument(data: {
    institution: string;
    title: string;
    doc_type: string;
    raw_text: string;
  }): Promise<InstitutionalDocument> {
    const res = await fetch(`${API_BASE}/api/documents/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to create document`);
    return res.json();
  },

  async ingestDocumentText(documentId: string, rawText: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/documents/${documentId}/ingest-text/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_text: rawText }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Ingestion failed`);
  },

  async uploadDocumentFile(
    formData: FormData,
    token?: string
  ): Promise<InstitutionalDocument> {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Token ${token}`;

    const res = await fetch(`${API_BASE}/api/documents/upload/`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}: Failed to upload document`);
    }
    const data = await res.json();
    return data.document || data;
  },

  async askAdvisor(
    institutionId: string,
    payload: {
      query: string;
      division?: string;
      department?: string;
      session?: string;
      doc_type?: string;
      top_k?: number;
    },
    token?: string
  ): Promise<import('../types/institution').AIAdvisorResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers.Authorization = `Token ${token}`;

    const res = await fetch(`${API_BASE}/api/institutions/${institutionId}/ask-advisor/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}: Advisor query failed`);
    }
    return res.json();
  },


  // Authentication Endpoints
  async login(email: string, password: string):Promise<import('../types/institution').LoginResponse> {
    const res = await fetch(`${API_BASE}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Login failed (HTTP ${res.status})`);
    }
    return res.json();
  },

  async getMe(token: string): Promise<import('../types/institution').AuthUser> {
    const res = await fetch(`${API_BASE}/api/auth/me/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to authenticate`);
    return res.json();
  },

  async logout(token: string): Promise<void> {
    await fetch(`${API_BASE}/api/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
    }).catch(() => {});
  },

  // Staff & Faculty Directory
  async getStaff(institutionId: string): Promise<import('../types/institution').InstitutionStaff[]> {
    const res = await fetch(`${API_BASE}/api/staff/?institution=${institutionId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch staff directory`);
    return res.json();
  },

  async createStaff(data: {
    institution: string;
    email: string;
    name: string;
    role: string;
    title?: string;
    division?: string;
    department?: string;
  }): Promise<import('../types/institution').InstitutionStaff> {
    const res = await fetch(`${API_BASE}/api/staff/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}: Failed to assign staff`);
    }
    return res.json();
  },

  // Scoped Staff Assignments
  async getStaffAssignments(params?: {
    institution?: string;
    division?: string;
    department?: string;
  }): Promise<import('../types/institution').StaffAssignment[]> {
    const query = new URLSearchParams();
    if (params?.institution) query.append('institution', params.institution);
    if (params?.division) query.append('division', params.division);
    if (params?.department) query.append('department', params.department);
    const res = await fetch(`${API_BASE}/api/staff-assignments/?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch staff assignments`);
    return res.json();
  },

  async createStaffAssignment(data: {
    user: number;
    institution: string;
    division?: string;
    department?: string;
    role_at_unit: string;
    official_title?: string;
    assigned_years_of_study?: number[];
  }): Promise<import('../types/institution').StaffAssignment> {
    const res = await fetch(`${API_BASE}/api/staff-assignments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to create staff assignment`);
    return res.json();
  },

  async getMyCaseload(token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/staff-assignments/my-caseload/`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch caseload`);
    return res.json();
  },

  // Student Directory & Cohorts
  async getStudents(params?: {
    institution?: string;
    department?: string;
    program?: string;
    year_of_study?: number;
    search?: string;
  }, token?: string): Promise<import('../types/institution').StudentProfile[]> {
    const query = new URLSearchParams();
    if (params?.institution) query.append('institution', params.institution);
    if (params?.department) query.append('department', params.department);
    if (params?.program) query.append('program', params.program);
    if (params?.year_of_study) query.append('year_of_study', String(params.year_of_study));
    if (params?.search) query.append('search', params.search);

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Token ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/students/?${query.toString()}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch students`);
    return res.json();
  },

  async createStudent(data: {
    email: string;
    name: string;
    institution: string;
    program: string;
    matric_number: string;
    jamb_reg_number?: string;
    entry_session: string;
    entry_mode?: string;
    year_of_study?: number;
    cgpa?: number | null;
    phone_number?: string;
  }, token?: string): Promise<import('../types/institution').StudentProfile> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Token ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/students/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.error || `HTTP ${res.status}: Failed to register student`);
    }
    return res.json();
  },

  // Pathways & Blueprint Templates
  async getPathways(
    params: {
      institution?: string;
      program?: string;
      department?: string;
      division?: string;
      is_template?: boolean;
      search?: string;
    },
    token?: string
  ): Promise<import('../types/institution').Pathway[]> {
    const query = new URLSearchParams();
    if (params.institution) query.append('institution', params.institution);
    if (params.program) query.append('program', params.program);
    if (params.department) query.append('department', params.department);
    if (params.division) query.append('division', params.division);
    if (params.is_template !== undefined) query.append('is_template', String(params.is_template));
    if (params.search) query.append('search', params.search);

    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Token ${token}`;

    const res = await fetch(`${API_BASE}/api/pathways/?${query.toString()}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch pathways`);
    return res.json();
  },

  async getPathwayDetail(
    pathwayId: string,
    token?: string
  ): Promise<import('../types/institution').Pathway> {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Token ${token}`;

    const res = await fetch(`${API_BASE}/api/pathways/${pathwayId}/`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch pathway detail`);
    return res.json();
  },

  async createPathway(
    payload: import('../types/institution').PathwayCreatePayload,
    token?: string
  ): Promise<import('../types/institution').Pathway> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Token ${token}`;

    const res = await fetch(`${API_BASE}/api/pathways/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.error || `HTTP ${res.status}: Failed to create pathway`);
    }
    return res.json();
  },

  async clonePathway(
    pathwayId: string,
    payload: import('../types/institution').PathwayClonePayload,
    token?: string
  ): Promise<import('../types/institution').Pathway> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Token ${token}`;

    const res = await fetch(`${API_BASE}/api/pathways/${pathwayId}/clone/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.error || `HTTP ${res.status}: Failed to clone template`);
    }
    return res.json();
  },

  async publishPathwayTemplate(
    pathwayId: string,
    visibility = 'INSTITUTION',
    token?: string
  ): Promise<import('../types/institution').Pathway> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Token ${token}`;

    const res = await fetch(`${API_BASE}/api/pathways/${pathwayId}/publish-as-template/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ visibility }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to publish template`);
    return res.json();
  },

  async getTemplateBlueprints(
    awardLevel?: string,
    token?: string
  ): Promise<import('../types/institution').Pathway[]> {
    const query = new URLSearchParams();
    if (awardLevel) query.append('award_level', awardLevel);

    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Token ${token}`;

    const res = await fetch(`${API_BASE}/api/pathways/templates/?${query.toString()}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch template blueprints`);
    return res.json();
  },

  // Milestones CRUD
  async createMilestone(
    payload: Partial<import('../types/institution').PathwayMilestone>,
    token?: string
  ): Promise<import('../types/institution').PathwayMilestone> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Token ${token}`;

    const res = await fetch(`${API_BASE}/api/milestones/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.error || `HTTP ${res.status}: Failed to create milestone`);
    }
    return res.json();
  },

  async updateMilestone(
    milestoneId: string,
    payload: Partial<import('../types/institution').PathwayMilestone>,
    token?: string
  ): Promise<import('../types/institution').PathwayMilestone> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Token ${token}`;

    const res = await fetch(`${API_BASE}/api/milestones/${milestoneId}/`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update milestone`);
    return res.json();
  },

  async deleteMilestone(
    milestoneId: string,
    token?: string
  ): Promise<void> {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Token ${token}`;

    const res = await fetch(`${API_BASE}/api/milestones/${milestoneId}/`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to delete milestone`);
  },
};



