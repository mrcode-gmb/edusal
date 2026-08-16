import { useState, useEffect, type FC, type FormEvent } from 'react';
import type { AvailableCounsellor, CounsellingSession, CounsellingTopic } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  XIcon,
  UserCheckIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from '../icons';

interface BookCounsellorModalProps {
  institutionId: string;
  departmentId?: string;
  studentId?: string;
  authToken?: string;
  onClose: () => void;
  onSuccess: (session: CounsellingSession) => void;
}

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
        const list = await institutionApi.getAvailableCounsellors(institutionId, departmentId, authToken);
        setCounsellors(list);
        if (list.length > 0) {
          setSelectedCounsellor(list[0].id);
        }
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

  const topicsList: { value: CounsellingTopic; label: string; desc: string }[] = [
    {
      value: 'PATHWAY_ALIGNMENT',
      label: 'Career Pathway & Milestone Planning',
      desc: 'Review multi-year deliverables and align milestones with target job roles.',
    },
    {
      value: 'SIWES_CLEARANCE',
      label: 'SIWES Placement, Logbook & Clearance',
      desc: 'Guidance on ITCC Form 08, monthly clearance, and industrial supervisor sign-offs.',
    },
    {
      value: 'ASSESSMENT_DEBRIEF',
      label: 'Psychometric & Skills Diagnostic Debrief',
      desc: 'In-depth analysis of your Big Five traits and Holland RIASEC Code.',
    },
    {
      value: 'RESUME_CV_REVIEW',
      label: 'Resume, Portfolio & Cover Letter Review',
      desc: 'Tailor your GitHub repos, technical writeups, and applications for Nigerian employers.',
    },
    {
      value: 'EMPLOYER_PLACEMENT',
      label: 'Graduate Job Placement & Internship Advisory',
      desc: 'Direct recommendations to partner companies and corporate hiring pipelines.',
    },
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-content-md">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <UserCheckIcon size={20} color="#0284c7" />
            </div>
            <div>
              <h3 className="modal-title">Book 1-on-1 Career Counselling Session</h3>
              <p className="modal-sub">
                Connect directly with your Departmental Counsellor or HOD with your full assessment dossier automatically linked.
              </p>
            </div>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        {error && (
          <div className="login-alert-error" style={{ margin: '16px 24px 0 24px' }}>
            <AlertCircleIcon size={16} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form-body">
          {/* Select Topic */}
          <div className="form-group">
            <label className="form-label" htmlFor="counsel-topic">
              Counselling Topic / Agenda <span className="text-red">*</span>
            </label>
            <select
              id="counsel-topic"
              className="form-input form-select"
              value={topic}
              onChange={(e) => setTopic(e.target.value as CounsellingTopic)}
            >
              {topicsList.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Select Assigned Staff */}
          <div className="form-group">
            <label className="form-label" htmlFor="counsel-staff">
              Select Assigned Counsellor or HOD
            </label>
            <select
              id="counsel-staff"
              className="form-input form-select"
              value={selectedCounsellor}
              onChange={(e) => setSelectedCounsellor(e.target.value)}
              disabled={fetchingStaff}
            >
              {counsellors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.title}
                </option>
              ))}
              {counsellors.length === 0 && (
                <option value="">Any Available Departmental Counsellor</option>
              )}
            </select>
          </div>

          {/* Date & Time Slot Grid */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="counsel-date">
                Preferred Date <span className="text-red">*</span>
              </label>
              <input
                id="counsel-date"
                type="date"
                required
                className="form-input"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="counsel-slot">
                Preferred Time Slot
              </label>
              <select
                id="counsel-slot"
                className="form-input form-select"
                value={preferredTimeSlot}
                onChange={(e) => setPreferredTimeSlot(e.target.value)}
              >
                <option value="09:00 AM - 09:45 AM">09:00 AM - 09:45 AM</option>
                <option value="10:00 AM - 10:45 AM">10:00 AM - 10:45 AM</option>
                <option value="11:00 AM - 11:45 AM">11:00 AM - 11:45 AM</option>
                <option value="02:00 PM - 02:45 PM">02:00 PM - 02:45 PM</option>
                <option value="03:00 PM - 03:45 PM">03:00 PM - 03:45 PM</option>
              </select>
            </div>
          </div>

          {/* Meeting Mode */}
          <div className="form-group">
            <label className="form-label">Meeting Format</label>
            <div className="meeting-mode-options">
              <label className={`mode-card-label ${meetingMode === 'IN_PERSON' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="meeting_mode"
                  value="IN_PERSON"
                  checked={meetingMode === 'IN_PERSON'}
                  onChange={() => setMeetingMode('IN_PERSON')}
                />
                <span>🏢 In-Person (Department Office)</span>
              </label>
              <label className={`mode-card-label ${meetingMode === 'VIRTUAL_CALL' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="meeting_mode"
                  value="VIRTUAL_CALL"
                  checked={meetingMode === 'VIRTUAL_CALL'}
                  onChange={() => setMeetingMode('VIRTUAL_CALL')}
                />
                <span>📹 Virtual Video / Call</span>
              </label>
            </div>
          </div>

          {/* Student Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="counsel-notes">
              Specific Questions or Background for Your Counsellor
            </label>
            <textarea
              id="counsel-notes"
              rows={3}
              className="form-textarea"
              placeholder="e.g. I need guidance on preparing for my 400L SIWES defense and tailoring my resume for backend cloud internships..."
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
            ></textarea>
          </div>

          {/* Security Note */}
          <div className="counsel-dossier-note">
            <CheckCircleIcon size={15} color="#059669" />
            <span>
              Your complete Big Five radar, Holland RIASEC code, and verified milestone progress will be automatically attached to this session.
            </span>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary-sm" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary-sm" disabled={loading}>
              {loading ? 'Submitting Request...' : 'Confirm Appointment Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
