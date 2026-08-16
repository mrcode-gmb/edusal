export type RegulatorType = 'NUC' | 'NBTE' | 'NCCE';
export type InstitutionType = 'UNIVERSITY' | 'POLYTECHNIC' | 'COLLEGE_OF_EDUCATION' | 'MONOTECHNIC';
export type TierTwoTerm = 'FACULTY' | 'SCHOOL' | 'COLLEGE';
export type AwardLevel = 'BSC' | 'BTECH' | 'BENG' | 'BA' | 'LLB' | 'ND' | 'HND' | 'NCE' | 'PGD' | 'MSC';
export type DocumentType = 'STUDENT_HANDBOOK' | 'SIWES_CALENDAR' | 'CURRICULUM_BMAS' | 'EMPLOYER_BRIEF' | 'POLICY';

export interface AcademicProgram {
  id: string;
  institution: string;
  department: string;
  department_name?: string;
  name: string;
  program_code: string;
  award_level: AwardLevel;
  award_level_display?: string;
  duration_years: number;
  siwes_duration_months: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  institution: string;
  institution_name?: string;
  division: string;
  division_name?: string;
  name: string;
  code: string;
  hod_name: string;
  hod_email: string;
  siwes_eligible: boolean;
  is_active: boolean;
  programs_count?: number;
  programs?: AcademicProgram[];
  created_at: string;
  updated_at: string;
}

export interface AcademicDivision {
  id: string;
  institution: string;
  institution_name?: string;
  name: string;
  code: string;
  division_type: 'FACULTY' | 'SCHOOL' | 'COLLEGE';
  division_type_display?: string;
  dean_name: string;
  dean_email: string;
  is_active: boolean;
  departments_count?: number;
  departments?: Department[];
  created_at: string;
  updated_at: string;
}

export interface AcademicSession {
  id: string;
  institution: string;
  session_label: string;
  start_date?: string;
  end_date?: string;
  current_semester: 'FIRST_SEMESTER' | 'SECOND_SEMESTER';
  current_semester_display?: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface InstitutionalDocumentChunk {
  id: string;
  document: string;
  chunk_index: number;
  page_number: number;
  section_reference: string;
  content: string;
  created_at: string;
}

export interface InstitutionalDocument {
  id: string;
  institution: string;
  division?: string;
  division_name?: string;
  department?: string;
  department_name?: string;
  title: string;
  doc_type: DocumentType;
  doc_type_display?: string;
  file_path: string;
  content_hash: string;
  chunk_count: number;
  embedding_status: 'PENDING' | 'INDEXED' | 'FAILED';
  embedding_status_display?: string;
  raw_text?: string;
  chunks?: InstitutionalDocumentChunk[];
  created_at: string;
  updated_at: string;
}

export interface InstitutionSummary {
  id: string;
  name: string;
  short_name: string;
  slug: string;
  institution_type: InstitutionType;
  institution_type_display: string;
  ownership: string;
  regulator: RegulatorType;
  regulator_display: string;
  tier_two_term: TierTwoTerm;
  state: string;
  is_founding_partner: boolean;
  status: string;
  divisions_count: number;
  departments_count: number;
  programs_count: number;
  documents_count: number;
  created_at: string;
}

export interface TreeProgram {
  id: string;
  name: string;
  program_code: string;
  award_level: AwardLevel;
  award_level_display: string;
  duration_years: number;
  siwes_duration_months: number;
}

export interface TreeDepartment {
  id: string;
  name: string;
  code: string;
  hod_name: string;
  siwes_eligible: boolean;
  programs: TreeProgram[];
}

export interface TreeDivision {
  id: string;
  name: string;
  code: string;
  division_type: string;
  dean_name: string;
  departments: TreeDepartment[];
}

export interface InstitutionHierarchyTree {
  id: string;
  name: string;
  short_name: string;
  regulator: RegulatorType;
  institution_type: InstitutionType;
  tier_two_term: TierTwoTerm;
  divisions_count: number;
  divisions: TreeDivision[];
}

export interface GovernanceSummary {
  institution: {
    id: string;
    name: string;
    short_name: string;
    regulator: RegulatorType;
    tier_two_term: TierTwoTerm;
    is_founding_partner: boolean;
  };
  hierarchy_metrics: {
    total_divisions: number;
    total_departments: number;
    total_programs: number;
    siwes_eligible_departments: number;
    siwes_eligibility_percentage: number;
  };
  knowledge_base: {
    total_documents: number;
    total_indexed_chunks: number;
    grounding_status: string;
  };
  active_session: {
    label: string;
    semester: string;
  };
  accreditation_readiness: {
    regulator: string;
    taxonomy_aligned: boolean;
    curriculum_mapped: boolean;
    handbook_ingested: boolean;
  };
}

export interface DocumentSearchResultItem {
  chunk_id: string;
  document_id: string;
  document_title: string;
  doc_type: string;
  doc_type_display: string;
  page_number: number;
  section_reference: string;
  content: string;
  relevance_score: number;
  citation: string;
}

export interface DocumentSearchResponse {
  query: string;
  institution_id: string;
  institution_name: string;
  total_matches: number;
  results: DocumentSearchResultItem[];
}

export type InstitutionRole =
  | 'SUPERADMIN'
  | 'DIRECTOR_CAREER_SERVICES'
  | 'DEAN'
  | 'HOD'
  | 'COUNSELLOR';

export interface InstitutionStaff {
  id: string;
  user: number;
  user_email: string;
  user_name: string;
  institution: string;
  institution_name: string;
  institution_short_name: string;
  division?: string;
  division_name?: string;
  department?: string;
  department_name?: string;
  role: InstitutionRole;
  role_display: string;
  title?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  staff_profile: InstitutionStaff | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

