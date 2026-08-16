import { useState, type FC, type FormEvent } from 'react';
import type { PathwayMilestone, StudentMilestoneSubmission } from '../../types/institution';
import { institutionApi } from '../../services/institutionApi';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material';
import { Explore as CompassIcon, Close as CloseIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

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
    <Dialog
      open={isOpen}
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
        <div className="flex items-start gap-2">
          <CompassIcon sx={{ fontSize: 22, color: 'primary.main', mt: 0.5 }} />
          <div>
            <p className="text-base font-bold text-charcoal">
              {existingSubmission ? 'Update Milestone Evidence' : 'Submit Milestone Evidence'}
            </p>
            <p className="mt-0.5 text-sm text-charcoal-faint">
              Submit proof of technical completion for departmental counsellor evaluation
            </p>
          </div>
        </div>
        <IconButton size="medium" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1 }}>
        <div className="rounded-[15px] bg-primary-soft/40 p-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
              Step #{milestone.order_index + 1}
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-charcoal-soft">
              {milestone.milestone_type_display || milestone.milestone_type}
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-primary">
              +{milestone.points} Points
            </span>
          </div>
          <h4 className="mt-3 text-[15px] font-bold text-charcoal">{milestone.title}</h4>
          <p className="mt-1 text-sm text-charcoal-soft">{milestone.description}</p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-charcoal-faint">
            <span>
              <strong className="text-charcoal">Required Evidence:</strong>{' '}
              {milestone.required_evidence_type_display || milestone.required_evidence_type}
            </span>
            <span>
              <strong className="text-charcoal">Verification Method:</strong>{' '}
              {milestone.verification_method_display || milestone.verification_method}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <TextField
            fullWidth
            size="medium"
            label="Evidence Repository / Live Demo URL"
            placeholder="e.g. https://github.com/myusername/my-project-repo or https://my-app.vercel.app"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            helperText="Provide a valid link to your public GitHub repo, live deployment, or portfolio work."
          />
          <TextField
            fullWidth
            size="medium"
            label="Student Submission Notes & Architecture Context"
            multiline
            rows={4}
            placeholder="Describe your implementation, libraries used, architectural decisions, or SIWES context for your reviewer..."
            value={submissionNotes}
            onChange={(e) => setSubmissionNotes(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClose}
              sx={{ color: 'charcoal.soft', borderColor: 'border.strong' }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                'Submitting Evidence...'
              ) : (
                <>
                  <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5 }} /> Submit for Review
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};