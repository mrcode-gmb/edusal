import { useState, type FC, type FormEvent } from 'react';
import type { AcademicSession } from '../../types/institution';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  DeleteOutlined as DeleteOutlineIcon,
  PlayArrow as PlayArrowIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';

interface AcademicSessionsModalProps {
  open: boolean;
  onClose: () => void;
  institutionId: string;
  institutionName: string;
  sessions: AcademicSession[];
  token?: string;
  onCreateSession: (data: {
    institution: string;
    session_label: string;
    current_semester: string;
    start_date?: string | null;
    end_date?: string | null;
    is_current?: boolean;
  }) => Promise<void>;
  onSetCurrentSession: (sessionId: string) => Promise<void>;
  onUpdateSession: (
    sessionId: string,
    data: Partial<AcademicSession>
  ) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
}

export const AcademicSessionsModal: FC<AcademicSessionsModalProps> = ({
  open,
  onClose,
  institutionId,
  institutionName,
  sessions,
  onCreateSession,
  onSetCurrentSession,
  onUpdateSession,
  onDeleteSession,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Create Form State
  const [sessionLabel, setSessionLabel] = useState('');
  const [semester, setSemester] = useState<'FIRST_SEMESTER' | 'SECOND_SEMESTER'>('FIRST_SEMESTER');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);

  // Edit Form State
  const [editLabel, setEditLabel] = useState('');
  const [editSemester, setEditSemester] = useState<'FIRST_SEMESTER' | 'SECOND_SEMESTER'>('FIRST_SEMESTER');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setSessionLabel('');
    setSemester('FIRST_SEMESTER');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setShowCreateForm(false);
    setEditingSessionId(null);
    setError(null);
  };

  const handleStartEdit = (session: AcademicSession) => {
    setEditingSessionId(session.id);
    setEditLabel(session.session_label);
    setEditSemester(session.current_semester || 'FIRST_SEMESTER');
    setEditStartDate(session.start_date || '');
    setEditEndDate(session.end_date || '');
    setShowCreateForm(false);
    setError(null);
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sessionLabel.trim()) {
      setError('Please provide a session label, e.g. 2025/2026');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onCreateSession({
        institution: institutionId,
        session_label: sessionLabel.trim(),
        current_semester: semester,
        start_date: startDate || null,
        end_date: endDate || null,
        is_current: isCurrent || sessions.length === 0,
      });
      setSuccessMessage(`Academic session ${sessionLabel.trim()} created successfully!`);
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create academic session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (sessionId: string) => {
    if (!editLabel.trim()) {
      setError('Session label cannot be blank');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onUpdateSession(sessionId, {
        session_label: editLabel.trim(),
        current_semester: editSemester,
        start_date: editStartDate || undefined,
        end_date: editEndDate || undefined,
      });
      setSuccessMessage('Session details updated successfully!');
      setEditingSessionId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (sessionId: string, label: string) => {
    setActionLoadingId(sessionId);
    setError(null);
    setSuccessMessage(null);

    try {
      await onSetCurrentSession(sessionId);
      setSuccessMessage(`${label} is now the active academic session.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to switch current session');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (sessionId: string, label: string) => {
    if (!window.confirm(`Are you sure you want to delete the academic session ${label}?`)) {
      return;
    }

    setActionLoadingId(sessionId);
    setError(null);
    setSuccessMessage(null);

    try {
      await onDeleteSession(sessionId);
      setSuccessMessage(`Session ${label} removed.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    } finally {
      setActionLoadingId(null);
    }
  };

  const currentSession = sessions.find((s) => s.is_current);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-line bg-white px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <CalendarMonthIcon sx={{ fontSize: 22 }} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-charcoal">
              Academic Sessions & Semesters
            </h2>
            <p className="text-xs text-charcoal-faint">
              {institutionName} · Cohort calendars & active semester governance
            </p>
          </div>
        </div>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: 'charcoal.faint', '&:hover': { color: 'charcoal' } }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </div>

      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: 'background.default' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {/* Current Active Session Highlight Card */}
        {currentSession ? (
          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary-faint/60 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <CheckCircleIcon sx={{ fontSize: 18 }} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Currently Active Session
                    </span>
                    <Chip
                      label="Active Baseline"
                      size="small"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 10,
                        height: 20,
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-extrabold text-charcoal mt-1">
                    {currentSession.session_label}
                  </h3>
                  <p className="text-xs font-semibold text-charcoal-soft mt-0.5">
                    {currentSession.current_semester_display || (currentSession.current_semester === 'FIRST_SEMESTER' ? 'First Semester (Harmattan / Alpha)' : 'Second Semester (Rain / Omega)')}
                    {currentSession.start_date && currentSession.end_date && (
                      <span className="text-charcoal-faint font-normal ml-2">
                        · {new Date(currentSession.start_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} – {new Date(currentSession.end_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                onClick={() => handleStartEdit(currentSession)}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
              >
                Edit Semester / Dates
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold text-amber-900">
              ⚠️ No academic session is currently marked active. Please create or set an active session below.
            </p>
          </div>
        )}

        {/* Action Header: Create Button */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal-faint">
            Configured Academic Sessions ({sessions.length})
          </h3>
          {!showCreateForm && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                setShowCreateForm(true);
                setEditingSessionId(null);
                setError(null);
              }}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
            >
              Add New Session
            </Button>
          )}
        </div>

        {/* Create Session Form Sub-panel */}
        {showCreateForm && (
          <div className="mb-6 rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <h4 className="text-sm font-bold text-charcoal">
                Create New Academic Session
              </h4>
              <Button
                size="small"
                color="inherit"
                onClick={() => setShowCreateForm(false)}
                sx={{ textTransform: 'none', fontSize: 12 }}
              >
                Cancel
              </Button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <TextField
                    label="Academic Session Label *"
                    fullWidth
                    size="small"
                    value={sessionLabel}
                    onChange={(e) => setSessionLabel(e.target.value)}
                    placeholder="e.g. 2026/2027"
                    helperText="Standard format (YYYY/YYYY)"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                </div>
                <div>
                  <FormControl fullWidth size="small">
                    <InputLabel>Active Semester *</InputLabel>
                    <Select
                      value={semester}
                      label="Active Semester *"
                      onChange={(e) => setSemester(e.target.value as 'FIRST_SEMESTER' | 'SECOND_SEMESTER')}
                      sx={{ borderRadius: '10px' }}
                    >
                      <MenuItem value="FIRST_SEMESTER">
                        First Semester (Harmattan / Alpha)
                      </MenuItem>
                      <MenuItem value="SECOND_SEMESTER">
                        Second Semester (Rain / Omega)
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div>
                  <TextField
                    label="Session Start Date (optional)"
                    type="date"
                    fullWidth
                    size="small"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                </div>
                <div>
                  <TextField
                    label="Session End Date (optional)"
                    type="date"
                    fullWidth
                    size="small"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-bgsoft px-4 py-2">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCurrent}
                      onChange={(e) => setIsCurrent(e.target.checked)}
                      sx={{ color: 'primary.main' }}
                    />
                  }
                  label={
                    <span className="text-xs font-semibold text-charcoal">
                      Set as the active/current academic session for {institutionName} immediately
                    </span>
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => setShowCreateForm(false)}
                  sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                >
                  {submitting ? 'Creating…' : 'Create Session'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Sessions List */}
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
              <EventNoteIcon sx={{ fontSize: 40, color: 'charcoal.faint', mb: 1 }} />
              <p className="text-sm font-bold text-charcoal">No Academic Sessions Configured</p>
              <p className="mt-1 text-xs text-charcoal-faint">
                Click "Add New Session" to configure your first academic calendar session.
              </p>
            </div>
          ) : (
            sessions.map((sess) => {
              const isEditing = editingSessionId === sess.id;
              const isActionLoading = actionLoadingId === sess.id;

              if (isEditing) {
                return (
                  <div key={sess.id} className="rounded-2xl border-2 border-primary bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-line pb-2 mb-3">
                      <span className="text-xs font-bold text-primary">
                        Editing Academic Session: {sess.session_label}
                      </span>
                      <Button
                        size="small"
                        color="inherit"
                        onClick={() => setEditingSessionId(null)}
                        sx={{ fontSize: 11, textTransform: 'none' }}
                      >
                        Cancel
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <TextField
                        label="Session Label"
                        size="small"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                      <FormControl fullWidth size="small">
                        <InputLabel>Active Semester</InputLabel>
                        <Select
                          value={editSemester}
                          label="Active Semester"
                          onChange={(e) => setEditSemester(e.target.value as 'FIRST_SEMESTER' | 'SECOND_SEMESTER')}
                          sx={{ borderRadius: '8px' }}
                        >
                          <MenuItem value="FIRST_SEMESTER">First Semester (Harmattan / Alpha)</MenuItem>
                          <MenuItem value="SECOND_SEMESTER">Second Semester (Rain / Omega)</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        label="Start Date"
                        type="date"
                        size="small"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                      <TextField
                        label="End Date"
                        type="date"
                        size="small"
                        value={editEndDate}
                        onChange={(e) => setEditEndDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        onClick={() => setEditingSessionId(null)}
                        sx={{ borderRadius: '6px', textTransform: 'none' }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        disabled={submitting}
                        onClick={() => handleEditSubmit(sess.id)}
                        sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 700 }}
                      >
                        {submitting ? 'Saving…' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={sess.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-colors ${
                    sess.is_current
                      ? 'border-primary/40 bg-primary-faint/30 shadow-sm'
                      : 'border-line bg-white hover:border-line-strong'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                        sess.is_current ? 'bg-primary text-white' : 'bg-bgsoft text-charcoal-faint'
                      }`}
                    >
                      <EventNoteIcon sx={{ fontSize: 18 }} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-charcoal">
                          {sess.session_label}
                        </span>
                        {sess.is_current ? (
                          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
                            Active Current
                          </span>
                        ) : (
                          <span className="rounded-full bg-bgsoft px-2 py-0.5 text-[10px] font-semibold text-charcoal-faint">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-charcoal-soft mt-0.5">
                        {sess.current_semester_display || (sess.current_semester === 'FIRST_SEMESTER' ? 'First Semester (Harmattan / Alpha)' : 'Second Semester (Rain / Omega)')}
                        {sess.start_date && sess.end_date && (
                          <span className="text-charcoal-faint ml-2">
                            · {sess.start_date} to {sess.end_date}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {!sess.is_current && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        disabled={isActionLoading}
                        onClick={() => handleActivate(sess.id, sess.session_label)}
                        startIcon={isActionLoading ? <CircularProgress size={12} /> : <PlayArrowIcon sx={{ fontSize: 15 }} />}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontSize: 11, fontWeight: 700 }}
                      >
                        Set as Active
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleStartEdit(sess)}
                      sx={{ color: 'charcoal.faint', '&:hover': { color: 'charcoal' } }}
                      title="Edit session details"
                    >
                      <EditIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                    {!sess.is_current && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(sess.id, sess.session_label)}
                        sx={{ color: 'error.main', '&:hover': { color: 'error.dark' } }}
                        title="Delete session"
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3.5, py: 2.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
