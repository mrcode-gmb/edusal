import { useState, useEffect, type FC } from 'react';
import type { CounsellingSession, AvailableCounsellor, StudentProfile } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { BookCounsellorModal } from './BookCounsellorModal';
import { PageHead, Panel } from '../institution/Shared';
import { Button, Chip, CircularProgress } from '@mui/material';
import {
  SupportAgent as UserCheckIcon,
  CalendarMonth as CalendarIcon,
  Schedule as ClockIcon,
  LocationOn as BuildingIcon,
  Add as PlusIcon,
  Description as FileTextIcon,
  Explore as CompassIcon,
} from '@mui/icons-material';

interface CounsellingSessionsTabProps {
  studentProfile: StudentProfile;
  authToken?: string;
}

const STATUS_CHIP: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  CONFIRMED: { label: 'Confirmed', bg: 'var(--color-primary-soft)', color: 'var(--color-primary)' },
  REQUESTED: { label: 'Pending Confirmation', bg: '#fef3c7', color: '#92400e' },
  COMPLETED: { label: 'Completed', bg: '#dcfce7', color: 'var(--color-signoff)' },
  RESCHEDULED: { label: 'Rescheduled', bg: '#ede9fe', color: '#5b21b6' },
  CANCELLED: { label: 'Cancelled', bg: '#fee2e2', color: '#b91c1c' },
};

export const CounsellingSessionsTab: FC<CounsellingSessionsTabProps> = ({
  studentProfile,
  authToken,
}) => {
  const [sessions, setSessions] = useState<CounsellingSession[]>([]);
  const [counsellors, setCounsellors] = useState<AvailableCounsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sessList, staffList] = await Promise.all([
        institutionApi.getMyCounsellingSessions(authToken),
        institutionApi.getAvailableCounsellors(
          studentProfile.institution,
          studentProfile.department_id,
          authToken
        ),
      ]);
      setSessions(sessList);
      setCounsellors(staffList);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load counselling sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentProfile.id, authToken]);

  const handleBookingSuccess = (newSession: CounsellingSession) => {
    setShowBookModal(false);
    setSessions((prev) => [newSession, ...prev]);
  };

  if (loading) {
    return (
      <Panel>
        <div className="flex flex-col items-center justify-center py-16">
          <CircularProgress size={40} sx={{ color: 'primary.main' }} />
          <p className="mt-4 text-sm text-charcoal-faint">
            Loading scheduled counselling sessions and assigned departmental advisors...
          </p>
        </div>
      </Panel>
    );
  }

  return (
    <div>
      <PageHead
        eyebrow="Counsellor Handoff"
        title="Departmental Career Counselling & Advisory"
        sub="Connect directly with your University HOD, SIWES Coordinator, or Career Advisory Officer. Your complete psychometric radar, Holland Code, and verified milestone progress are automatically shared with your counsellor."
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlusIcon />}
            onClick={() => setShowBookModal(true)}
          >
            Book 1-on-1 Session
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-[15px] bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-charcoal">Your Counselling Sessions</h3>
            <Chip
              size="small"
              label={`${sessions.length} Sessions`}
              sx={{ bgcolor: 'primary.soft', color: 'primary.main', fontWeight: 700 }}
            />
          </div>

          {sessions.length === 0 ? (
            <Panel>
              <div className="flex flex-col items-center py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-[15px] bg-bgsoft">
                  <UserCheckIcon sx={{ fontSize: 28, color: 'charcoal.faint' }} />
                </span>
                <h4 className="mt-4 text-lg font-bold text-charcoal">
                  No Counselling Sessions Requested Yet
                </h4>
                <p className="mx-auto mt-1 max-w-md text-sm text-charcoal-faint">
                  Have questions about SIWES logbooks, milestone evidence, or career pathway
                  alignment? Book a confidential 1-on-1 advisory session with your department
                  counsellor.
                </p>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 5 }}
                  startIcon={<PlusIcon />}
                  onClick={() => setShowBookModal(true)}
                >
                  Schedule First Session
                </Button>
              </div>
            </Panel>
          ) : (
            <div className="space-y-4">
              {sessions.map((sess) => {
                const statusMeta = STATUS_CHIP[sess.status] || {
                  label: sess.status_display || sess.status,
                  bg: 'var(--color-bgsoft)',
                  color: 'var(--color-charcoal-soft)',
                };

                return (
                  <Panel key={sess.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-[15px] font-bold text-charcoal">{sess.topic_display}</h4>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal-faint">
                          <span className="flex items-center gap-1">
                            <CalendarIcon sx={{ fontSize: 13 }} /> {sess.preferred_date}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon sx={{ fontSize: 13 }} /> {sess.preferred_time_slot}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-charcoal-soft">
                            {sess.meeting_mode === 'IN_PERSON' ? 'In-Person' : 'Virtual Call'}
                          </span>
                        </div>
                      </div>
                      <Chip
                        size="small"
                        label={statusMeta.label}
                        sx={{ bgcolor: statusMeta.bg, color: statusMeta.color, fontWeight: 700 }}
                      />
                    </div>

                    <div className="mt-4 space-y-2.5 border-t border-line pt-4">
                      {sess.counsellor_name && (
                        <p className="flex items-center gap-2 text-sm text-charcoal-soft">
                          <UserCheckIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                          Assigned Advisor:{' '}
                          <strong className="text-charcoal">{sess.counsellor_name}</strong>
                          {sess.counsellor_title ? ` (${sess.counsellor_title})` : ''}
                        </p>
                      )}
                      {sess.meeting_location && (
                        <p className="flex items-center gap-2 text-sm text-charcoal-soft">
                          <BuildingIcon sx={{ fontSize: 14, color: 'charcoal.faint' }} />
                          Venue / Link: {sess.meeting_location}
                        </p>
                      )}
                      {sess.student_notes && (
                        <div className="rounded-[15px] bg-bgsoft p-3.5">
                          <span className="text-xs font-bold text-charcoal-faint">Your Note:</span>
                          <p className="mt-0.5 text-sm text-charcoal-soft">{sess.student_notes}</p>
                        </div>
                      )}

                      {sess.case_notes && sess.case_notes.length > 0 && (
                        <div className="rounded-[15px] bg-primary-faint p-3.5">
                          <p className="flex items-center gap-2 text-sm font-bold text-charcoal">
                            <FileTextIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                            Counsellor Remarks & Action Items
                          </p>
                          {sess.case_notes.map((note) => (
                            <div key={note.id} className="mt-2">
                              <p className="text-sm text-charcoal-soft">{note.summary}</p>
                              {note.action_items && note.action_items.length > 0 && (
                                <ul className="mt-2 space-y-1.5">
                                  {note.action_items.map((act, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                      <span
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                          act.done
                                            ? 'bg-signoff text-white'
                                            : 'border border-line-strong bg-white text-transparent'
                                        }`}
                                      >
                                        ✓
                                      </span>
                                      <span
                                        className={
                                          act.done
                                            ? 'text-charcoal-faint line-through'
                                            : 'text-charcoal-soft'
                                        }
                                      >
                                        {act.task}
                                      </span>
                                      {act.due_date && (
                                        <span className="text-xs text-charcoal-faint">
                                          Due: {act.due_date}
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Panel>
                );
              })}
            </div>
          )}
        </div>

        <aside>
          <Panel>
            <p className="flex items-center gap-2 text-base font-bold text-charcoal">
              <BuildingIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              Departmental Career Officers
            </p>
            <p className="mt-1 text-sm text-charcoal-faint">
              Accredited faculty advisers available for 1-on-1 roadmap guidance at{' '}
              {studentProfile.institution_name}:
            </p>

            <div className="mt-4 space-y-2.5">
              {counsellors.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-[15px] bg-bgsoft p-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white">
                    {c.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <strong className="block truncate text-sm font-bold text-charcoal">
                      {c.name}
                    </strong>
                    <span className="block truncate text-xs text-charcoal-faint">{c.title}</span>
                    {c.office_location && (
                      <span className="block truncate text-xs text-charcoal-faint">
                        {c.office_location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {counsellors.length === 0 && (
                <div className="rounded-[15px] bg-bgsoft p-4 text-sm text-charcoal-faint">
                  General Departmental Career Services Office
                </div>
              )}
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-[15px] bg-primary-soft/50 p-4">
              <CompassIcon sx={{ fontSize: 16, color: 'var(--color-signoff)', mt: 0.25 }} />
              <div>
                <strong className="block text-sm font-bold text-charcoal">
                  Automatic Dossier Handoff
                </strong>
                <p className="mt-0.5 text-sm text-charcoal-soft">
                  Your counsellor sees your Big Five radar, Holland code, and verified milestone
                  evidence before your session begins.
                </p>
              </div>
            </div>
          </Panel>
        </aside>
      </div>

      {showBookModal && (
        <BookCounsellorModal
          institutionId={studentProfile.institution}
          departmentId={studentProfile.department_id}
          studentId={studentProfile.id}
          authToken={authToken}
          onClose={() => setShowBookModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};