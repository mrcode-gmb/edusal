import { useState, useEffect, type FC, type FormEvent } from 'react';
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
  Collapse,
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
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  DateRange as DateRangeIcon,
  Tune as TuneIcon,
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
    first_semester_start_date?: string | null;
    first_semester_end_date?: string | null;
    second_semester_start_date?: string | null;
    second_semester_end_date?: string | null;
    is_current?: boolean;
  }) => Promise<void>;
  onSetCurrentSession: (
    sessionId: string,
    currentSemester?: 'FIRST_SEMESTER' | 'SECOND_SEMESTER'
  ) => Promise<void>;
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
  const [configuringSemesterKey, setConfiguringSemesterKey] = useState<string | null>(null); // e.g. "sessionId-FIRST_SEMESTER"

  // Track expanded session IDs in accordion
  const [expandedSessionIds, setExpandedSessionIds] = useState<Record<string, boolean>>({});

  // Auto-expand current active session when opened or sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      const initial: Record<string, boolean> = {};
      sessions.forEach((s) => {
        if (s.is_current) {
          initial[s.id] = true;
        }
      });
      if (Object.keys(initial).length === 0 && sessions[0]) {
        initial[sessions[0].id] = true;
      }
      setExpandedSessionIds((prev) => ({ ...initial, ...prev }));
    }
  }, [sessions, open]);

  const toggleExpand = (sessionId: string) => {
    setExpandedSessionIds((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  // Create Form State
  const [sessionLabel, setSessionLabel] = useState('');
  const [initialSemester, setInitialSemester] = useState<'FIRST_SEMESTER' | 'SECOND_SEMESTER'>('FIRST_SEMESTER');
  const [createFirstSemStart, setCreateFirstSemStart] = useState('');
  const [createFirstSemEnd, setCreateFirstSemEnd] = useState('');
  const [createSecondSemStart, setCreateSecondSemStart] = useState('');
  const [createSecondSemEnd, setCreateSecondSemEnd] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);

  // Consolidated Session Edit State
  const [editLabel, setEditLabel] = useState('');
  const [editSemester, setEditSemester] = useState<'FIRST_SEMESTER' | 'SECOND_SEMESTER'>('FIRST_SEMESTER');
  const [editFirstSemStart, setEditFirstSemStart] = useState('');
  const [editFirstSemEnd, setEditFirstSemEnd] = useState('');
  const [editSecondSemStart, setEditSecondSemStart] = useState('');
  const [editSecondSemEnd, setEditSecondSemEnd] = useState('');

  // Inline Single-Semester Configure State
  const [semStartDate, setSemStartDate] = useState('');
  const [semEndDate, setSemEndDate] = useState('');

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetCreateForm = () => {
    setSessionLabel('');
    setInitialSemester('FIRST_SEMESTER');
    setCreateFirstSemStart('');
    setCreateFirstSemEnd('');
    setCreateSecondSemStart('');
    setCreateSecondSemEnd('');
    setIsCurrent(false);
    setShowCreateForm(false);
    setError(null);
  };

  const handleStartEditSession = (session: AcademicSession) => {
    setEditingSessionId(session.id);
    setEditLabel(session.session_label);
    setEditSemester(session.current_semester || 'FIRST_SEMESTER');
    setEditFirstSemStart(session.first_semester_start_date || '');
    setEditFirstSemEnd(session.first_semester_end_date || '');
    setEditSecondSemStart(session.second_semester_start_date || '');
    setEditSecondSemEnd(session.second_semester_end_date || '');
    setShowCreateForm(false);
    setConfiguringSemesterKey(null);
    setError(null);
  };

  const handleStartConfiguringSemester = (
    session: AcademicSession,
    targetSemester: 'FIRST_SEMESTER' | 'SECOND_SEMESTER'
  ) => {
    const key = `${session.id}-${targetSemester}`;
    setConfiguringSemesterKey(key);
    if (targetSemester === 'FIRST_SEMESTER') {
      setSemStartDate(session.first_semester_start_date || '');
      setSemEndDate(session.first_semester_end_date || '');
    } else {
      setSemStartDate(session.second_semester_start_date || '');
      setSemEndDate(session.second_semester_end_date || '');
    }
    setEditingSessionId(null);
    setShowCreateForm(false);
    setError(null);
  };

  const handleSaveSingleSemesterDates = async (
    session: AcademicSession,
    targetSemester: 'FIRST_SEMESTER' | 'SECOND_SEMESTER'
  ) => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const updatePayload: Partial<AcademicSession> = {};
    if (targetSemester === 'FIRST_SEMESTER') {
      updatePayload.first_semester_start_date = semStartDate || undefined;
      updatePayload.first_semester_end_date = semEndDate || undefined;
      if (semStartDate && !session.start_date) {
        updatePayload.start_date = semStartDate;
      }
    } else {
      updatePayload.second_semester_start_date = semStartDate || undefined;
      updatePayload.second_semester_end_date = semEndDate || undefined;
      if (semEndDate && !session.end_date) {
        updatePayload.end_date = semEndDate;
      }
    }

    try {
      await onUpdateSession(session.id, updatePayload);
      const semTitle = targetSemester === 'FIRST_SEMESTER' ? 'First Semester' : 'Second Semester';
      setSuccessMessage(`${semTitle} dates for ${session.session_label} updated successfully.`);
      setConfiguringSemesterKey(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update semester dates');
    } finally {
      setSubmitting(false);
    }
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

    const overallStart = createFirstSemStart || null;
    const overallEnd = createSecondSemEnd || createFirstSemEnd || null;

    try {
      await onCreateSession({
        institution: institutionId,
        session_label: sessionLabel.trim(),
        current_semester: initialSemester,
        start_date: overallStart,
        end_date: overallEnd,
        first_semester_start_date: createFirstSemStart || null,
        first_semester_end_date: createFirstSemEnd || null,
        second_semester_start_date: createSecondSemStart || null,
        second_semester_end_date: createSecondSemEnd || null,
        is_current: isCurrent || sessions.length === 0,
      });
      setSuccessMessage(`Academic session ${sessionLabel.trim()} with grouped semesters configured successfully!`);
      resetCreateForm();
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

    const overallStart = editFirstSemStart || undefined;
    const overallEnd = editSecondSemEnd || editFirstSemEnd || undefined;

    try {
      await onUpdateSession(sessionId, {
        session_label: editLabel.trim(),
        current_semester: editSemester,
        start_date: overallStart,
        end_date: overallEnd,
        first_semester_start_date: editFirstSemStart || undefined,
        first_semester_end_date: editFirstSemEnd || undefined,
        second_semester_start_date: editSecondSemStart || undefined,
        second_semester_end_date: editSecondSemEnd || undefined,
      });
      setSuccessMessage('Session and semester details updated successfully!');
      setEditingSessionId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivateSemester = async (
    sessionId: string,
    targetSemester: 'FIRST_SEMESTER' | 'SECOND_SEMESTER',
    label: string
  ) => {
    const loadingKey = `${sessionId}-${targetSemester}`;
    setActionLoadingKey(loadingKey);
    setError(null);
    setSuccessMessage(null);

    const semName = targetSemester === 'FIRST_SEMESTER' ? 'First Semester' : 'Second Semester';

    try {
      await onSetCurrentSession(sessionId, targetSemester);
      setSuccessMessage(`${label} · ${semName} is now active across campus.`);
      setExpandedSessionIds((prev) => ({ ...prev, [sessionId]: true }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to switch active semester');
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleDelete = async (sessionId: string, label: string) => {
    if (!window.confirm(`Are you sure you want to delete the academic session ${label}?`)) {
      return;
    }

    setActionLoadingKey(sessionId);
    setError(null);
    setSuccessMessage(null);

    try {
      await onDeleteSession(sessionId);
      setSuccessMessage(`Session ${label} removed.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    } finally {
      setActionLoadingKey(null);
    }
  };

  const currentSession = sessions.find((s) => s.is_current);

  const formatSemesterDates = (start?: string, end?: string) => {
    if (!start && !end) return 'Dates not configured';
    const sStr = start ? new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';
    const eStr = end ? new Date(end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';
    return `${sStr} – ${eStr}`;
  };

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
              Academic Sessions & Semester Manager
            </h2>
            <p className="text-xs text-charcoal-faint">
              {institutionName} · Grouped First Semester & Second Semester calendars
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

        {/* Current Active Session Highlight Banner */}
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
                      Currently Active Campus Baseline
                    </span>
                    <Chip
                      label="Live Active"
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
                    {currentSession.session_label} · {currentSession.current_semester === 'SECOND_SEMESTER' ? 'Second Semester' : 'First Semester'}
                  </h3>
                  <p className="text-xs font-semibold text-charcoal-soft mt-0.5">
                    {currentSession.current_semester === 'FIRST_SEMESTER'
                      ? `First Semester: ${formatSemesterDates(currentSession.first_semester_start_date, currentSession.first_semester_end_date)}`
                      : `Second Semester: ${formatSemesterDates(currentSession.second_semester_start_date, currentSession.second_semester_end_date)}`
                    }
                  </p>
                </div>
              </div>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                onClick={() => handleStartEditSession(currentSession)}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, shrink: 0 }}
              >
                Edit All Dates
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold text-amber-900">
              ⚠️ No academic session is currently marked active. Please create or activate a session below.
            </p>
          </div>
        )}

        {/* Action Header: Add Session Button */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal-faint">
              Configured Sessions ({sessions.length})
            </h3>
            <span className="text-xs text-charcoal-faint">
              (Expand a session to view, configure, or activate its semesters)
            </span>
          </div>
          {!showCreateForm && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                setShowCreateForm(true);
                setEditingSessionId(null);
                setConfiguringSemesterKey(null);
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
              <div>
                <h4 className="text-sm font-bold text-charcoal">
                  Setup New Academic Session & Semesters
                </h4>
                <p className="text-xs text-charcoal-faint">
                  Define the academic year and setup dates for both First and Second semesters
                </p>
              </div>
              <Button
                size="small"
                color="inherit"
                onClick={resetCreateForm}
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
                    helperText="Standard academic year (YYYY/YYYY)"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                </div>
                <div>
                  <FormControl fullWidth size="small">
                    <InputLabel>Initial Active Semester *</InputLabel>
                    <Select
                      value={initialSemester}
                      label="Initial Active Semester *"
                      onChange={(e) => setInitialSemester(e.target.value as 'FIRST_SEMESTER' | 'SECOND_SEMESTER')}
                      sx={{ borderRadius: '10px' }}
                    >
                      <MenuItem value="FIRST_SEMESTER">First Semester</MenuItem>
                      <MenuItem value="SECOND_SEMESTER">Second Semester</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>

              {/* Grouped Semester 1 Setup */}
              <div className="rounded-xl border border-primary/20 bg-primary-faint/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-white text-xs font-bold">1</span>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-primary">
                    First Semester Timeline (Optional)
                  </h5>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="First Semester Start Date"
                    type="date"
                    fullWidth
                    size="small"
                    value={createFirstSemStart}
                    onChange={(e) => setCreateFirstSemStart(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'white' } }}
                  />
                  <TextField
                    label="First Semester End Date"
                    type="date"
                    fullWidth
                    size="small"
                    value={createFirstSemEnd}
                    onChange={(e) => setCreateFirstSemEnd(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'white' } }}
                  />
                </div>
              </div>

              {/* Grouped Semester 2 Setup */}
              <div className="rounded-xl border border-line bg-bgsoft/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-charcoal text-white text-xs font-bold">2</span>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                    Second Semester Timeline (Optional)
                  </h5>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="Second Semester Start Date"
                    type="date"
                    fullWidth
                    size="small"
                    value={createSecondSemStart}
                    onChange={(e) => setCreateSecondSemStart(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'white' } }}
                  />
                  <TextField
                    label="Second Semester End Date"
                    type="date"
                    fullWidth
                    size="small"
                    value={createSecondSemEnd}
                    onChange={(e) => setCreateSecondSemEnd(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'white' } }}
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
                  onClick={resetCreateForm}
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
                  {submitting ? 'Configuring…' : 'Create Session & Semesters'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Grouped Collapsible Sessions List */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
              <EventNoteIcon sx={{ fontSize: 40, color: 'charcoal.faint', mb: 1 }} />
              <p className="text-sm font-bold text-charcoal">No Academic Sessions Configured</p>
              <p className="mt-1 text-xs text-charcoal-faint">
                Click "Add New Session" to setup your first academic session and semester timeline.
              </p>
            </div>
          ) : (
            sessions.map((sess) => {
              const isEditingSession = editingSessionId === sess.id;
              const isExpanded = !!expandedSessionIds[sess.id];
              const isFirstSemesterActive = sess.is_current && sess.current_semester === 'FIRST_SEMESTER';
              const isSecondSemesterActive = sess.is_current && sess.current_semester === 'SECOND_SEMESTER';

              const configuringFirstSem = configuringSemesterKey === `${sess.id}-FIRST_SEMESTER`;
              const configuringSecondSem = configuringSemesterKey === `${sess.id}-SECOND_SEMESTER`;

              if (isEditingSession) {
                return (
                  <div key={sess.id} className="rounded-2xl border-2 border-primary bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-line pb-2 mb-4">
                      <span className="text-xs font-bold text-primary">
                        Editing Session & Semester Dates: {sess.session_label}
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

                    <div className="space-y-4">
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
                            <MenuItem value="FIRST_SEMESTER">First Semester</MenuItem>
                            <MenuItem value="SECOND_SEMESTER">Second Semester</MenuItem>
                          </Select>
                        </FormControl>
                      </div>

                      {/* First Semester Dates */}
                      <div className="rounded-xl border border-line bg-bgsoft/40 p-3">
                        <p className="text-xs font-bold text-charcoal mb-2">First Semester Dates</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <TextField
                            label="Start Date"
                            type="date"
                            size="small"
                            value={editFirstSemStart}
                            onChange={(e) => setEditFirstSemStart(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'white' } }}
                          />
                          <TextField
                            label="End Date"
                            type="date"
                            size="small"
                            value={editFirstSemEnd}
                            onChange={(e) => setEditFirstSemEnd(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'white' } }}
                          />
                        </div>
                      </div>

                      {/* Second Semester Dates */}
                      <div className="rounded-xl border border-line bg-bgsoft/40 p-3">
                        <p className="text-xs font-bold text-charcoal mb-2">Second Semester Dates</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <TextField
                            label="Start Date"
                            type="date"
                            size="small"
                            value={editSecondSemStart}
                            onChange={(e) => setEditSecondSemStart(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'white' } }}
                          />
                          <TextField
                            label="End Date"
                            type="date"
                            size="small"
                            value={editSecondSemEnd}
                            onChange={(e) => setEditSecondSemEnd(e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'white' } }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
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
                  className={`overflow-hidden rounded-2xl border transition-all ${
                    sess.is_current
                      ? 'border-primary/40 bg-white shadow-card ring-1 ring-primary/20'
                      : 'border-line bg-white hover:border-line-strong'
                  }`}
                >
                  {/* Collapsible Session Header */}
                  <div
                    onClick={() => toggleExpand(sess.id)}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 cursor-pointer select-none transition-colors ${
                      sess.is_current ? 'bg-primary-faint/30 hover:bg-primary-faint/50' : 'hover:bg-bgsoft/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(sess.id);
                        }}
                        sx={{ color: sess.is_current ? 'primary.main' : 'charcoal.faint' }}
                      >
                        {isExpanded ? (
                          <ExpandLessIcon sx={{ fontSize: 22 }} />
                        ) : (
                          <ExpandMoreIcon sx={{ fontSize: 22 }} />
                        )}
                      </IconButton>

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                          sess.is_current ? 'bg-primary text-white' : 'bg-bgsoft text-charcoal-faint'
                        }`}
                      >
                        <EventNoteIcon sx={{ fontSize: 18 }} />
                      </span>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-base text-charcoal">
                            {sess.session_label}
                          </span>
                          {sess.is_current ? (
                            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
                              Active Session
                            </span>
                          ) : (
                            <span className="rounded-full bg-bgsoft px-2 py-0.5 text-[10px] font-semibold text-charcoal-faint">
                              Archived
                            </span>
                          )}
                          <Chip
                            label={`Active: ${sess.current_semester === 'SECOND_SEMESTER' ? 'Second Semester' : 'First Semester'}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: 11,
                              height: 22,
                              fontWeight: 600,
                              borderColor: sess.is_current ? 'primary.main' : 'divider',
                              color: sess.is_current ? 'primary.main' : 'text.secondary',
                            }}
                          />
                        </div>

                        <p className="text-xs text-charcoal-faint mt-0.5">
                          {isExpanded ? 'Click header to collapse' : 'Click header to expand 2 semesters'}
                        </p>
                      </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div
                      className="flex items-center gap-1.5 self-end sm:self-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleStartEditSession(sess)}
                        sx={{ color: 'charcoal.faint', '&:hover': { color: 'charcoal' } }}
                        title="Edit all session & semester dates"
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

                  {/* Grouped Semesters (Collapsible Body) */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <div className="border-t border-line bg-bgsoft/40 p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-faint">
                          Semesters in {sess.session_label} Academic Session
                        </p>
                        <span className="text-[11px] text-charcoal-faint">
                          Configure dates & activate term
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {/* First Semester Card */}
                        <div
                          className={`rounded-xl border p-4 transition-all ${
                            isFirstSemesterActive
                              ? 'border-primary bg-white shadow-sm ring-1 ring-primary/20'
                              : 'border-line bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                  isFirstSemesterActive
                                    ? 'bg-primary-soft text-primary font-bold text-xs'
                                    : 'bg-bgsoft text-charcoal-faint text-xs font-semibold'
                                }`}
                              >
                                1
                              </span>
                              <div>
                                <h5 className="text-sm font-bold text-charcoal">
                                  First Semester
                                </h5>
                                <p className="text-[11px] text-charcoal-soft font-medium">
                                  {formatSemesterDates(sess.first_semester_start_date, sess.first_semester_end_date)}
                                </p>
                              </div>
                            </div>

                            {isFirstSemesterActive ? (
                              <span className="rounded-full bg-primary text-white px-2.5 py-0.5 text-[10px] font-bold">
                                Live Active
                              </span>
                            ) : (
                              <span className="rounded-full bg-bgsoft px-2 py-0.5 text-[10px] font-semibold text-charcoal-faint">
                                {sess.is_current ? 'Completed Term' : 'Inactive'}
                              </span>
                            )}
                          </div>

                          {/* Inline Configure First Semester Dates Form */}
                          {configuringFirstSem ? (
                            <div className="mt-3 border-t border-line pt-3 space-y-3">
                              <p className="text-[11px] font-bold text-primary">Setup First Semester Dates:</p>
                              <div className="grid gap-2">
                                <TextField
                                  label="Start Date"
                                  type="date"
                                  size="small"
                                  value={semStartDate}
                                  onChange={(e) => setSemStartDate(e.target.value)}
                                  slotProps={{ inputLabel: { shrink: true } }}
                                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                                />
                                <TextField
                                  label="End Date"
                                  type="date"
                                  size="small"
                                  value={semEndDate}
                                  onChange={(e) => setSemEndDate(e.target.value)}
                                  slotProps={{ inputLabel: { shrink: true } }}
                                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="small"
                                  color="inherit"
                                  onClick={() => setConfiguringSemesterKey(null)}
                                  sx={{ fontSize: 11, textTransform: 'none' }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  disabled={submitting}
                                  onClick={() => handleSaveSingleSemesterDates(sess, 'FIRST_SEMESTER')}
                                  sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none', borderRadius: '6px' }}
                                >
                                  {submitting ? 'Saving…' : 'Save Dates'}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3">
                              <Button
                                size="small"
                                variant="text"
                                color="inherit"
                                onClick={() => handleStartConfiguringSemester(sess, 'FIRST_SEMESTER')}
                                startIcon={<DateRangeIcon sx={{ fontSize: 13 }} />}
                                sx={{ fontSize: 11, textTransform: 'none', color: 'charcoal.soft', px: 1 }}
                              >
                                {sess.first_semester_start_date ? 'Edit Dates' : 'Setup Dates'}
                              </Button>

                              {!isFirstSemesterActive && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  disabled={actionLoadingKey === `${sess.id}-FIRST_SEMESTER`}
                                  onClick={() => handleActivateSemester(sess.id, 'FIRST_SEMESTER', sess.session_label)}
                                  startIcon={
                                    actionLoadingKey === `${sess.id}-FIRST_SEMESTER` ? (
                                      <CircularProgress size={12} color="inherit" />
                                    ) : (
                                      <PlayArrowIcon sx={{ fontSize: 14 }} />
                                    )
                                  }
                                  sx={{
                                    borderRadius: '6px',
                                    textTransform: 'none',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    py: 0.5,
                                    px: 1.5,
                                  }}
                                >
                                  Set as Active
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Second Semester Card */}
                        <div
                          className={`rounded-xl border p-4 transition-all ${
                            isSecondSemesterActive
                              ? 'border-primary bg-white shadow-sm ring-1 ring-primary/20'
                              : 'border-line bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                  isSecondSemesterActive
                                    ? 'bg-primary-soft text-primary font-bold text-xs'
                                    : 'bg-bgsoft text-charcoal-faint text-xs font-semibold'
                                }`}
                              >
                                2
                              </span>
                              <div>
                                <h5 className="text-sm font-bold text-charcoal">
                                  Second Semester
                                </h5>
                                <p className="text-[11px] text-charcoal-soft font-medium">
                                  {formatSemesterDates(sess.second_semester_start_date, sess.second_semester_end_date)}
                                </p>
                              </div>
                            </div>

                            {isSecondSemesterActive ? (
                              <span className="rounded-full bg-primary text-white px-2.5 py-0.5 text-[10px] font-bold">
                                Live Active
                              </span>
                            ) : (
                              <span className="rounded-full bg-bgsoft px-2 py-0.5 text-[10px] font-semibold text-charcoal-faint">
                                {sess.is_current ? 'Upcoming Term' : 'Inactive'}
                              </span>
                            )}
                          </div>

                          {/* Inline Configure Second Semester Dates Form */}
                          {configuringSecondSem ? (
                            <div className="mt-3 border-t border-line pt-3 space-y-3">
                              <p className="text-[11px] font-bold text-primary">Setup Second Semester Dates:</p>
                              <div className="grid gap-2">
                                <TextField
                                  label="Start Date"
                                  type="date"
                                  size="small"
                                  value={semStartDate}
                                  onChange={(e) => setSemStartDate(e.target.value)}
                                  slotProps={{ inputLabel: { shrink: true } }}
                                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                                />
                                <TextField
                                  label="End Date"
                                  type="date"
                                  size="small"
                                  value={semEndDate}
                                  onChange={(e) => setSemEndDate(e.target.value)}
                                  slotProps={{ inputLabel: { shrink: true } }}
                                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="small"
                                  color="inherit"
                                  onClick={() => setConfiguringSemesterKey(null)}
                                  sx={{ fontSize: 11, textTransform: 'none' }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  disabled={submitting}
                                  onClick={() => handleSaveSingleSemesterDates(sess, 'SECOND_SEMESTER')}
                                  sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none', borderRadius: '6px' }}
                                >
                                  {submitting ? 'Saving…' : 'Save Dates'}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3">
                              <Button
                                size="small"
                                variant="text"
                                color="inherit"
                                onClick={() => handleStartConfiguringSemester(sess, 'SECOND_SEMESTER')}
                                startIcon={<DateRangeIcon sx={{ fontSize: 13 }} />}
                                sx={{ fontSize: 11, textTransform: 'none', color: 'charcoal.soft', px: 1 }}
                              >
                                {sess.second_semester_start_date ? 'Edit Dates' : 'Setup Dates'}
                              </Button>

                              {!isSecondSemesterActive && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  disabled={actionLoadingKey === `${sess.id}-SECOND_SEMESTER`}
                                  onClick={() => handleActivateSemester(sess.id, 'SECOND_SEMESTER', sess.session_label)}
                                  startIcon={
                                    actionLoadingKey === `${sess.id}-SECOND_SEMESTER` ? (
                                      <CircularProgress size={12} color="inherit" />
                                    ) : (
                                      <PlayArrowIcon sx={{ fontSize: 14 }} />
                                    )
                                  }
                                  sx={{
                                    borderRadius: '6px',
                                    textTransform: 'none',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    py: 0.5,
                                    px: 1.5,
                                  }}
                                >
                                  Set as Active
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Collapse>
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
