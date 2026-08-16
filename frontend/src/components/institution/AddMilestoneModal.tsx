import { useState, type FC, type FormEvent } from 'react';
import type { PathwayMilestone, MilestoneType, VerificationMethod, RequiredEvidenceType } from '../../types/institution';
import { CompassIcon, CheckCircleIcon } from '../icons';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <CompassIcon size={20} color="#0284c7" />
            <div>
              <h3>{existingMilestone ? 'Edit Pathway Milestone' : 'Add Verifiable Milestone'}</h3>
              <p>Define an industry-aligned milestone with measurable rubric criteria and points</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Milestone Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Relational Database Normalization & PostgreSQL Schema Design"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Deliverable Description & Rubric Criteria *</label>
            <textarea
              rows={3}
              required
              placeholder="Detail specific deliverables, criteria, and requirements needed for counsellor sign-off..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label>Target Level / Year *</label>
              <select value={yearOfStudy} onChange={(e) => setYearOfStudy(Number(e.target.value))}>
                {Array.from({ length: durationYears || 4 }, (_, i) => i + 1).map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr} ({yr * 100} Level)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Target Semester *</label>
              <select
                value={targetSemester}
                onChange={(e) => setTargetSemester(e.target.value as any)}
              >
                <option value="FIRST">First Semester</option>
                <option value="SECOND">Second Semester</option>
                <option value="BOTH">Both Semesters / Annual</option>
              </select>
            </div>

            <div className="form-group">
              <label>Employability Points *</label>
              <input
                type="number"
                min="10"
                max="500"
                step="10"
                required
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Milestone Type *</label>
              <select
                value={milestoneType}
                onChange={(e) => setMilestoneType(e.target.value as MilestoneType)}
              >
                <option value="TECHNICAL_SKILL">Technical Skill Mastery</option>
                <option value="GITHUB_PROJECT">Production Repository / Live App</option>
                <option value="INDUSTRY_CERTIFICATION">Industry Recognized Certification</option>
                <option value="SIWES_PREREQUISITE">SIWES / ITCC Clearance Prerequisite</option>
                <option value="INTERNSHIP_EXPERIENCE">Internship / Work Placement</option>
                <option value="CAPSTONE_PROJECT">Final Year Capstone Project Defense</option>
                <option value="FOUNDATIONAL_COURSEWORK">Foundational Coursework Prerequisite</option>
                <option value="CAREER_READINESS">Portfolio & Interview Readiness</option>
              </select>
            </div>

            <div className="form-group">
              <label>Verification Method *</label>
              <select
                value={verificationMethod}
                onChange={(e) => setVerificationMethod(e.target.value as VerificationMethod)}
              >
                <option value="SUPERVISOR_SIGN_OFF">Counsellor / HOD Sign-Off</option>
                <option value="URL_VERIFICATION">Live URL / Repository Review</option>
                <option value="DOCUMENT_UPLOAD">Certificate / Document PDF Upload</option>
                <option value="AUTOMATED_ASSESSMENT">Automated Skill Check / Quiz</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Required Evidence Submission *</label>
              <select
                value={requiredEvidenceType}
                onChange={(e) => setRequiredEvidenceType(e.target.value as RequiredEvidenceType)}
              >
                <option value="GITHUB_REPO">GitHub / GitLab Repository URL</option>
                <option value="LIVE_URL">Live Deployed Project URL</option>
                <option value="CERTIFICATE_PDF">Certificate PDF / Verified Credential</option>
                <option value="PORTFOLIO_LINK">Portfolio Link (Behance / Web)</option>
                <option value="SUPERVISOR_ENDORSEMENT">Faculty / Industry Supervisor Form</option>
              </select>
            </div>

            <div className="form-group">
              <label>Competency Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. PostgreSQL, Docker, Django, CI/CD"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                'Saving Milestone...'
              ) : (
                <>
                  <CheckCircleIcon size={14} /> Save Milestone
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
