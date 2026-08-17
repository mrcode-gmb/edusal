import { useState } from 'react'
import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  FormControl,
  MenuItem,
  Select,
  InputAdornment,
} from '@mui/material'
import {
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
  Lock as LockIcon,
  MoreVert as MoreVertIcon,
  Badge as BadgeIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Key as KeyIcon,
  Email as EmailIcon,
} from '@mui/icons-material'
import { Panel, PageHead, StatCard } from './Shared'

const RoleFilters = ['All', 'Superadmin', 'Faculty Evaluator', 'Department Evaluator', 'SIWES Coordinator']

const Staff = [
  {
    name: 'Prof. Mohammed Bashir',
    initials: 'PR',
    role: 'Institution Superadmin',
    scope: 'Federal University of Technology, Minna',
    permissions: ['Full governance', 'Audit pack', 'User management'],
    lastActive: 'Just now',
    status: 'Active',
  },
  {
    name: 'Dr. Amina Yusuf',
    initials: 'AY',
    role: 'Faculty Evaluator',
    scope: 'School of Engineering & Technology',
    permissions: ['Milestone sign-off', 'Rubric review'],
    lastActive: '2 hours ago',
    status: 'Active',
  },
  {
    name: 'Engr. Samuel Okafor',
    initials: 'SO',
    role: 'Department Evaluator',
    scope: 'Dept. of Mechanical Engineering',
    permissions: ['Milestone sign-off'],
    lastActive: 'Yesterday',
    status: 'Active',
  },
  {
    name: 'Mrs. Halima Bello',
    initials: 'HB',
    role: 'SIWES Coordinator',
    scope: 'Dept. of Computer Engineering',
    permissions: ['SIWES log', 'ITF cycle'],
    lastActive: '3 days ago',
    status: 'Active',
  },
  {
    name: 'Dr. Ngozi Eze',
    initials: 'NE',
    role: 'Department Evaluator',
    scope: 'Dept. of Electrical & Electronics',
    permissions: ['Milestone sign-off'],
    lastActive: '1 week ago',
    status: 'Invite Pending',
  },
]

const PermGroups = [
  { label: 'Full governance access', value: 'Superadmin' },
  { label: 'Sign-off + rubric rights', value: 'Evaluator' },
  { label: 'Read-only reviewers', value: 'Reviewer' },
]

export default function StaffEvaluators() {
  const [filter, setFilter] = useState('All')
  const [staffOpen, setStaffOpen] = useState(false)

  const rows =
    filter === 'All' ? Staff : Staff.filter((s) => s.role === filter)

  return (
    <div>
      <PageHead
        eyebrow="People & Permissions"
        title="Staff & Evaluators"
        sub="Named faculty evaluators with role-based access — every sign-off is locked to an individual."
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => setStaffOpen(true)}
          >
            Add Evaluator
          </Button>
        }
      />

      <AssignStaffModal open={staffOpen} onClose={() => setStaffOpen(false)} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={GroupIcon} value="5" label="Total Evaluators" sub="Across all mapped departments" />
        <StatCard icon={VerifiedIcon} value="4" label="Active" sub="Active this session" chip="Live" />
        <StatCard icon={ScheduleIcon} value="1" label="Invite Pending" sub="Awaiting activation" />
        <StatCard icon={LockIcon} value="3" label="Permission Groups" sub="Role-based access control" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {RoleFilters.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setFilter(r)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  filter === r
                    ? 'border-primary bg-primary text-white'
                    : 'border-line bg-white text-charcoal-soft hover:border-primary/40'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <TableContainer>
            <Table sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow sx={{ '& th': { borderColor: 'border.main', bgcolor: 'bgsoft' } }}>
                  <TableCell sx={{ fontWeight: 700, color: 'charcoal.soft' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'charcoal.soft' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'charcoal.soft' }}>Scope</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'charcoal.soft' }}>Status</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((s) => (
                  <TableRow
                    key={s.name}
                    sx={{ '&:hover': { bgcolor: 'bgsoft' }, '& td': { borderColor: 'border.main' } }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13, fontWeight: 800 }}
                        >
                          {s.initials}
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-charcoal">{s.name}</p>
                          <p className="text-[11px] text-charcoal-faint">{s.lastActive}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-semibold text-charcoal-soft">{s.role}</p>
                      <p className="text-[11px] text-charcoal-faint">
                        {s.permissions.join(' · ')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-charcoal-soft">{s.scope}</span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={s.status}
                        size="small"
                        sx={{
                          bgcolor: s.status === 'Active' ? 'primary.soft' : 'action.hover',
                          color: s.status === 'Active' ? 'primary.main' : 'text.secondary',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" aria-label="More actions">
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <p className="text-sm font-bold text-charcoal">Permission Groups</p>
            <p className="mt-1 text-xs text-charcoal-faint">
              Access is role-based; every read/write is logged to the audit trail.
            </p>
            <div className="mt-4 space-y-3">
              {PermGroups.map((g) => (
                <div key={g.label} className="flex items-center justify-between gap-3 rounded-[15px] bg-bgsoft px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{g.label}</p>
                    <p className="text-[11px] text-charcoal-faint">{g.value}</p>
                  </div>
                  <BadgeIcon sx={{ color: 'primary.main' }} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <p className="text-sm font-bold text-charcoal">Sign-off Accountability</p>
            <p className="mt-1 text-xs leading-relaxed text-charcoal-faint">
              Student milestone sign-offs are locked to named faculty evaluators
              and written to an immutable audit trail — supporting the Zero
              Unbacked Claims Policy.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-[15px] bg-primary-soft px-4 py-3">
              <VerifiedIcon sx={{ color: 'primary.main' }} />
              <p className="text-xs font-bold text-primary">Audit-ready by design</p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

const StaffRoles = [
  'Career Counsellor & Evaluator',
  'Faculty Evaluator',
  'Department Evaluator',
  'SIWES Coordinator',
  'Institution Superadmin',
]

const Schools = [
  'All / Institution-Wide',
  'School of Engineering & Technology',
  'School of Physical Sciences',
]

const Departments = [
  'All Departments',
  'Department of Mechanical Engineering',
  'Department of Computer Engineering',
  'Department of Electrical & Electronics Engineering',
]

const StaffInitial = {
  name: '',
  email: '',
  role: '',
  position: '',
  school: 'All / Institution-Wide',
  department: 'All Departments',
}

function AssignStaffModal({ open, onClose }) {
  const [form, setForm] = useState(StaffInitial)
  const [error, setError] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const inputProps = (k, label, placeholder) => ({
    label,
    placeholder,
    size: 'medium',
    fullWidth: true,
    value: form[k],
    onChange: update(k),
    error: error && !form[k],
    sx: { '& .MuiOutlinedInput-root': { borderRadius: '15px' } },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.role || !form.position) {
      setError(true)
      return
    }
    setError(false)
    setSubmitted(true)
  }

  const handleClose = () => {
    setSubmitted(false)
    setError(false)
    setForm(StaffInitial)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '15px', overflow: 'hidden' } }}
    >
      <DialogTitle
        sx={{
          px: { xs: 3, md: 4 },
          pt: 4,
          pb: 2.5,
          position: 'relative',
          bgcolor: 'bgsoft',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <IconButton
          onClick={handleClose}
          aria-label="Close"
          sx={{ position: 'absolute', right: 14, top: 14, color: 'charcoal.faint' }}
        >
          <CloseIcon />
        </IconButton>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
          People & Permissions
        </p>
        <h2 className="mt-2 text-xl text-charcoal">
          Assign Institutional Staff / Evaluator
        </h2>
        <p className="mt-1 text-sm text-charcoal-faint">
          Grant a named staff member role-based access to the workspace.
        </p>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 3, md: 4 }, py: 3.5 }}>
        {submitted ? (
          <div className="py-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[15px] bg-primary-soft">
              <CheckCircleIcon sx={{ fontSize: 30, color: 'primary.main' }} />
            </span>
            <h3 className="mt-4 text-lg text-charcoal">Evaluator assigned</h3>
            <p className="mt-1 text-sm text-charcoal-faint">
              <strong>{form.name}</strong> was invited as {form.role}.
            </p>
            <Button
              variant="contained"
              color="primary"
              onClick={handleClose}
              sx={{ mt: 4 }}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="grid gap-4">
            <TextField
              {...inputProps('name', 'Staff Full Name & Academic Title *', 'e.g. Dr. Aminu Adebayo')}
            />
            <TextField
              {...inputProps('email', 'Institutional Email (Login Identifier) *', 'e.g. adebayo@futminna.edu.ng')}
              type="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ fontSize: 18, color: 'charcoal.faint' }} />
                  </InputAdornment>
                ),
              }}
            />
            <div className="flex items-center gap-2 rounded-[15px] bg-primary-faint px-4 py-2.5">
              <KeyIcon sx={{ fontSize: 15, color: 'primary.main' }} />
              <p className="text-xs font-semibold text-primary">
                Default login password for new accounts is{' '}
                <span className="font-mono">1234!@#$</span>
              </p>
            </div>
            <FormControl fullWidth>
              <InputLabel>Institutional Role *</InputLabel>
              <Select
                label="Institutional Role *"
                size="medium"
                value={form.role}
                onChange={update('role')}
                error={error && !form.role}
                sx={{ borderRadius: '15px' }}
              >
                {StaffRoles.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              {...inputProps('position', 'Official Position Title *', 'e.g. SIWES Coordinator')}
            />
            <FormControl fullWidth>
              <InputLabel>Academic School</InputLabel>
              <Select
                label="Academic School"
                size="medium"
                value={form.school}
                onChange={update('school')}
                sx={{ borderRadius: '15px' }}
              >
                {Schools.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                label="Department"
                size="medium"
                value={form.department}
                onChange={update('department')}
                sx={{ borderRadius: '15px' }}
              >
                {Departments.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </form>
        )}
      </DialogContent>

      {!submitted && (
        <DialogActions
          sx={{
            px: { xs: 3, md: 4 },
            py: 2.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleClose}
            sx={{ color: 'text.primary', borderColor: 'border.strong' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Assign Evaluator
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}