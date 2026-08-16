import { useState, type FC } from 'react';
import type { Pathway, PathwayMilestone, StudentMilestoneSubmission } from '../../types/institution';
import { SubmitEvidenceModal } from './SubmitEvidenceModal';
import { CheckCircleIcon, ClockIcon, AlertCircleIcon, ExternalLinkIcon, PlusIcon } from '../icons';

interface StudentRoadmapTimelineProps {
  pathway: Pathway;
  submissions: StudentMilestoneSubmission[];
  studentYearOfStudy: number;
  authToken?: string | null;
  onRefresh: () => Promise<void>;
}

export const StudentRoadmapTimeline: FC<StudentRoadmapTimelineProps> = ({
  pathway,
  submissions,
  authToken,
  onRefresh,
}) => {
  const [selectedMilestoneForSubmit, setSelectedMilestoneForSubmit] = useState<PathwayMilestone | null>(null);

  const durationYears = pathway.duration_years || 4;
  const milestones = pathway.milestones || [];

  // Map submissions by milestone ID
  const submissionMap: Record<string, StudentMilestoneSubmission> = {};
  submissions.forEach((s) => {
    submissionMap[s.milestone] = s;
  });

  // Group milestones by academic year
  const milestonesByYear: Record<number, PathwayMilestone[]> = {};
  for (let yr = 1; yr <= durationYears; yr++) {
    milestonesByYear[yr] = [];
  }

  milestones.forEach((m) => {
    const yr = m.year_of_study || 1;
    if (!milestonesByYear[yr]) milestonesByYear[yr] = [];
    milestonesByYear[yr].push(m);
  });

  const getLevelLabel = (year: number) => {
    if (pathway.award_level === 'ND') {
      return year === 1 ? 'ND I' : 'ND II (Final Year)';
    }
    if (pathway.award_level === 'HND') {
      return year === 1 ? 'HND I' : 'HND II (Final Year)';
    }
    if (pathway.award_level === 'NCE') {
      const roman = ['I', 'II', 'III'][year - 1] || `${year}`;
      return `NCE ${roman} ${year === 3 ? '(Final Year)' : ''}`;
    }
    const isFinal = year === durationYears;
    return `${year * 100} Level ${isFinal ? '(Final Year)' : ''}`;
  };

  return (
    <div className="student-roadmap-timeline">
      <div className="roadmap-header">
        <div>
          <h4>Career Pathway Milestone Roadmap</h4>
          <p>
            Track and complete industry deliverables sequenced for <strong>{pathway.title}</strong>
          </p>
        </div>
      </div>

      <div className="student-levels-flow">
        {Array.from({ length: durationYears }, (_, i) => i + 1).map((year) => {
          const yearMilestones = milestonesByYear[year] || [];
          const yearPoints = yearMilestones.reduce((acc, m) => acc + m.points, 0);

          return (
            <div key={year} className="student-year-block">
              <div className="student-year-header">
                <div className="year-title-row">
                  <span className="year-num-badge">{year}</span>
                  <div>
                    <h5>{getLevelLabel(year)}</h5>
                    <span className="year-meta">{yearMilestones.length} Deliverables · {yearPoints} Total Points</span>
                  </div>
                </div>
              </div>

              <div className="student-milestones-stack">
                {yearMilestones.length === 0 ? (
                  <div className="milestone-empty-slot">No milestones defined for this year.</div>
                ) : (
                  yearMilestones.map((m) => {
                    const sub = submissionMap[m.id];
                    const isVerified = sub?.status === 'VERIFIED';
                    const isPending = sub?.status === 'PENDING_REVIEW';
                    const isChanges = sub?.status === 'CHANGES_REQUESTED';

                    return (
                      <div key={m.id} className={`student-milestone-card ${isVerified ? 'verified-border' : ''}`}>
                        <div className="milestone-card-top-row">
                          <div className="milestone-step-meta">
                            <span className="step-chip">Step #{m.order_index + 1}</span>
                            <span className="type-chip">{m.milestone_type_display || m.milestone_type}</span>
                            <span className="semester-pill">Sem: {m.target_semester}</span>
                          </div>

                          <div className="status-badge-container">
                            {isVerified && (
                              <span className="status-badge verified">
                                <CheckCircleIcon size={12} color="#059669" /> Verified (+{sub.points_awarded} pts)
                              </span>
                            )}
                            {isPending && (
                              <span className="status-badge pending">
                                <ClockIcon size={12} color="#b45309" /> In Review
                              </span>
                            )}
                            {isChanges && (
                              <span className="status-badge changes">
                                <AlertCircleIcon size={12} color="#1d4ed8" /> Changes Requested
                              </span>
                            )}
                            {!sub && (
                              <span className="status-badge not-started">
                                Not Started (+{m.points} pts)
                              </span>
                            )}
                          </div>
                        </div>

                        <h5 className="milestone-name">{m.title}</h5>
                        <p className="milestone-details">{m.description}</p>

                        <div className="milestone-guidelines">
                          <span><strong>Evidence Needed:</strong> {m.required_evidence_type_display || m.required_evidence_type}</span>
                          <span><strong>Evaluation Method:</strong> {m.verification_method_display || m.verification_method}</span>
                        </div>

                        {/* Student Submission Record */}
                        {sub && (
                          <div className="student-submission-summary">
                            <div className="sub-header">
                              <span className="sub-title">Your Submission:</span>
                              <span className="sub-date">{new Date(sub.created_at).toLocaleDateString()}</span>
                            </div>

                            {sub.evidence_url && (
                              <div className="sub-link-row">
                                <span>Evidence URL:</span>
                                <a href={sub.evidence_url} target="_blank" rel="noreferrer" className="evidence-link">
                                  {sub.evidence_url} <ExternalLinkIcon size={12} />
                                </a>
                              </div>
                            )}

                            {sub.submission_notes && (
                              <p className="sub-notes">"{sub.submission_notes}"</p>
                            )}

                            {sub.review_feedback && (
                              <div className="reviewer-feedback-box">
                                <strong>Counsellor Remarks ({sub.reviewed_by_name || 'HOD'}):</strong>
                                <p>{sub.review_feedback}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Card Action Controls */}
                        <div className="milestone-card-actions">
                          {isVerified ? (
                            <span className="verified-lock-tag">
                              <CheckCircleIcon size={13} color="#059669" /> Points Accredited
                            </span>
                          ) : (
                            <button
                              type="button"
                              className={`btn ${sub ? 'btn-secondary-sm' : 'btn-primary-sm'}`}
                              onClick={() => setSelectedMilestoneForSubmit(m)}
                            >
                              {sub ? 'Update Evidence' : <><PlusIcon size={13} /> Submit Technical Evidence</>}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Evidence Modal */}
      {selectedMilestoneForSubmit && (
        <SubmitEvidenceModal
          isOpen={!!selectedMilestoneForSubmit}
          onClose={() => setSelectedMilestoneForSubmit(null)}
          milestone={selectedMilestoneForSubmit}
          existingSubmission={submissionMap[selectedMilestoneForSubmit.id] || null}
          authToken={authToken}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};
