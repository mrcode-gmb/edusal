export interface HealthResponse {
  status: string;
  service: string;
  database: string;
  pgvector: string;
  message: string;
}

export type InstitutionType =
  | 'University (Federal/State)'
  | 'Private University'
  | 'Polytechnic (NBTE)'
  | 'College of Education (NCCE)'
  | 'Other Tertiary Institution';

export interface BookingFormData {
  institutionName: string;
  institutionType: InstitutionType;
  fullName: string;
  workEmail: string;
  phoneNumber: string;
  role: string;
  estimatedStudents: string;
  primaryGoal: string;
  notes: string;
}

export interface WorkspaceRole {
  id: 'student' | 'counsellor' | 'admin' | 'employer';
  title: string;
  tagline: string;
  description: string;
  metrics: { label: string; value: string; hint: string }[];
  evidenceTrail: { step: string; status: 'verified' | 'pending' | 'active'; by: string; time: string }[];
  sampleView: {
    heading: string;
    subtext: string;
    actionLabel: string;
    badge: string;
  };
}
