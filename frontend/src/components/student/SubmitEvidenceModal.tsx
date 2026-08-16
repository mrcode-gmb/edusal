import { useState, type FC, type FormEvent } from 'react';
import type { PathwayMilestone, StudentMilestoneSubmission } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { CompassIcon, CheckCircleIcon } from '../icons';

interface SubmitEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: PathwayMilestone;
  existingSubmission?: StudentMilestoneSubmission | null;
  authToken?: string | null;
  onSuccess: () => Promise<void>;
}

export const SubmitEvidenceModal: FC<SubmitEvidenceModalProps> = ({
  isOpen,
  onClose,
  milestone,
  existingSubmission,
  authToken,
  onSuccess,
}) => {
  const [evidenceUrl, setEvidenceUrl] = useState(existingSubmission?.evidence_url || '');
  const [submissionNotes, setSubmissionNotes] = useState(existingSubmission?.submission_notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!evidenceUrl.trim() && !submissionNotes.trim()) {
      alert('Please provide either an evidence URL (GitHub/Live URL) or contextual submission notes.');
      return;
    }

    setIsSubmitting(true);
    try {
      await institutionApi.submitMilestoneEvidence(
        {
          milestone: milestone.id,
          evidence_url: evidenceUrl.trim() || undefined,
          submission_notes: submissionNotes.trim() || undefined,
        },
        authToken || undefined
      );
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit milestone evidence');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <CompassIcon size={20} color="#0284c7" />
            <div>
              <h3>{existingSubmission ? 'Update Milestone Evidence' : 'Submit Milestone Evidence'}</h3>
              <p>Submit proof of technical completion for departmental counsellor evaluation</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Milestone Requirement Summary */}
        <div className="submission-milestone-banner">
          <div className="banner-top-row">
            <span className="step-tag">Step #{milestone.order_index + 1}</span>
            <span className="type-tag">{milestone.milestone_type_display || milestone.milestone_type}</span>
            <span className="pts-tag">+{milestone.points} Points</span>
          </div>
          <h4>{milestone.title}</h4>
          <p className="banner-desc">{milestone.description}</p>
          <div className="banner-rules">
            <span><strong>Required Evidence:</strong> {milestone.required_evidence_type_display || milestone.required_evidence_type}</span>
            <span><strong>Verification Method:</strong> {milestone.verification_method_display || milestone.verification_method}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Evidence Repository / Live Demo URL *</label>
            <input
              type="url"
              placeholder="e.g. https://github.com/myusername/my-project-repo or https://my-app.vercel.app"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
            />
            <span className="field-hint">
              Provide a valid link to your public GitHub repo, live deployment, or portfolio work.
            </span>
          </div>

          <div className="form-group">
            <label>Student Submission Notes & Architecture Context</label>
            <textarea
              rows={3}
              placeholder="Describe your implementation, libraries used, architectural decisions, or SIWES context for your reviewer..."
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                'Submitting Evidence...'
              ) : (
                <>
                  <CheckCircleIcon size={14} /> Submit for Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
