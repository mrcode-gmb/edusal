import { useState, useEffect, useCallback, type FC, type FormEvent } from 'react';
import type { InstitutionStaff, AcademicDivision, Department } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  UsersIcon,
  PlusIcon,
  MailIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from '../icons';

interface StaffDirectoryProps {
  institutionId: string;
  institutionName: string;
  tierTwoTerm: string;
}

export const StaffDirectory: FC<StaffDirectoryProps> = ({
  institutionId,
  institutionName,
  tierTwoTerm,
}) => {
  const [staffList, setStaffList] = useState<InstitutionStaff[]>([]);
  const [divisions, setDivisions] = useState<AcademicDivision[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Staff Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('COUNSELLOR');
  const [title, setTitle] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!institutionId) return;
    setLoading(true);
    try {
      const [staffData, divData, deptData] = await Promise.all([
        institutionApi.getStaff(institutionId),
        institutionApi.getDivisions(institutionId),
        institutionApi.getDepartments(institutionId),
      ]);
      setStaffList(staffData);
      setDivisions(divData);
      setDepartments(deptData);
    } catch (err) {
      console.error('Failed to load staff directory:', err);
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateStaff = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    setIsSubmitting(true);
    try {
      await institutionApi.createStaff({
        institution: institutionId,
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role,
        title: title.trim(),
        division: selectedDivision || undefined,
        department: selectedDepartment || undefined,
      });
      setShowModal(false);
      setName('');
      setEmail('');
      setTitle('');
      setSelectedDivision('');
      setSelectedDepartment('');
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to assign staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="staff-directory-container">
      {/* Header */}
      <div className="staff-header-card">
        <div className="staff-header-info">
          <div className="staff-badge-row">
            <span className="staff-tag">Governance & Evaluation Caseload</span>
            <span className="staff-count-pill">{staffList.length} Active Staff</span>
          </div>
          <h3 className="staff-title">Faculty Evaluators, Deans & Counsellors</h3>
          <p className="staff-sub">
            Staff directory and assigned milestone evaluator roles for <strong>{institutionName}</strong>.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary-sm"
          onClick={() => setShowModal(true)}
        >
          <PlusIcon size={16} /> Add Staff Member
        </button>
      </div>

      {/* Staff List Table */}
      <div className="staff-table-card">
        {loading ? (
          <div className="staff-loading">Loading staff roster...</div>
        ) : staffList.length === 0 ? (
          <div className="staff-empty">
            <UsersIcon size={32} color="#94a3b8" />
            <p>No staff accounts assigned yet.</p>
            <button
              type="button"
              className="btn btn-secondary-sm"
              onClick={() => setShowModal(true)}
            >
              Assign First Staff Member
            </button>
          </div>
        ) : (
          <table className="custom-data-table">
            <thead>
              <tr>
                <th>Staff Name & Email</th>
                <th>Institutional Role</th>
                <th>Assigned {tierTwoTerm} / Dept</th>
                <th>Status</th>
                <th>Assigned Date</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((st) => (
                <tr key={st.id}>
                  <td>
                    <div className="staff-user-cell">
                      <div className="staff-avatar">
                        {(st.user_name || st.user_email).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <strong className="staff-name">{st.user_name || 'Staff Member'}</strong>
                        <span className="staff-email">{st.user_email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${st.role.toLowerCase()}`}>
                      {st.role_display}
                    </span>
                    {st.title && <span className="staff-custom-title">{st.title}</span>}
                  </td>
                  <td>
                    <div className="assigned-unit-block">
                      {st.division_name && (
                        <span className="unit-div">{st.division_name}</span>
                      )}
                      {st.department_name && (
                        <span className="unit-dept">Dept: {st.department_name}</span>
                      )}
                      {!st.division_name && !st.department_name && (
                        <span className="unit-all">Institution-Wide</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="badge-active">
                      <CheckCircleIcon size={13} color="#059669" /> Active
                    </span>
                  </td>
                  <td>
                    <span className="table-date">
                      {new Date(st.created_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <ShieldCheckIcon size={20} color="#0284c7" />
                <h3>Assign Institutional Staff / Evaluator</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="modal-form">
              <div className="form-group">
                <label>Staff Full Name & Academic Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Aminu Adebayo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Institutional Email (Login Identifier)</label>
                <div className="input-with-icon">
                  <MailIcon size={16} className="input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. adebayo@futminna.edu.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <span className="form-hint">
                  Default login password for new accounts is <strong>1234!@#$</strong>
                </span>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Institutional Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="COUNSELLOR">Career Counsellor & Evaluator</option>
                    <option value="HOD">Head of Department (HOD)</option>
                    <option value="DEAN">Dean of {tierTwoTerm}</option>
                    <option value="DIRECTOR_CAREER_SERVICES">Director of Career Services</option>
                    <option value="SUPERADMIN">Institution Superadmin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Official Position Title</label>
                  <input
                    type="text"
                    placeholder="e.g. SIWES Coordinator"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Academic {tierTwoTerm}</label>
                  <select
                    value={selectedDivision}
                    onChange={(e) => {
                      setSelectedDivision(e.target.value);
                      setSelectedDepartment('');
                    }}
                  >
                    <option value="">All / Institution-Wide</option>
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments
                      .filter((dept) => !selectedDivision || dept.division === selectedDivision)
                      .map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
