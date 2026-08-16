import { useState, useEffect, type FC } from 'react';
import type {
  CounsellingSession,
  AvailableCounsellor,
  StudentProfile,
} from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { BookCounsellorModal } from './BookCounsellorModal';
import {
  UserCheckIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  BuildingIcon,
  PlusIcon,
  FileTextIcon,
  CompassIcon,
} from '../icons';

interface CounsellingSessionsTabProps {
  studentProfile: StudentProfile;
  authToken?: string;
}

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
      <div className="section-loading-container">
        <div className="spinner"></div>
        <p>Loading scheduled counselling sessions and assigned departmental advisors...</p>
      </div>
    );
  }

  return (
    <div className="counselling-tab-container">
      {/* Top Banner */}
      <div className="counselling-hero-banner">
        <div className="counselling-hero-left">
          <div className="counselling-hero-tag">
            <UserCheckIcon size={14} color="#38bdf8" />
            <span>Seamless Counsellor Handoff</span>
          </div>
          <h2>Departmental Career Counselling & Advisory</h2>
          <p>
            Connect directly with your University HOD, SIWES Coordinator, or Career Advisory Officer.
            Your complete psychometric radar, Holland Code, and verified milestone progress are automatically shared with your counsellor.
          </p>
        </div>

        <div className="counselling-hero-right">
          <button
            type="button"
            className="btn btn-primary btn-book-hero"
            onClick={() => setShowBookModal(true)}
          >
            <PlusIcon size={16} /> Book 1-on-1 Session
          </button>
        </div>
      </div>

      {error && (
        <div className="login-alert-error" style={{ marginBottom: '20px' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left Sessions List, Right Assigned Counsellors Card */}
      <div className="counselling-layout-grid">
        {/* Left Column: Scheduled Appointments & History */}
        <div className="sessions-list-column">
          <div className="column-section-header">
            <h3>Your Counselling Sessions</h3>
            <span className="count-badge">{sessions.length} Sessions</span>
          </div>

          {sessions.length === 0 ? (
            <div className="empty-sessions-card">
              <UserCheckIcon size={36} color="#94a3b8" />
              <h4>No Counselling Sessions Requested Yet</h4>
              <p>
                Have questions about SIWES logbooks, milestone evidence, or career pathway alignment?
                Book a confidential 1-on-1 advisory session with your department counsellor.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowBookModal(true)}
              >
                Schedule First Session
              </button>
            </div>
          ) : (
            <div className="sessions-cards-stack">
              {sessions.map((sess) => {
                const isConfirmed = sess.status === 'CONFIRMED';
                const isRequested = sess.status === 'REQUESTED';
                const isCompleted = sess.status === 'COMPLETED';

                return (
                  <div key={sess.id} className={`session-card ${sess.status.toLowerCase()}`}>
                    <div className="session-card-header">
                      <div className="session-topic-group">
                        <span className="session-topic-title">{sess.topic_display}</span>
                        <div className="session-meta-row">
                          <span className="session-meta-item">
                            <CalendarIcon size={13} /> {sess.preferred_date}
                          </span>
                          <span className="session-meta-item">
                            <ClockIcon size={13} /> {sess.preferred_time_slot}
                          </span>
                          <span className="session-meta-item mode-tag">
                            {sess.meeting_mode === 'IN_PERSON' ? '🏢 In-Person' : '📹 Virtual Call'}
                          </span>
                        </div>
                      </div>

                      <div className="session-status-badge">
                        {isConfirmed && (
                          <span className="status-pill confirmed">
                            <CheckCircleIcon size={13} /> Confirmed
                          </span>
                        )}
                        {isRequested && (
                          <span className="status-pill requested">
                            <ClockIcon size={13} /> Pending Confirmation
                          </span>
                        )}
                        {isCompleted && (
                          <span className="status-pill completed">
                            <CheckCircleIcon size={13} /> Completed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="session-card-body">
                      {sess.counsellor_name && (
                        <div className="assigned-counsellor-strip">
                          <UserCheckIcon size={15} color="#0284c7" />
                          <span>
                            Assigned Advisor: <strong>{sess.counsellor_name}</strong> ({sess.counsellor_title})
                          </span>
                        </div>
                      )}

                      {sess.meeting_location && (
                        <div className="location-strip">
                          <BuildingIcon size={14} color="#64748b" />
                          <span>Venue / Link: {sess.meeting_location}</span>
                        </div>
                      )}

                      {sess.student_notes && (
                        <div className="student-notes-box">
                          <span className="notes-label">Your Note:</span>
                          <p>{sess.student_notes}</p>
                        </div>
                      )}

                      {/* Case Notes & Action Items if present */}
                      {sess.case_notes && sess.case_notes.length > 0 && (
                        <div className="counsellor-remarks-section">
                          <div className="remarks-header">
                            <FileTextIcon size={14} color="#0284c7" />
                            <strong>Counsellor Remarks & Action Items:</strong>
                          </div>
                          {sess.case_notes.map((note) => (
                            <div key={note.id} className="case-note-entry">
                              <p className="note-summary">{note.summary}</p>
                              {note.action_items && note.action_items.length > 0 && (
                                <ul className="action-items-checklist">
                                  {note.action_items.map((act, i) => (
                                    <li key={i} className={act.done ? 'done' : ''}>
                                      <span className="action-bullet">
                                        {act.done ? '✓' : '○'}
                                      </span>
                                      <span className="action-task-text">{act.task}</span>
                                      {act.due_date && (
                                        <span className="action-due-date">Due: {act.due_date}</span>
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Assigned Departmental Advisors Card */}
        <aside className="counsellors-sidebar-column">
          <div className="advisors-panel-card">
            <div className="panel-header">
              <BuildingIcon size={18} color="#0284c7" />
              <h4>Departmental Career Officers</h4>
            </div>
            <p className="panel-desc">
              Accredited faculty advisers available for 1-on-1 roadmap guidance at {studentProfile.institution_name}:
            </p>

            <div className="advisors-list">
              {counsellors.map((c) => (
                <div key={c.id} className="advisor-card-mini">
                  <div className="advisor-avatar">
                    <span>{c.name.charAt(0)}</span>
                  </div>
                  <div className="advisor-info">
                    <strong className="advisor-name">{c.name}</strong>
                    <span className="advisor-title">{c.title}</span>
                    {c.office_location && (
                      <span className="advisor-office">{c.office_location}</span>
                    )}
                  </div>
                </div>
              ))}
              {counsellors.length === 0 && (
                <div className="no-advisors-state">
                  <span>General Departmental Career Services Office</span>
                </div>
              )}
            </div>

            <div className="dossier-preview-callout">
              <CompassIcon size={16} color="#059669" />
              <div>
                <strong>Automatic Dossier Handoff:</strong>
                <p>
                  Your counsellor sees your Big Five radar, Holland code, and verified milestone evidence before your session begins.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Booking Modal */}
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
