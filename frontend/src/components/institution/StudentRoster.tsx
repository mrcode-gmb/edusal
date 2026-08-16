import { useState, useEffect, type FC } from 'react';
import type { StudentProfile, InstitutionHierarchyTree, AcademicSession } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { AddStudentModal } from './AddStudentModal';
import {
  GraduationCapIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  RefreshCwIcon,
  BookOpenIcon,
  BriefcaseIcon,
} from '../icons';

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
    <div className="student-roster-container">
      {/* Header & KPI Summary */}
      <div className="roster-header-card">
        <div className="roster-header-info">
          <div className="roster-badge-row">
            <span className="roster-tag">Hierarchical Student Identity</span>
            <span className="roster-count-pill">{totalStudents} Enrolled Students</span>
          </div>
          <h3 className="roster-title">Student Directory & Academic Cohorts</h3>
          <p className="roster-sub">
            All students are hierarchically enrolled in degree programmes at <strong>{institutionName}</strong> with dynamic level progression.
          </p>
        </div>

        <div className="roster-actions">
          <button
            type="button"
            className="btn btn-outline-sm"
            onClick={loadStudents}
            title="Refresh student roster"
          >
            <RefreshCwIcon size={14} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <PlusIcon size={16} /> Register Student
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="roster-kpi-grid">
        <div className="roster-kpi-card">
          <div className="kpi-icon-box bg-blue">
            <GraduationCapIcon size={20} color="#0284c7" />
          </div>
          <div className="kpi-data">
            <span className="kpi-num">{totalStudents}</span>
            <span className="kpi-label">Active Student Records</span>
          </div>
        </div>

        <div className="roster-kpi-card">
          <div className="kpi-icon-box bg-amber">
            <BriefcaseIcon size={20} color="#d97706" />
          </div>
          <div className="kpi-data">
            <span className="kpi-num">{siwesQualifying}</span>
            <span className="kpi-label">SIWES Eligible Candidates</span>
          </div>
        </div>

        <div className="roster-kpi-card">
          <div className="kpi-icon-box bg-emerald">
            <BookOpenIcon size={20} color="#059669" />
          </div>
          <div className="kpi-data">
            <span className="kpi-num">{finalYearCount}</span>
            <span className="kpi-label">Final Year Graduating Cohorts</span>
          </div>
        </div>

        <div className="roster-kpi-card">
          <div className="kpi-icon-box bg-indigo">
            <ShieldCheckIcon size={20} color="#6366f1" />
          </div>
          <div className="kpi-data">
            <span className="kpi-num">{verifiedCount}</span>
            <span className="kpi-label">Admissions Ledger Verified</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="roster-filter-bar">
        <div className="roster-search-box">
          <SearchIcon size={15} color="#64748b" />
          <input
            type="text"
            placeholder="Search by matric number, student name, email, or program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="roster-filter-controls">
          <div className="dept-select-wrap">
            <label>Department:</label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
            >
              <option value="ALL">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="year-pills-wrap">
            <label>Year of Study:</label>
            <div className="year-pill-group">
              <button
                type="button"
                className={`year-pill ${selectedYear === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedYear('ALL')}
              >
                All
              </button>
              {[1, 2, 3, 4, 5].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  className={`year-pill ${selectedYear === yr ? 'active' : ''}`}
                  onClick={() => setSelectedYear(yr)}
                >
                  Yr {yr} ({yr * 100}L)
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="roster-table-card">
        {loading ? (
          <div className="roster-loading-state">
            <RefreshCwIcon size={24} color="#0284c7" />
            <p>Loading student cohort records...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="roster-empty-state">
            <GraduationCapIcon size={36} color="#94a3b8" />
            <h4>No Student Records Found</h4>
            <p>No students match your filter criteria or have been registered into this unit yet.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <PlusIcon size={15} /> Register First Student
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Matriculation Number</th>
                  <th>Student Profile</th>
                  <th>Department & Programme (Tier 4)</th>
                  <th>Dynamic Level</th>
                  <th>Entry Mode</th>
                  <th>SIWES Clearance</th>
                  <th>CGPA</th>
                  <th>Admissions Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((std) => (
                  <tr key={std.id} className="student-row">
                    <td>
                      <code className="matric-badge">{std.matric_number}</code>
                      {std.jamb_reg_number && (
                        <span className="jamb-sub-badge">JAMB: {std.jamb_reg_number}</span>
                      )}
                    </td>

                    <td>
                      <div className="student-name-block">
                        <span className="std-full-name">{std.user_name || 'Student User'}</span>
                        <span className="std-email">{std.user_email}</span>
                      </div>
                    </td>

                    <td>
                      <div className="std-program-block">
                        <span className="std-prog-name">{std.program_name}</span>
                        <span className="std-dept-tag">
                          {std.department_name} · <strong>{std.program_duration_years} Years</strong>
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`level-badge-pill ${
                          std.is_final_year
                            ? 'level-final'
                            : std.is_siwes_year
                            ? 'level-siwes'
                            : 'level-standard'
                        }`}
                      >
                        {std.level_display}
                      </span>
                    </td>

                    <td>
                      <span className="entry-mode-tag">{std.entry_mode_display}</span>
                    </td>

                    <td>
                      <span
                        className={`siwes-status-pill status-${std.siwes_clearance_status.toLowerCase()}`}
                      >
                        {std.siwes_clearance_status_display}
                      </span>
                    </td>

                    <td>
                      <span className="cgpa-pill">
                        {std.cgpa !== null && std.cgpa !== undefined ? Number(std.cgpa).toFixed(2) : '—'}
                      </span>
                    </td>

                    <td>
                      {std.is_verified_student ? (
                        <span className="verified-status-tag">
                          <CheckCircleIcon size={13} color="#059669" /> Verified
                        </span>
                      ) : (
                        <span className="pending-status-tag">Unverified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        institutionId={institutionId}
        tree={tree}
        sessions={sessions}
        authToken={authToken}
        onSubmit={handleStudentCreated}
      />
    </div>
  );
};
