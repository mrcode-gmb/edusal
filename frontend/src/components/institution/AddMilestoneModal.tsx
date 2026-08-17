import { useState, type FC, type FormEvent } from 'react';
import type { PathwayMilestone, MilestoneType, VerificationMethod, RequiredEvidenceType } from '../../types/institution';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
} from '@mui/material';
import { Explore as CompassIcon, Close as CloseIcon, Verified as CheckCircleIcon } from '@mui/icons-material';

interface AddMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  pathwayId: string;
  durationYears: number;
  existingMilestone?: PathwayMilestone | null;
  onSuccess: () => Promise<void>;
  saveFn: (payload: Partial<PathwayMilestone>, token?: string) => Promise<any>;
  authToken?: string | null;
}

export const AddMilestoneModal: FC<AddMilestoneModalProps> = ({
  isOpen,
  onClose,
  pathwayId,
  durationYears,
  existingMilestone,
  onSuccess,
  saveFn,
  authToken,
}) => {
  const [title, setTitle] = useState(existingMilestone?.title || '');
  const [description, setDescription] = useState(existingMilestone?.description || '');
  const [yearOfStudy, setYearOfStudy] = useState(existingMilestone?.year_of_study || 1);
  const [targetSemester, setTargetSemester] = useState<'FIRST' | 'SECOND' | 'BOTH'>(
    existingMilestone?.target_semester || 'FIRST'
  );
  const [milestoneType, setMilestoneType] = useState<MilestoneType>(
    existingMilestone?.milestone_type || 'TECHNICAL_SKILL'
  );
  const [points, setPoints] = useState(existingMilestone?.points || 100);
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>(
    existingMilestone?.verification_method || 'SUPERVISOR_SIGN_OFF'
  );
  const [requiredEvidenceType, setRequiredEvidenceType] = useState<RequiredEvidenceType>(
    existingMilestone?.required_evidence_type || 'GITHUB_REPO'
  );
  const [tagsInput, setTagsInput] = useState(
    existingMilestone?.competency_tags?.join(', ') || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const competency_tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload: Partial<PathwayMilestone> = {
        pathway: pathwayId,
        title: title.trim(),
        description: description.trim(),
        year_of_study: Number(yearOfStudy),
        target_level_code: `${yearOfStudy * 100}`,
        target_semester: targetSemester,
        milestone_type: milestoneType,
        points: Number(points),
        is_mandatory: true,
        verification_method: verificationMethod,
        required_evidence_type: requiredEvidenceType,
        competency_tags,
      };

      if (existingMilestone) {
        payload.id = existingMilestone.id;
      }

      await saveFn(payload, authToken || undefined);
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save milestone');
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
              {existingMilestone ? 'Edit Pathway Milestone' : 'Add Verifiable Milestone'}
            </p>
            <p className="mt-0.5 text-sm text-charcoal-faint">
              Define an industry-aligned milestone with measurable rubric criteria and points
            </p>
          </div>
        </div>
        <IconButton size="medium" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 1 }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField
            fullWidth
            size="medium"
            label="Milestone Title"
            required
            placeholder="e.g. Relational Database Normalization & PostgreSQL Schema Design"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            fullWidth
            size="medium"
            multiline
            rows={4}
            label="Deliverable Description & Rubric Criteria"
            required
            placeholder="Detail specific deliverables, criteria, and requirements needed for counsellor sign-off..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              fullWidth
              size="medium"
              select
              label="Target Level / Year"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(Number(e.target.value))}
            >
              {Array.from({ length: durationYears || 4 }, (_, i) => i + 1).map((yr) => (
                <MenuItem key={yr} value={yr}>
                  Year {yr} ({yr * 100} Level)
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              size="medium"
              select
              label="Target Semester"
              value={targetSemester}
              onChange={(e) => setTargetSemester(e.target.value as any)}
            >
              <MenuItem value="FIRST">First Semester</MenuItem>
              <MenuItem value="SECOND">Second Semester</MenuItem>
              <MenuItem value="BOTH">Both Semesters / Annual</MenuItem>
            </TextField>
            <TextField
              fullWidth
              size="medium"
              label="Employability Points"
              type="number"
              required
              slotProps={{ htmlInput: { min: 10, max: 500, step: 10 } }}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              size="medium"
              select
              label="Milestone Type"
              value={milestoneType}
              onChange={(e) => setMilestoneType(e.target.value as MilestoneType)}
            >
              <MenuItem value="TECHNICAL_SKILL">Technical Skill Mastery</MenuItem>
              <MenuItem value="GITHUB_PROJECT">Production Repository / Live App</MenuItem>
              <MenuItem value="INDUSTRY_CERTIFICATION">Industry Recognized Certification</MenuItem>
              <MenuItem value="SIWES_PREREQUISITE">SIWES / ITCC Clearance Prerequisite</MenuItem>
              <MenuItem value="INTERNSHIP_EXPERIENCE">Internship / Work Placement</MenuItem>
              <MenuItem value="CAPSTONE_PROJECT">Final Year Capstone Project Defense</MenuItem>
              <MenuItem value="FOUNDATIONAL_COURSEWORK">Foundational Coursework Prerequisite</MenuItem>
              <MenuItem value="CAREER_READINESS">Portfolio & Interview Readiness</MenuItem>
            </TextField>
            <TextField
              fullWidth
              size="medium"
              select
              label="Verification Method"
              value={verificationMethod}
              onChange={(e) => setVerificationMethod(e.target.value as VerificationMethod)}
            >
              <MenuItem value="SUPERVISOR_SIGN_OFF">Counsellor / HOD Sign-Off</MenuItem>
              <MenuItem value="URL_VERIFICATION">Live URL / Repository Review</MenuItem>
              <MenuItem value="DOCUMENT_UPLOAD">Certificate / Document PDF Upload</MenuItem>
              <MenuItem value="AUTOMATED_ASSESSMENT">Automated Skill Check / Quiz</MenuItem>
            </TextField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              fullWidth
              size="medium"
              select
              label="Required Evidence Submission"
              value={requiredEvidenceType}
              onChange={(e) => setRequiredEvidenceType(e.target.value as RequiredEvidenceType)}
            >
              <MenuItem value="GITHUB_REPO">GitHub / GitLab Repository URL</MenuItem>
              <MenuItem value="LIVE_URL">Live Deployed Project URL</MenuItem>
              <MenuItem value="CERTIFICATE_PDF">Certificate PDF / Verified Credential</MenuItem>
              <MenuItem value="PORTFOLIO_LINK">Portfolio Link (Behance / Web)</MenuItem>
              <MenuItem value="SUPERVISOR_ENDORSEMENT">Faculty / Industry Supervisor Form</MenuItem>
            </TextField>
            <TextField
              fullWidth
              size="medium"
              label="Competency Tags (comma-separated)"
              placeholder="e.g. PostgreSQL, Docker, Django, CI/CD"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClose}
              sx={{ color: 'charcoal.soft', borderColor: 'border.strong' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={<CheckCircleIcon />}
            >
              {isSubmitting ? 'Saving Milestone...' : 'Save Milestone'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};