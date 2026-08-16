import { useState, useEffect, useCallback, type FC, type FormEvent } from 'react';
import type { InstitutionStaff, AcademicDivision, Department } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  Group as GroupIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Mail as MailIcon,
  Shield as ShieldIcon,
  Verified as VerifiedIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { Panel, PageHead, StatCard } from './Shared';

interface StaffDirectoryProps {
  institutionId: string;
  institutionName: string;
  tierTwoTerm: string;
}

const roleFilters = [
  'All Roles',
  'COUNSELLOR',
  'HOD',
  'DEAN',
  'DIRECTOR_CAREER_SERVICES',
  'SUPERADMIN',
];

export const StaffDirectory: FC<StaffDirectoryProps> = ({
  institutionId,
  institutionName,
  tierTwoTerm,
}) => {
  const [staffList, setStaffList] = useState<InstitutionStaff[]>([]);
  const [divisions, setDivisions] = useState<AcademicDivision[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All Roles');

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

  const filtered = staffList.filter(
    (st) => roleFilter === 'All Roles' || st.role === roleFilter,
  );

  const activeCount = staffList.length;
  const counsellorCount = staffList.filter((st) => st.role === 'COUNSELLOR').length;
  const hodCount = staffList.filter((st) => st.role === 'HOD').length;

  return (
    <div>
      <PageHead
        eyebrow="Governance & Evaluation Caseload"
        title="Staff & Evaluators"
        sub={`Faculty evaluators, deans & counsellors assigned for ${institutionName}.`}
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => setShowModal(true)}
          >
            Add Staff Member
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={GroupIcon}
          value={activeCount}
          label="Active Staff"
          sub="Assigned evaluator accounts"
          chip="Institutional"
        />
        <StatCard
          icon={ShieldIcon}
          value={counsellorCount}
          label="Career Counsellors & Evaluators"
          sub="Milestone sign-off authority"
        />
        <StatCard
          icon={VerifiedIcon}
          value={hodCount}
          label="Head of Departments"
          sub="Programme-level oversight"
        />
      </div>

      <Panel className="mt-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-charcoal">Staff Directory</h3>
            <p className="mt-0.5 text-sm text-charcoal-faint">
              {filtered.length} of {staffList.length} staff shown
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {roleFilters.map((rf) => (
              <button
                key={rf}
                type="button"
                onClick={() => setRoleFilter(rf)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  roleFilter === rf
                    ? 'bg-primary text-white'
                    : 'bg-bgsoft text-charcoal-faint hover:bg-primary-soft'
                }`}
              >
                {rf === 'All Roles' ? 'All Roles' : rf}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LinearProgress sx={{ borderRadius: 99, height: 6 }} />
        ) : staffList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <GroupIcon sx={{ fontSize: 40, color: 'charcoal.faint' }} />
            <p className="text-sm text-charcoal-faint">No staff accounts assigned yet.</p>
            <Button
              variant="outlined"
              color="inherit"
              size="medium"
              startIcon={<AddIcon />}
              onClick={() => setShowModal(true)}
              sx={{ color: 'primary.main', borderColor: 'primary.main' }}
            >
              Assign First Staff Member
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wide text-charcoal-faint">
                  <th className="pb-3 pr-4">Staff Name & Email</th>
                  <th className="pb-3 pr-4">Institutional Role</th>
                  <th className="pb-3 pr-4">Assigned {tierTwoTerm} / Dept</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Assigned Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((st) => (
                  <tr key={st.id}>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                          {(st.user_name || st.user_email).slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-charcoal">
                            {st.user_name || 'Staff Member'}
                          </p>
                          <p className="text-xs text-charcoal-faint">{st.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <Chip
                        label={st.role_display}
                        size="medium"
                        sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
                      />
                      {st.title && (
                        <p className="mt-1 text-xs font-semibold text-charcoal-soft">{st.title}</p>
                      )}
                    </td>
                    <td className="py-3.5 pr-4">
                      {st.division_name && (
                        <p className="text-sm font-semibold text-charcoal">{st.division_name}</p>
                      )}
                      {st.department_name && (
                        <p className="text-xs text-charcoal-faint">Dept: {st.department_name}</p>
                      )}
                      {!st.division_name && !st.department_name && (
                        <span className="text-xs font-semibold text-charcoal-faint">
                          Institution-Wide
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                        <VerifiedIcon sx={{ fontSize: 14 }} /> Active
                      </span>
                    </td>
                    <td className="py-3.5 text-xs text-charcoal-faint">
                      {new Date(st.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        slotProps={{ paper: { sx: { borderRadius: '15px', maxWidth: 560 } } }}
      >
        <DialogTitle
          sx={{
            p: 3,
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <span className="flex items-center gap-2 text-base font-bold text-charcoal">
            <ShieldIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            Assign Institutional Staff / Evaluator
          </span>
          <IconButton size="medium" onClick={() => setShowModal(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 1 }}>
          <form onSubmit={handleCreateStaff} className="space-y-5">
            <TextField
              fullWidth
              size="medium"
              label="Staff Full Name & Academic Title"
              required
              placeholder="e.g. Dr. Aminu Adebayo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <br /> <br />
            <TextField
              fullWidth
              size="medium"
              label="Institutional Email (Login Identifier)"
              required
              type="email"
              placeholder="e.g. adebayo@futminna.edu.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <MailIcon sx={{ fontSize: 18, mr: 1, color: 'charcoal.faint' }} />
                  ),
                },
              }}
            />
            <br /> <br />
            <p className="-mt-2 text-xs text-charcoal-faint">
              Default login password for new accounts is <strong>1234!@#$</strong>
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                fullWidth
                size="medium"
                select
                label="Institutional Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="COUNSELLOR">Career Counsellor & Evaluator</MenuItem>
                <MenuItem value="HOD">Head of Department (HOD)</MenuItem>
                <MenuItem value="DEAN">Dean of {tierTwoTerm}</MenuItem>
                <MenuItem value="DIRECTOR_CAREER_SERVICES">
                  Director of Career Services
                </MenuItem>
                <MenuItem value="SUPERADMIN">Institution Superadmin</MenuItem>
              </TextField>
              <TextField
                fullWidth
                size="medium"
                label="Official Position Title"
                placeholder="e.g. SIWES Coordinator"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                fullWidth
                size="medium"
                select
                label={`Academic ${tierTwoTerm}`}
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setSelectedDepartment('');
                }}
              >
                <MenuItem value="">All / Institution-Wide</MenuItem>
                {divisions.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                size="medium"
                select
                label="Department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments
                  .filter((dept) => !selectedDivision || dept.division === selectedDivision)
                  .map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
              </TextField>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setShowModal(false)}
                sx={{ color: 'charcoal.soft', borderColor: 'border.strong' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Assigning...' : 'Assign Staff Member'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};