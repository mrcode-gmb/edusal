import { useState, useEffect, type FC, type FormEvent } from 'react';
import type { StudentDossier, ActionItem } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import {
  XIcon,
  SparklesIcon,
  BrainIcon,
  CompassIcon,
  FileTextIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
  PlusIcon,
} from '../icons';

interface CounsellorDossierModalProps {
  studentId: string;
  authToken?: string;
  onClose: () => void;
}

export const CounsellorDossierModal: FC<CounsellorDossierModalProps> = ({
  studentId,
  authToken,
  onClose,
}) => {
  const [dossier, setDossier] = useState<StudentDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Case Note State
  const [newNoteSummary, setNewNoteSummary] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  useEffect(() => {
    const loadDossier = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await institutionApi.getStudentDossier(studentId, authToken);
        setDossier(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch student dossier');
      } finally {
        setLoading(false);
      }
    };
    loadDossier();
  }, [studentId, authToken]);

  const handleAddActionItem = () => {
    if (!newTaskText.trim()) return;
    setActionItems((prev) => [...prev, { task: newTaskText.trim(), done: false }]);
    setNewTaskText('');
  };

  const handleRemoveActionItem = (idx: number) => {
    setActionItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveCaseNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNoteSummary.trim() || !dossier) return;

    setSavingNote(true);
    setError(null);
    try {
      const created = await institutionApi.createCaseNote(
        {
          student: dossier.profile.id,
          summary: newNoteSummary.trim(),
          action_items: actionItems,
          is_confidential: true,
        },
        authToken
      );
      setDossier((prev) => (prev ? { ...prev, case_notes: [created, ...prev.case_notes] } : prev));
      setNewNoteSummary('');
      setActionItems([]);
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save case note');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop">
        <div className="modal-content modal-content-lg">
          <div className="section-loading-container">
            <div className="spinner"></div>
            <p>Assembling unified 360° student dossier & psychometric history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="modal-backdrop">
        <div className="modal-content modal-content-md">
          <div className="modal-header">
            <h3>Student Dossier</h3>
            <button type="button" className="btn-modal-close" onClick={onClose}><XIcon size={18} /></button>
          </div>
          <div className="modal-form-body">
            <p>Could not retrieve student dossier data.</p>
          </div>
        </div>
      </div>
    );
  }

  const { profile, active_pathway, submissions, assessments, case_notes, ai_coach_summary, employability_summary } = dossier;

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-content-xl dossier-modal-content">
        {/* Dossier Header */}
        <div className="modal-header dossier-header">
          <div className="dossier-header-left">
            <div className="dossier-avatar">
              <span>{profile.user_name?.charAt(0) || 'S'}</span>
            </div>
            <div>
              <div className="dossier-meta-tags">
                <span className="matric-pill">{profile.matric_number}</span>
                <span className="level-pill">{profile.level_display}</span>
                <span className="inst-pill">{profile.institution_name}</span>
              </div>
              <h2 className="dossier-student-name">{profile.user_name}</h2>
              <p className="dossier-program-sub">
                {profile.program_name} · {profile.department_name}
              </p>
            </div>
          </div>

          <div className="dossier-header-right">
            <div className="dossier-emp-box">
              <span className="emp-label">Accredited Employability:</span>
              <strong className="emp-number">{employability_summary.employability_score.toFixed(1)}%</strong>
              <span className="emp-tier-badge">{employability_summary.tier || 'Developing'}</span>
            </div>
            <button type="button" className="btn-modal-close" onClick={onClose}>
              <XIcon size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="login-alert-error" style={{ margin: '14px 24px 0 24px' }}>
            <AlertCircleIcon size={16} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}

        {/* Dossier Body Tabs/Sections */}
        <div className="dossier-body-grid">
          {/* Left Column: Psychometric Radar & AI Coach Summary */}
          <div className="dossier-col-left">
            {/* 1. Psychometric Assessments & Holland Code */}
            <div className="dossier-section-card">
              <div className="section-card-title-row">
                <BrainIcon size={18} color="#0284c7" />
                <h4>Psychometric & Diagnostic Profile</h4>
              </div>

              {assessments.length === 0 ? (
                <p className="empty-text">No standardized psychometric diagnostics completed yet.</p>
              ) : (
                <div className="dossier-assessments-list">
                  {assessments.map((a) => (
                    <div key={a.id} className="mini-assessment-card">
                      <div className="mini-assess-top">
                        <strong>{a.assessment_title}</strong>
                        <span className="mini-code-badge">{a.summary_code}</span>
                      </div>
                      <div className="mini-traits-bars">
                        {Object.entries(a.dimension_scores).map(([k, v]) => (
                          <div key={k} className="mini-trait-bar-row">
                            <span className="mini-k">{k.replace(/_/g, ' ')}</span>
                            <div className="mini-track">
                              <div className="mini-fill" style={{ width: `${Number(v)}%` }}></div>
                            </div>
                            <span className="mini-v">{v}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. 24/7 AI Coach Chat Synthesis */}
            <div className="dossier-section-card">
              <div className="section-card-title-row">
                <SparklesIcon size={18} color="#38bdf8" />
                <h4>24/7 AI Coach Inquiry Summary</h4>
              </div>
              {ai_coach_summary ? (
                <div className="ai-summary-box">
                  {ai_coach_summary.split('\n').map((line, i) => (
                    <p key={i} className="summary-line">{line}</p>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No recent AI Coach inquiries logged for this student.</p>
              )}
            </div>

            {/* 3. Academic & SIWES Standing */}
            <div className="dossier-section-card">
              <div className="section-card-title-row">
                <CheckCircleIcon size={18} color="#059669" />
                <h4>Institutional Status & Verification</h4>
              </div>
              <div className="dossier-status-grid">
                <div className="status-stat-item">
                  <span className="stat-label">Cumulative GPA:</span>
                  <strong className="stat-val">{profile.cgpa?.toFixed(2) || 'N/A'} / 5.00</strong>
                </div>
                <div className="status-stat-item">
                  <span className="stat-label">Academic Standing:</span>
                  <span className="stat-val standing-good">{profile.academic_standing_display}</span>
                </div>
                <div className="status-stat-item">
                  <span className="stat-label">SIWES Eligibility:</span>
                  <span className="stat-val">{profile.siwes_clearance_status_display}</span>
                </div>
                <div className="status-stat-item">
                  <span className="stat-label">Verified Points:</span>
                  <strong className="stat-val">{profile.verified_points_total} pts</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Pathway Roadmap & Case Notes */}
          <div className="dossier-col-right">
            {/* 4. Active Pathway Deliverables & Milestones */}
            <div className="dossier-section-card">
              <div className="section-card-title-row">
                <CompassIcon size={18} color="#0284c7" />
                <h4>Enrolled Pathway: {active_pathway?.title || 'None'}</h4>
              </div>

              <div className="dossier-milestones-stream">
                {submissions.map((sub) => (
                  <div key={sub.id} className={`dossier-sub-item ${sub.status.toLowerCase()}`}>
                    <div className="dossier-sub-top">
                      <strong className="milestone-name">{sub.milestone_title}</strong>
                      <span className={`status-badge-mini ${sub.status.toLowerCase()}`}>
                        {sub.status_display}
                      </span>
                    </div>
                    {sub.evidence_url && (
                      <a
                        href={sub.evidence_url}
                        target="_blank"
                        rel="noreferrer"
                        className="evidence-link-btn"
                      >
                        <ExternalLinkIcon size={13} /> View Submission Repo / Evidence
                      </a>
                    )}
                    {sub.review_feedback && (
                      <p className="feedback-text">Feedback: {sub.review_feedback}</p>
                    )}
                  </div>
                ))}
                {submissions.length === 0 && (
                  <p className="empty-text">No technical deliverables submitted for review yet.</p>
                )}
              </div>
            </div>

            {/* 5. Confidential Counselling Case Notes */}
            <div className="dossier-section-card">
              <div className="section-card-title-row">
                <FileTextIcon size={18} color="#0284c7" />
                <h4>Confidential Counselling Case Notes</h4>
              </div>

              {/* Add New Case Note Form */}
              <form onSubmit={handleSaveCaseNote} className="add-case-note-form">
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Record session takeaways, technical obstacles, or career guidance given..."
                  value={newNoteSummary}
                  onChange={(e) => setNewNoteSummary(e.target.value)}
                  required
                ></textarea>

                {/* Action Items List */}
                <div className="action-items-builder">
                  <div className="builder-input-row">
                    <input
                      type="text"
                      className="form-input form-input-sm"
                      placeholder="Add an actionable follow-up task (e.g. submit Docker repo by Friday)..."
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary-sm"
                      onClick={handleAddActionItem}
                    >
                      <PlusIcon size={13} /> Add Task
                    </button>
                  </div>

                  {actionItems.length > 0 && (
                    <ul className="builder-items-list">
                      {actionItems.map((act, idx) => (
                        <li key={idx}>
                          <span>• {act.task}</span>
                          <button
                            type="button"
                            className="btn-remove-item"
                            onClick={() => handleRemoveActionItem(idx)}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="note-submit-row">
                  {noteSuccess && <span className="note-success-text">✓ Case note saved!</span>}
                  <button
                    type="submit"
                    className="btn btn-primary-sm btn-save-note"
                    disabled={savingNote || !newNoteSummary.trim()}
                  >
                    {savingNote ? 'Saving...' : 'Save Case Note to Dossier'}
                  </button>
                </div>
              </form>

              {/* Past Case Notes History */}
              <div className="past-notes-history">
                {case_notes.map((note) => (
                  <div key={note.id} className="case-note-card">
                    <div className="note-author-row">
                      <strong>{note.author_name} ({note.author_title})</strong>
                      <span className="note-date">{new Date(note.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="note-body">{note.summary}</p>
                    {note.action_items && note.action_items.length > 0 && (
                      <ul className="note-actions-checklist">
                        {note.action_items.map((act, i) => (
                          <li key={i} className={act.done ? 'done' : ''}>
                            {act.done ? '✓' : '○'} {act.task}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
