import { useState, useEffect, type FC, type FormEvent } from 'react';
import type {
  AvailableCounsellor,
  CounsellingSession,
  CounsellingTopic,
} from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Radio,
  TextField,
} from '@mui/material';
import {
  SupportAgent as UserCheckIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface BookCounsellorModalProps {
  institutionId: string;
  departmentId?: string;
  studentId?: string;
  authToken?: string;
  onClose: () => void;
  onSuccess: (session: CounsellingSession) => void;
}

const TOPICS: { value: CounsellingTopic; label: string }[] = [
  { value: 'PATHWAY_ALIGNMENT', label: 'Career Pathway & Milestone Planning' },
  { value: 'SIWES_CLEARANCE', label: 'SIWES Placement, Logbook & Clearance' },
  { value: 'ASSESSMENT_DEBRIEF', label: 'Psychometric & Skills Diagnostic Debrief' },
  { value: 'RESUME_CV_REVIEW', label: 'Resume, Portfolio & Cover Letter Review' },
  { value: 'EMPLOYER_PLACEMENT', label: 'Graduate Job Placement & Internship Advisory' },
];

const TIME_SLOTS = [
  '09:00 AM - 09:45 AM',
  '10:00 AM - 10:45 AM',
  '11:00 AM - 11:45 AM',
  '02:00 PM - 02:45 PM',
  '03:00 PM - 03:45 PM',
];

export const BookCounsellorModal: FC<BookCounsellorModalProps> = ({
  institutionId,
  departmentId,
  studentId,
  authToken,
  onClose,
  onSuccess,
}) => {
  const [counsellors, setCounsellors] = useState<AvailableCounsellor[]>([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState<string>('');
  const [topic, setTopic] = useState<CounsellingTopic>('PATHWAY_ALIGNMENT');
  const [studentNotes, setStudentNotes] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('10:00 AM - 10:45 AM');
  const [meetingMode, setMeetingMode] = useState<'IN_PERSON' | 'VIRTUAL_CALL'>('IN_PERSON');
  const [loading, setLoading] = useState(false);
  const [fetchingStaff, setFetchingStaff] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCounsellors = async () => {
      try {
        setFetchingStaff(true);
        const list = await institutionApi.getAvailableCounsellors(
          institutionId,
          departmentId,
          authToken
        );
        setCounsellors(list);
        if (list.length > 0) setSelectedCounsellor(list[0].id);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load counsellors');
      } finally {
        setFetchingStaff(false);
      }
    };
    loadCounsellors();
  }, [institutionId, departmentId, authToken]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!preferredDate) {
      setError('Please select a preferred date for your counselling session.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await institutionApi.bookCounsellingSession(
        {
          counsellor: selectedCounsellor || undefined,
          topic,
          student_notes: studentNotes.trim(),
          preferred_date: preferredDate,
          preferred_time_slot: preferredTimeSlot,
          meeting_mode: meetingMode,
          student_id: studentId,
        },
        authToken
      );
      onSuccess(created);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '15px' } } }}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-primary-soft">
            <UserCheckIcon sx={{ fontSize: 22, color: 'primary.main' }} />
          </span>
          <div>
            <p className="text-base font-bold text-charcoal">
              Book 1-on-1 Career Counselling Session
            </p>
            <p className="mt-0.5 text-sm text-charcoal-faint">
              Connect directly with your Departmental Counsellor or HOD with your full assessment
              dossier automatically linked.
            </p>
          </div>
        </div>
        <IconButton size="medium" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1 }}>
        {error && (
          <div className="mb-4 rounded-[15px] bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              select
              fullWidth
              size="medium"
              label="Counselling Topic / Agenda"
              value={topic}
              onChange={(e) => setTopic(e.target.value as CounsellingTopic)}
            >
              {TOPICS.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              size="medium"
              label="Select Assigned Counsellor or HOD"
              value={selectedCounsellor}
              onChange={(e) => setSelectedCounsellor(e.target.value)}
              disabled={fetchingStaff}
              helperText={
                fetchingStaff
                  ? 'Loading available advisors...'
                  : counsellors.length === 0
                    ? 'Any available departmental counsellor will be assigned.'
                    : ''
              }
            >
              {counsellors.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} — {c.title}
                </MenuItem>
              ))}
              {counsellors.length === 0 && (
                <MenuItem value="">Any Available Departmental Counsellor</MenuItem>
              )}
            </TextField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              fullWidth
              size="medium"
              label="Preferred Date"
              type="date"
              required
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              select
              fullWidth
              size="medium"
              label="Preferred Time Slot"
              value={preferredTimeSlot}
              onChange={(e) => setPreferredTimeSlot(e.target.value)}
            >
              {TIME_SLOTS.map((slot) => (
                <MenuItem key={slot} value={slot}>
                  {slot}
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-charcoal">Meeting Format</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {(['IN_PERSON', 'VIRTUAL_CALL'] as const).map((mode) => (
                <label
                  key={mode}
                  className={`flex cursor-pointer items-center gap-3 rounded-[15px] border-2 px-4 py-3 transition-colors ${
                    meetingMode === mode
                      ? 'border-primary bg-primary-soft'
                      : 'border-line bg-white hover:bg-primary-faint'
                  }`}
                >
                  <Radio
                    checked={meetingMode === mode}
                    onChange={() => setMeetingMode(mode)}
                    value={mode}
                    size="small"
                  />
                  <span
                    className={`text-sm font-semibold ${
                      meetingMode === mode ? 'text-primary' : 'text-charcoal-soft'
                    }`}
                  >
                    {mode === 'IN_PERSON' ? 'In-Person (Department Office)' : 'Virtual Video / Call'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <TextField
            fullWidth
            size="medium"
            label="Specific Questions or Background for Your Counsellor"
            multiline
            rows={3}
            placeholder="e.g. I need guidance on preparing for my 400L SIWES defense and tailoring my resume for backend cloud internships..."
            value={studentNotes}
            onChange={(e) => setStudentNotes(e.target.value)}
          />

          <div className="flex items-start gap-2.5 rounded-[15px] bg-primary-soft/50 p-4">
            <CheckCircleIcon sx={{ fontSize: 18, color: 'var(--color-signoff)', mt: 0.25 }} />
            <p className="text-sm text-charcoal-soft">
              Your complete Big Five radar, Holland RIASEC code, and verified milestone progress
              will be automatically attached to this session.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClose}
              disabled={loading}
              sx={{ color: 'charcoal.soft', borderColor: 'border.strong' }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? 'Submitting Request...' : 'Confirm Appointment Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};