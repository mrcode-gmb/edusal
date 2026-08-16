import { useState, useEffect, type FC } from 'react';
import type { StudentProfile, InstitutionHierarchyTree, AcademicSession } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { AddStudentModal } from './AddStudentModal';
import { GenerateCredentialModal } from './GenerateCredentialModal';
import { CounsellorDossierModal } from './CounsellorDossierModal';
import {
  Button,
  Chip,
  IconButton,
  MenuItem,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  School as GraduationCapIcon,
  Add as AddIcon,
  Search as SearchIcon,
  VerifiedUser as ShieldCheckIcon,
  Refresh as RefreshCwIcon,
  MenuBook as BookOpenIcon,
  WorkOutlineOutlined as BriefcaseIcon,
  Key as KeyIcon,
  Close as CloseIcon,
  Psychology as BrainIcon,
} from '@mui/icons-material';
import { PageHead, StatCard, Panel } from './Shared';

interface StudentRosterProps {
  institutionId: string;
  institutionName: string;
  tree: InstitutionHierarchyTree | null;
  sessions: AcademicSession[];
  authToken?: string | null;
}

export const StudentRoster: FC<StudentRosterProps> = ({
  institutionId,
  institutionName,
  tree,
  sessions,
  authToken,
}) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentForCreds, setSelectedStudentForCreds] = useState<StudentProfile | null>(null);
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<string | null>(null);


  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await institutionApi.getStudents(
        {
          institution: institutionId,
          department: selectedDeptId !== 'ALL' ? selectedDeptId : undefined,
          year_of_study: selectedYear !== 'ALL' ? selectedYear : undefined,
          search: searchQuery.trim() || undefined,
        },
        authToken || undefined
      );
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [institutionId, selectedDeptId, selectedYear, searchQuery]);

  // Extract departments for filter dropdown
  const departments: Array<{ id: string; name: string }> = [];
  if (tree) {
    tree.divisions.forEach((div) => {
      div.departments.forEach((dept) => {
        departments.push({ id: dept.id, name: dept.name });
      });
    });
  }

  // Metrics
  const totalStudents = students.length;
  const siwesQualifying = students.filter((s) => s.siwes_clearance_status === 'QUALIFYING' || s.is_siwes_year).length;
  const finalYearCount = students.filter((s) => s.is_final_year).length;
  const verifiedCount = students.filter((s) => s.is_verified_student).length;

  const handleStudentCreated = async (data: any) => {
    await institutionApi.createStudent(data, authToken || undefined);
    await loadStudents();
  };

  return (
    <div>
      <PageHead
        eyebrow="Hierarchical Student Identity"
        title="Student Directory & Academic Cohorts"
        sub={`All students are hierarchically enrolled in degree programmes at ${institutionName} with dynamic level progression.`}
        actions={
          <>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RefreshCwIcon />}
              onClick={loadStudents}
              sx={{ color: 'charcoal.soft', borderColor: 'border.strong' }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowAddModal(true)}
            >
              Register Student
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={GraduationCapIcon}
          value={totalStudents}
          label="Active Student Records"
          sub="Enrolled this session"
        />
        <StatCard
          icon={BriefcaseIcon}
          value={siwesQualifying}
          label="SIWES Eligible Candidates"
          sub="Qualifying / attachment year"
        />
        <StatCard
          icon={BookOpenIcon}
          value={finalYearCount}
          label="Final Year Graduating Cohorts"
          sub="Dynamic level progression"
        />
        <StatCard
          icon={ShieldCheckIcon}
          value={verifiedCount}
          label="Admissions Ledger Verified"
          sub="Verified student records"
        />
      </div>

      <Panel className="mt-4">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <TextField
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by matric number, student name, email, or program..."
            className="lg:w-96"
            slotProps={{
              input: {
                startAdornment: (
                  <SearchIcon sx={{ fontSize: 18, mr: 1, color: 'charcoal.faint' }} />
                ),
                endAdornment: searchQuery ? (
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                ) : undefined,
              },
            }}
          />

          <div className="flex flex-wrap items-center gap-4">
            <TextField
              size="small"
              select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="ALL">All Departments ({departments.length})</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-charcoal-faint">Year:</span>
              <button
                type="button"
                onClick={() => setSelectedYear('ALL')}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  selectedYear === 'ALL'
                    ? 'bg-primary text-white'
                    : 'bg-bgsoft text-charcoal-faint hover:bg-primary-soft'
                }`}
              >
                All
              </button>
              {[1, 2, 3, 4, 5].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                    selectedYear === yr
                      ? 'bg-primary text-white'
                      : 'bg-bgsoft text-charcoal-faint hover:bg-primary-soft'
                  }`}
                >
                  Yr {yr} ({yr * 100}L)
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <LinearProgress sx={{ borderRadius: 99, height: 6 }} />
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <GraduationCapIcon sx={{ fontSize: 40, color: 'charcoal.faint' }} />
            <h4 className="text-base font-bold text-charcoal">No Student Records Found</h4>
            <p className="max-w-sm text-sm text-charcoal-faint">
              No students match your filter criteria or have been registered into this unit yet.
            </p>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => setShowAddModal(true)}
              sx={{ color: 'primary.main', borderColor: 'primary.main' }}
            >
              Register First Student
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wide text-charcoal-faint">
                  <th className="pb-3 pr-4">Matriculation Number</th>
                  <th className="pb-3 pr-4">Student Profile</th>
                  <th className="pb-3 pr-4">Department & Programme</th>
                  <th className="pb-3 pr-4">Dynamic Level</th>
                  <th className="pb-3 pr-4">Active Pathway</th>
                  <th className="pb-3 pr-4">Employability</th>
                  <th className="pb-3 pr-4">SIWES Clearance</th>
                  <th className="pb-3 pr-4">CGPA</th>
                  <th className="pb-3">Portal Account</th>
                </tr>
              </thead>
              <tbody>
                {students.map((std) => (
                  <tr key={std.id}>
                    <td className="py-3.5 pr-4">
                      <code className="rounded bg-primary-soft px-1.5 py-0.5 font-mono text-xs font-bold text-primary">
                        {std.matric_number}
                      </code>
                      {std.jamb_reg_number && (
                        <p className="mt-1 text-[11px] text-charcoal-faint">
                          JAMB: {std.jamb_reg_number}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 pr-4">
                      <p className="text-sm font-bold text-charcoal">{std.user_name || 'Student User'}</p>
                      <p className="text-xs text-charcoal-faint">{std.user_email}</p>
                    </td>
                    <td className="py-3.5 pr-4">
                      <p className="text-sm font-semibold text-charcoal">{std.program_name}</p>
                      <p className="text-xs text-charcoal-faint">
                        {std.department_name} · <strong>{std.program_duration_years} Years</strong>
                      </p>
                    </td>
                    <td className="py-3.5 pr-4">
                      <Chip
                        label={std.level_display}
                        size="small"
                        sx={{
                          bgcolor: std.is_final_year
                            ? 'charcoal'
                            : std.is_siwes_year
                              ? 'warning.light'
                              : 'primary.soft',
                          color: std.is_final_year ? '#fff' : std.is_siwes_year ? '#92400e' : 'primary.main',
                          fontWeight: 700,
                        }}
                      />
                    </td>
                    <td className="py-3.5 pr-4">
                      {std.active_pathway_title ? (
                        <span
                          className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary"
                          title={std.active_pathway_career_role || ''}
                        >
                          {std.active_pathway_title}
                        </span>
                      ) : (
                        <span className="text-xs text-charcoal-faint">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4">
                      <p className="text-sm font-extrabold text-charcoal">
                        {std.employability_score !== undefined && std.employability_score !== null
                          ? `${Number(std.employability_score).toFixed(1)}%`
                          : '0.0%'}
                      </p>
                      <p className="text-[11px] text-charcoal-faint">
                        {std.verified_points_total || 0} pts ({std.milestones_completed_count || 0} done)
                      </p>
                    </td>
                    <td className="py-3.5 pr-4">
                      <Chip
                        label={std.siwes_clearance_status_display}
                        size="small"
                        sx={{
                          bgcolor:
                            std.siwes_clearance_status === 'CLEARED'
                              ? 'primary.soft'
                              : std.siwes_clearance_status === 'QUALIFYING'
                                ? 'warning.light'
                                : 'action.hover',
                          color:
                            std.siwes_clearance_status === 'CLEARED'
                              ? 'primary.main'
                              : std.siwes_clearance_status === 'QUALIFYING'
                                ? '#92400e'
                                : 'text.secondary',
                          fontWeight: 700,
                        }}
                      />
                    </td>
                    <td className="py-3.5 pr-4 text-sm font-bold text-charcoal">
                      {std.cgpa !== null && std.cgpa !== undefined ? Number(std.cgpa).toFixed(2) : '—'}
                    </td>
<td className="py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outlined"
                          color="inherit"
                          size="small"
                          startIcon={<BrainIcon sx={{ fontSize: 14 }} />}
                          onClick={() => setSelectedStudentForDossier(std.id)}
                          title="View 360° student dossier, psychometric radar, and case notes"
                          sx={{ color: 'primary.main', borderColor: 'primary.main' }}
                        >
                          360° Dossier
                        </Button>
                        <Button
                          variant="outlined"
                          color="inherit"
                          size="small"
                          startIcon={<KeyIcon sx={{ fontSize: 14 }} />}
                          onClick={() => setSelectedStudentForCreds(std)}
                          title="Generate password and email credentials"
                          sx={{ color: 'charcoal.soft', borderColor: 'border.strong' }}
                        >
                          Email Password
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        institutionId={institutionId}
        tree={tree}
        sessions={sessions}
        authToken={authToken}
        onSubmit={handleStudentCreated}
      />

      {selectedStudentForCreds && (
        <GenerateCredentialModal
          isOpen={!!selectedStudentForCreds}
          onClose={() => setSelectedStudentForCreds(null)}
          student={selectedStudentForCreds}
          authToken={authToken}
          onSuccess={loadStudents}
        />
      )}

      {/* 360 Student Dossier Modal */}
      {selectedStudentForDossier && (
        <CounsellorDossierModal
          studentId={selectedStudentForDossier}
          authToken={authToken || undefined}
          onClose={() => setSelectedStudentForDossier(null)}
        />
      )}
    </div>
  );
};