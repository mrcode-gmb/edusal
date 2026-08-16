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
};
